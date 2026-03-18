import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaude, parseJsonResponse } from "@/lib/ai/anthropic";
import { BUDGET_COACH_PROMPT } from "@/lib/ai/prompts";
import { PLAN_LIMITS, AI_MONTHLY_LIMITS } from "@/lib/constants";
import type { AiCoachResponse } from "@/types/ai";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Get profile and check plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.subscription_plan ?? "free") as keyof typeof PLAN_LIMITS;
  if (!PLAN_LIMITS[plan].hasAiCoach) {
    return NextResponse.json(
      { error: "Le coach IA nécessite un abonnement Premium ou Family Pro." },
      { status: 403 }
    );
  }

  // Check AI usage quota
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

  // Collect budget data
  const { data: budgetEntries } = await supabase
    .from("budget_entries")
    .select("*")
    .eq("household_id", household.id)
    .order("month", { ascending: false })
    .limit(100);

  const { data: allocations } = await supabase
    .from("caf_allocations")
    .select("*")
    .eq("household_id", household.id)
    .eq("active", true);

  const { data: members } = await supabase
    .from("family_members")
    .select("first_name, member_type")
    .eq("household_id", household.id);

  const userMessage = `CONTEXTE FOYER : ${JSON.stringify({ membres: members ?? [] })}
TRANSACTIONS DU MOIS : ${JSON.stringify(budgetEntries ?? [])}
ALLOCATIONS CAF : ${JSON.stringify(allocations ?? [])}`;

  try {
    const response = await callClaude(BUDGET_COACH_PROMPT, userMessage);
    const parsed = parseJsonResponse<AiCoachResponse>(response);

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
