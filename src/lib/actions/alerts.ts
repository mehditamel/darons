"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { differenceInMonths, differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { VACCINATION_SCHEDULE } from "@/lib/constants";
import type { ProactiveAlert, AlertPriority, AlertCategory } from "@/types/ai";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getAuthenticatedUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { user: null, supabase };
  return { user, supabase };
}

async function getUserHouseholdId(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", userId)
    .single();
  return data?.id ?? null;
}

function mapAlert(row: Record<string, unknown>): ProactiveAlert {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    priority: row.priority as AlertPriority,
    category: row.category as AlertCategory,
    title: row.title as string,
    message: row.message as string,
    actionUrl: (row.action_url as string) ?? null,
    dueDate: (row.due_date as string) ?? null,
    dismissed: row.dismissed as boolean,
    createdAt: row.created_at as string,
    expiresAt: (row.expires_at as string) ?? null,
  };
}

// ── Get active alerts ──

export async function getAlerts(): Promise<ActionResult<ProactiveAlert[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("proactive_alerts")
    .select("*")
    .eq("household_id", householdId)
    .eq("dismissed", false)
    .order("priority", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(10);

  if (error) return { success: false, error: "Erreur lors de la récupération des alertes" };

  return { success: true, data: (data ?? []).map(mapAlert) };
}

// ── Dismiss alert ──

export async function dismissAlert(alertId: string): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("proactive_alerts")
    .update({ dismissed: true })
    .eq("id", alertId);

  if (error) return { success: false, error: "Erreur lors de la mise à jour de l'alerte" };

  revalidatePath("/dashboard");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Generate proactive alerts (deterministic — no AI needed) ──

export async function generateProactiveAlerts(): Promise<ActionResult<number>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const alerts: Array<{
    household_id: string;
    priority: string;
    category: string;
    title: string;
    message: string;
    action_url: string | null;
    due_date: string | null;
    expires_at: string | null;
  }> = [];

  const now = new Date();

  // 1. Expiring identity documents (6 months)
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  const { data: expiringDocs } = await supabase
    .from("identity_documents")
    .select("*, family_members!inner(first_name, household_id)")
    .eq("family_members.household_id", householdId)
    .not("expiry_date", "is", null)
    .lte("expiry_date", sixMonthsFromNow.toISOString().split("T")[0]);

  for (const doc of expiringDocs ?? []) {
    const expiryDate = new Date(doc.expiry_date);
    const daysUntil = differenceInDays(expiryDate, now);
    const isExpired = daysUntil < 0;
    const priority: AlertPriority = isExpired ? "high" : daysUntil < 90 ? "medium" : "low";

    alerts.push({
      household_id: householdId,
      priority,
      category: "identite",
      title: `${doc.document_type === "cni" ? "CNI" : doc.document_type === "passeport" ? "Passeport" : "Document"} — ${doc.family_members.first_name}`,
      message: isExpired
        ? `Expiré depuis ${Math.abs(daysUntil)} jours. Renouvelez dès que possible.`
        : `Expire dans ${daysUntil} jours (${format(expiryDate, "dd MMMM yyyy", { locale: fr })}). Pensez à le renouveler.`,
      action_url: "/identite",
      due_date: doc.expiry_date,
      expires_at: null,
    });
  }

  // 2. Overdue vaccines
  const { data: members } = await supabase
    .from("family_members")
    .select("id, first_name, birth_date, member_type")
    .eq("household_id", householdId)
    .eq("member_type", "child");

  for (const child of members ?? []) {
    const childAgeMonths = differenceInMonths(now, new Date(child.birth_date));

    const { data: vaccinations } = await supabase
      .from("vaccinations")
      .select("vaccine_code, dose_number, status")
      .eq("member_id", child.id);

    const doneVaccines = (vaccinations ?? []).filter((v) => v.status === "done");

    for (const vaccine of VACCINATION_SCHEDULE) {
      for (const dose of vaccine.doses) {
        if (dose.ageMonths <= childAgeMonths) {
          const done = doneVaccines.find(
            (v) => v.vaccine_code === vaccine.code && v.dose_number === dose.doseNumber
          );
          if (!done) {
            const monthsLate = childAgeMonths - dose.ageMonths;
            alerts.push({
              household_id: householdId,
              priority: monthsLate > 3 ? "high" : "medium",
              category: "sante",
              title: `Vaccin ${vaccine.name} (dose ${dose.doseNumber}) — ${child.first_name}`,
              message: `Prévu à ${dose.label}, ${child.first_name} a ${childAgeMonths} mois. En retard de ${monthsLate} mois.`,
              action_url: "/sante",
              due_date: null,
              expires_at: null,
            });
          }
        }
      }
    }
  }

  // 3. Fiscal deadlines (French tax calendar)
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const fiscalDeadlines = [
    { month: 4, day: 10, title: "Déclaration de revenus", message: "La déclaration de revenus en ligne ouvre mi-avril." },
    { month: 5, day: 22, title: "Date limite déclaration revenus (zones 1-2)", message: "Vérifiez votre zone pour la date exacte." },
    { month: 6, day: 8, title: "Date limite déclaration revenus (zone 3)", message: "Dernière zone pour la déclaration en ligne." },
    { month: 9, day: 15, title: "Acompte IR septembre", message: "Prélèvement à la source — vérifiez votre taux." },
    { month: 11, day: 15, title: "Taxe foncière", message: "Date limite de paiement de la taxe foncière." },
  ];

  for (const deadline of fiscalDeadlines) {
    const deadlineDate = new Date(currentYear, deadline.month - 1, deadline.day);
    const daysUntil = differenceInDays(deadlineDate, now);
    if (daysUntil > 0 && daysUntil <= 60) {
      alerts.push({
        household_id: householdId,
        priority: daysUntil <= 14 ? "high" : "medium",
        category: "fiscal",
        title: deadline.title,
        message: `${deadline.message} Échéance dans ${daysUntil} jours.`,
        action_url: "/fiscal",
        due_date: deadlineDate.toISOString().split("T")[0],
        expires_at: deadlineDate.toISOString(),
      });
    }
  }

  // 4. CAF allocations expiring
  const { data: expiringAllocations } = await supabase
    .from("caf_allocations")
    .select("*")
    .eq("household_id", householdId)
    .eq("active", true)
    .not("end_date", "is", null);

  for (const alloc of expiringAllocations ?? []) {
    const endDate = new Date(alloc.end_date);
    const daysUntil = differenceInDays(endDate, now);
    if (daysUntil > 0 && daysUntil <= 90) {
      alerts.push({
        household_id: householdId,
        priority: daysUntil <= 30 ? "high" : "medium",
        category: "caf",
        title: `Allocation ${alloc.allocation_type} à renouveler`,
        message: `Votre allocation expire dans ${daysUntil} jours. Pensez à renouveler votre dossier CAF.`,
        action_url: "/budget",
        due_date: alloc.end_date,
        expires_at: null,
      });
    }
  }

  if (alerts.length === 0) {
    return { success: true, data: 0 };
  }

  // Clear old non-dismissed alerts before inserting new ones
  await supabase
    .from("proactive_alerts")
    .delete()
    .eq("household_id", householdId)
    .eq("dismissed", false);

  const { error } = await supabase.from("proactive_alerts").insert(alerts);

  if (error) return { success: false, error: "Erreur lors de la génération des alertes" };

  revalidatePath("/dashboard");
  return { success: true, data: alerts.length };
}

