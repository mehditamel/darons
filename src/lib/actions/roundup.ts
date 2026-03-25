"use server";
import { type ActionResult, getAuthenticatedUser, getUserHouseholdId } from "@/lib/actions/safe-action";

import { revalidatePath } from "next/cache";
import {
  roundupSettingsSchema,
  type RoundupSettingsFormData,
} from "@/lib/validators/sharing";
import type { RoundupSettings, RoundupLogEntry } from "@/types/sharing";

function mapRoundupSettings(row: Record<string, unknown>): RoundupSettings {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    enabled: row.enabled as boolean,
    roundupTo: Number(row.roundup_to),
    targetGoalId: (row.target_goal_id as string) ?? null,
    monthlyCap: Number(row.monthly_cap),
    totalRounded: Number(row.total_rounded),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapRoundupLog(row: Record<string, unknown>): RoundupLogEntry {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    transactionAmount: Number(row.transaction_amount),
    roundupAmount: Number(row.roundup_amount),
    goalId: (row.goal_id as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function getRoundupSettings(): Promise<
  ActionResult<RoundupSettings>
> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("roundup_settings")
    .select("*")
    .eq("household_id", householdId)
    .single();

  if (error) {
    // Create default settings
    const { data: created, error: createError } = await supabase
      .from("roundup_settings")
      .insert({ household_id: householdId })
      .select()
      .single();

    if (createError)
      return { success: false, error: "Erreur lors de la création" };

    return { success: true, data: mapRoundupSettings(created) };
  }

  return { success: true, data: mapRoundupSettings(data) };
}

export async function updateRoundupSettings(
  formData: RoundupSettingsFormData
): Promise<ActionResult<RoundupSettings>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = roundupSettingsSchema.safeParse(formData);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("roundup_settings")
    .update({
      enabled: parsed.data.enabled,
      roundup_to: parsed.data.roundupTo,
      target_goal_id: parsed.data.targetGoalId,
      monthly_cap: parsed.data.monthlyCap,
      updated_at: new Date().toISOString(),
    })
    .eq("household_id", householdId)
    .select()
    .single();

  if (error)
    return { success: false, error: "Erreur lors de la mise à jour" };

  revalidatePath("/budget");
  return { success: true, data: mapRoundupSettings(data) };
}

export async function simulateRoundup(
  transactionAmount: number
): Promise<ActionResult<{ roundupAmount: number; newTotal: number }>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const settingsResult = await getRoundupSettings();
  if (!settingsResult.success || !settingsResult.data)
    return { success: false, error: "Paramètres introuvables" };

  const settings = settingsResult.data;
  if (!settings.enabled) return { success: false, error: "Arrondi désactivé" };

  const roundupTo = settings.roundupTo;
  const roundedUp = Math.ceil(transactionAmount / roundupTo) * roundupTo;
  const roundupAmount = Math.round((roundedUp - transactionAmount) * 100) / 100;

  if (roundupAmount === 0) {
    return { success: true, data: { roundupAmount: 0, newTotal: settings.totalRounded } };
  }

  return {
    success: true,
    data: {
      roundupAmount,
      newTotal: settings.totalRounded + roundupAmount,
    },
  };
}

export async function processRoundup(
  transactionAmount: number
): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const settingsResult = await getRoundupSettings();
  if (!settingsResult.success || !settingsResult.data)
    return { success: false, error: "Paramètres introuvables" };

  const settings = settingsResult.data;
  if (!settings.enabled) return { success: true };

  const roundupTo = settings.roundupTo;
  const roundedUp = Math.ceil(transactionAmount / roundupTo) * roundupTo;
  const roundupAmount = Math.round((roundedUp - transactionAmount) * 100) / 100;

  if (roundupAmount === 0) return { success: true };

  // Check monthly cap
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyLogs } = await supabase
    .from("roundup_log")
    .select("roundup_amount")
    .eq("household_id", householdId)
    .gte("created_at", startOfMonth.toISOString());

  const monthlyTotal = (monthlyLogs ?? []).reduce(
    (sum, log) => sum + Number(log.roundup_amount),
    0
  );

  if (monthlyTotal + roundupAmount > settings.monthlyCap) {
    return { success: true }; // Silently skip if cap reached
  }

  // Log the roundup
  await supabase.from("roundup_log").insert({
    household_id: householdId,
    transaction_amount: transactionAmount,
    roundup_amount: roundupAmount,
    goal_id: settings.targetGoalId,
  });

  // Update total
  await supabase
    .from("roundup_settings")
    .update({ total_rounded: settings.totalRounded + roundupAmount })
    .eq("household_id", householdId);

  // Update savings goal if linked
  if (settings.targetGoalId) {
    const { data: goal } = await supabase
      .from("savings_goals")
      .select("current_amount")
      .eq("id", settings.targetGoalId)
      .single();

    if (goal) {
      await supabase
        .from("savings_goals")
        .update({
          current_amount: Number(goal.current_amount) + roundupAmount,
        })
        .eq("id", settings.targetGoalId);
    }
  }

  revalidatePath("/budget");
  return { success: true };
}

export async function getRoundupHistory(
  limit: number = 20
): Promise<ActionResult<RoundupLogEntry[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("roundup_log")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  return { success: true, data: (data ?? []).map(mapRoundupLog) };
}
