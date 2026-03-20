import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaude, parseJsonResponse } from "@/lib/ai/anthropic";
import { MONTHLY_SUMMARY_PROMPT } from "@/lib/ai/prompts";
import { PLAN_LIMITS, AI_MONTHLY_LIMITS } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import type { MonthlySummary } from "@/types/ai";

export async function POST() {
  const limited = rateLimit("ai-summary", 3, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
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
      { error: "Le résumé mensuel nécessite un abonnement Premium ou Family Pro." },
      { status: 403 }
    );
  }

  const { data: household } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!household) {
    return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });
  }

  // Check if summary already exists for this month
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const monthStr = currentMonth.toISOString().split("T")[0];

  const { data: existingSummary } = await supabase
    .from("ai_monthly_summaries")
    .select("*")
    .eq("household_id", household.id)
    .eq("month", monthStr)
    .single();

  if (existingSummary) {
    return NextResponse.json({
      month: monthStr,
      health: existingSummary.health,
      development: existingSummary.development,
      budget: existingSummary.budget,
      admin: existingSummary.admin,
      priorities: existingSummary.priorities,
      generatedAt: existingSummary.generated_at,
    } satisfies MonthlySummary);
  }

  // Check quota
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

  // Collect household data for the past month
  const lastMonth = subMonths(new Date(), 1);
  const lastMonthStr = format(lastMonth, "yyyy-MM-01");

  const [membersRes, vaccsRes, budgetRes, allocsRes, docsRes] = await Promise.all([
    supabase.from("family_members").select("*").eq("household_id", household.id),
    supabase
      .from("vaccinations")
      .select("*, family_members!inner(first_name, household_id)")
      .eq("family_members.household_id", household.id)
      .gte("administered_date", lastMonthStr),
    supabase
      .from("budget_entries")
      .select("*")
      .eq("household_id", household.id)
      .eq("month", lastMonthStr),
    supabase.from("caf_allocations").select("*").eq("household_id", household.id).eq("active", true),
    supabase
      .from("identity_documents")
      .select("*, family_members!inner(first_name, household_id)")
      .eq("family_members.household_id", household.id),
  ]);

  const monthLabel = format(lastMonth, "MMMM yyyy", { locale: fr });

  const userMessage = `DONNÉES DU MOIS : ${JSON.stringify({
    membres: membersRes.data ?? [],
    vaccinsEffectues: vaccsRes.data ?? [],
    budget: budgetRes.data ?? [],
    allocations: allocsRes.data ?? [],
    documents: (docsRes.data ?? []).map((d) => ({
      type: d.document_type,
      status: d.status,
      expiryDate: d.expiry_date,
      membre: d.family_members?.first_name,
    })),
  })}
MOIS : ${monthLabel}`;

  try {
    const response = await callClaude(MONTHLY_SUMMARY_PROMPT, userMessage, 1500);
    const parsed = parseJsonResponse<Omit<MonthlySummary, "month" | "generatedAt">>(response);

    // Save to cache
    await supabase.from("ai_monthly_summaries").insert({
      household_id: household.id,
      month: monthStr,
      health: parsed.health,
      development: parsed.development,
      budget: parsed.budget,
      admin: parsed.admin,
      priorities: parsed.priorities,
    });

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

    return NextResponse.json({
      month: monthStr,
      ...parsed,
      generatedAt: new Date().toISOString(),
    } satisfies MonthlySummary);
  } catch {
    return NextResponse.json(
      { error: "Le coach IA est momentanément indisponible. Réessayez dans quelques minutes." },
      { status: 500 }
    );
  }
}
