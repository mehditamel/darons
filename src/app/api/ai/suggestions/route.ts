import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaude, parseJsonResponse } from "@/lib/ai/anthropic";
import { ACTIVITY_SUGGESTIONS_PROMPT } from "@/lib/ai/prompts";
import { PLAN_LIMITS, AI_MONTHLY_LIMITS } from "@/lib/constants";
import { differenceInMonths, format } from "date-fns";
import type { ActivitySuggestion } from "@/types/ai";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { childId } = body as { childId: string };
  if (!childId) {
    return NextResponse.json({ error: "childId requis" }, { status: 400 });
  }

  // Check plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.subscription_plan ?? "free") as keyof typeof PLAN_LIMITS;
  if (!PLAN_LIMITS[plan].hasAiCoach) {
    return NextResponse.json(
      { error: "Les suggestions IA nécessitent un abonnement Premium ou Family Pro." },
      { status: 403 }
    );
  }

  // Check quota
  const { data: household } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!household) {
    return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });
  }

  const currentMonth = new Date();
  currentMonth.setDate(1);
  const monthStr = currentMonth.toISOString().split("T")[0];

  const { data: usage } = await supabase
    .from("ai_usage")
    .select("call_count")
    .eq("household_id", household.id)
    .eq("month", monthStr)
    .single();

  const used = usage?.call_count ?? 0;
  if (used >= AI_MONTHLY_LIMITS[plan]) {
    return NextResponse.json(
      { error: "Vous avez atteint votre limite mensuelle de consultations IA." },
      { status: 429 }
    );
  }

  // Get child info
  const { data: child } = await supabase
    .from("family_members")
    .select("first_name, birth_date")
    .eq("id", childId)
    .single();

  if (!child) {
    return NextResponse.json({ error: "Enfant introuvable" }, { status: 404 });
  }

  const ageMonths = differenceInMonths(new Date(), new Date(child.birth_date));

  // Get current activities
  const { data: activities } = await supabase
    .from("activities")
    .select("name, category")
    .eq("member_id", childId)
    .eq("active", true);

  const now = new Date();
  const season =
    now.getMonth() >= 2 && now.getMonth() <= 4
      ? "printemps"
      : now.getMonth() >= 5 && now.getMonth() <= 7
        ? "été"
        : now.getMonth() >= 8 && now.getMonth() <= 10
          ? "automne"
          : "hiver";

  const userMessage = `ENFANT : ${child.first_name}, né le ${child.birth_date} (âge : ${ageMonths} mois)
ACTIVITÉS EN COURS : ${JSON.stringify(activities ?? [])}
SAISON : ${season}
DATE : ${format(now, "MMMM yyyy")}`;

  try {
    const response = await callClaude(ACTIVITY_SUGGESTIONS_PROMPT, userMessage);
    const parsed = parseJsonResponse<{ suggestions: ActivitySuggestion[] }>(response);

    // Increment usage
    if (usage) {
      await supabase
        .from("ai_usage")
        .update({ call_count: used + 1, updated_at: new Date().toISOString() })
        .eq("household_id", household.id)
        .eq("month", monthStr);
    } else {
      await supabase.from("ai_usage").insert({
        household_id: household.id,
        month: monthStr,
        call_count: 1,
      });
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Le coach IA est momentanément indisponible. Réessayez dans quelques minutes." },
      { status: 500 }
    );
  }
}
