import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaude, parseJsonResponse } from "@/lib/ai/anthropic";
import { MONTHLY_SUMMARY_PROMPT } from "@/lib/ai/prompts";
import { sendEmail, sendInAppNotification } from "@/lib/integrations/notifications";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import type { MonthlySummary } from "@/types/ai";

// CRON-friendly route — called monthly (1st of each month)
// Generates + emails a monthly summary for each household

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = createClient();

  const { data: households } = await supabase
    .from("households")
    .select("id, owner_id, profiles!inner(email)");

  if (!households || households.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStr = currentMonth.toISOString().split("T")[0];
  const lastMonth = subMonths(now, 1);
  const lastMonthStr = format(lastMonth, "yyyy-MM-01");
  const monthLabel = format(lastMonth, "MMMM yyyy", { locale: fr });

  let processed = 0;

  for (const household of households) {
    const householdId = household.id;
    const ownerEmail = (household as Record<string, unknown>).profiles
      ? ((household as Record<string, unknown>).profiles as Record<string, unknown>).email as string
      : null;

    if (!ownerEmail) continue;

    // Check if summary already exists
    const { data: existing } = await supabase
      .from("ai_monthly_summaries")
      .select("id")
      .eq("household_id", householdId)
      .eq("month", monthStr)
      .single();

    if (existing) continue; // Already generated

    // Collect data
    const [membersRes, vaccsRes, budgetRes, allocsRes, docsRes] = await Promise.all([
      supabase.from("family_members").select("*").eq("household_id", householdId),
      supabase
        .from("vaccinations")
        .select("*, family_members!inner(first_name, household_id)")
        .eq("family_members.household_id", householdId)
        .gte("administered_date", lastMonthStr),
      supabase
        .from("budget_entries")
        .select("*")
        .eq("household_id", householdId)
        .eq("month", lastMonthStr),
      supabase.from("caf_allocations").select("*").eq("household_id", householdId).eq("active", true),
      supabase
        .from("identity_documents")
        .select("*, family_members!inner(first_name, household_id)")
        .eq("family_members.household_id", householdId),
    ]);

    const userMessage = `DONNEES DU MOIS : ${JSON.stringify({
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

      // Save summary
      await supabase.from("ai_monthly_summaries").insert({
        household_id: householdId,
        month: monthStr,
        health: parsed.health,
        development: parsed.development,
        budget: parsed.budget,
        admin: parsed.admin,
        priorities: parsed.priorities,
      });

      // Send email
      const prioritiesHtml = parsed.priorities
        .map((p, i) => `<li style="margin-bottom: 4px;">${p}</li>`)
        .join("");

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #E8734A; font-size: 24px; margin: 0;">Darons</h1>
            <p style="color: #666; font-size: 14px; margin: 4px 0 0;">Recap mensuel — ${monthLabel}</p>
          </div>

          <div style="background: #f0faf9; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <h3 style="color: #2BA89E; font-size: 14px; margin: 0 0 8px;">Sante</h3>
            <p style="color: #555; font-size: 13px; margin: 0;">${parsed.health}</p>
          </div>

          <div style="background: #f5f0fa; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <h3 style="color: #7B5EA7; font-size: 14px; margin: 0 0 8px;">Developpement</h3>
            <p style="color: #555; font-size: 13px; margin: 0;">${parsed.development}</p>
          </div>

          <div style="background: #faf5e6; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <h3 style="color: #D4A843; font-size: 14px; margin: 0 0 8px;">Budget</h3>
            <p style="color: #555; font-size: 13px; margin: 0;">${parsed.budget}</p>
          </div>

          <div style="background: #eef4fd; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <h3 style="color: #4A7BE8; font-size: 14px; margin: 0 0 8px;">Administratif</h3>
            <p style="color: #555; font-size: 13px; margin: 0;">${parsed.admin}</p>
          </div>

          <div style="background: #fff5f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #E8734A; font-size: 14px; margin: 0 0 8px;">Priorites du mois</h3>
            <ol style="color: #555; font-size: 13px; margin: 0; padding-left: 20px;">
              ${prioritiesHtml}
            </ol>
          </div>

          <div style="text-align: center;">
            <a href="https://darons.app/dashboard" style="display: inline-block; background: #E8734A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Voir le dashboard</a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            Tu recois cet email car tu utilises Darons. Gere tes preferences dans Parametres.
          </p>
        </div>
      `;

      await sendEmail(ownerEmail, `Recap ${monthLabel} — Ta famille en un clin d'oeil`, html);
      await sendInAppNotification(householdId, "monthly_recap", `Recap ${monthLabel}`, {
        month: monthStr,
      });

      processed++;
    } catch {
      // Continue with next household on error
    }
  }

  return NextResponse.json({ processed });
}