// ── AI usage tracking ──

export async function getAiUsage(): Promise<ActionResult<{ used: number; limit: number }>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const currentMonth = new Date();
  currentMonth.setDate(1);
  const monthStr = currentMonth.toISOString().split("T")[0];

  const { data } = await supabase
    .from("ai_usage")
    .select("call_count")
    .eq("household_id", householdId)
    .eq("month", monthStr)
    .single();

  // Get plan from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const { AI_MONTHLY_LIMITS } = await import("@/lib/constants");
  const plan = (profile?.subscription_plan ?? "free") as keyof typeof AI_MONTHLY_LIMITS;
  const limit = AI_MONTHLY_LIMITS[plan];

  return {
    success: true,
    data: { used: data?.call_count ?? 0, limit },
  };
}

export async function incrementAiUsage(): Promise<ActionResult<boolean>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const currentMonth = new Date();
  currentMonth.setDate(1);
  const monthStr = currentMonth.toISOString().split("T")[0];

  // Upsert usage count
  const { data: existing } = await supabase
    .from("ai_usage")
    .select("id, call_count")
    .eq("household_id", householdId)
    .eq("month", monthStr)
    .single();

  if (existing) {
    await supabase
      .from("ai_usage")
      .update({ call_count: existing.call_count + 1, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("ai_usage").insert({
      household_id: householdId,
      month: monthStr,
      call_count: 1,
    });
  }

  return { success: true, data: true };
}
