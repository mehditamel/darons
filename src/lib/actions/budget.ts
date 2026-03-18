"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  budgetEntrySchema,
  cafAllocationSchema,
  savingsGoalSchema,
  type BudgetEntryFormData,
  type CafAllocationFormData,
  type SavingsGoalFormData,
} from "@/lib/validators/budget";
import type { BudgetEntry, CafAllocation, SavingsGoal, BudgetSummary } from "@/types/budget";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
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

// ── Budget Entries ──

function mapBudgetEntry(row: Record<string, unknown>): BudgetEntry {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    memberId: (row.member_id as string) ?? null,
    month: row.month as string,
    category: row.category as BudgetEntry["category"],
    label: row.label as string,
    amount: Number(row.amount),
    isRecurring: row.is_recurring as boolean,
    notes: (row.notes as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function getBudgetEntries(month?: string): Promise<ActionResult<BudgetEntry[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  let query = supabase
    .from("budget_entries")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (month) {
    query = query.eq("month", month);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: "Erreur lors de la récupération des dépenses" };

  return { success: true, data: (data ?? []).map(mapBudgetEntry) };
}

export async function createBudgetEntry(formData: BudgetEntryFormData): Promise<ActionResult<BudgetEntry>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = budgetEntrySchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("budget_entries")
    .insert({
      household_id: householdId,
      member_id: parsed.data.memberId,
      month: parsed.data.month,
      category: parsed.data.category,
      label: parsed.data.label,
      amount: parsed.data.amount,
      is_recurring: parsed.data.isRecurring,
      notes: parsed.data.notes,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la création de l'entrée" };

  revalidatePath("/budget");
  return { success: true, data: mapBudgetEntry(data) };
}

export async function updateBudgetEntry(id: string, formData: BudgetEntryFormData): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = budgetEntrySchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };

  const { error } = await supabase
    .from("budget_entries")
    .update({
      member_id: parsed.data.memberId,
      category: parsed.data.category,
      label: parsed.data.label,
      amount: parsed.data.amount,
      is_recurring: parsed.data.isRecurring,
      notes: parsed.data.notes,
    })
    .eq("id", id);

  if (error) return { success: false, error: "Erreur lors de la mise à jour" };

  revalidatePath("/budget");
  return { success: true };
}

export async function deleteBudgetEntry(id: string): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("budget_entries").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression" };

  revalidatePath("/budget");
  return { success: true };
}

// ── CAF Allocations ──

function mapCafAllocation(row: Record<string, unknown>): CafAllocation {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    allocationType: row.allocation_type as string,
    monthlyAmount: Number(row.monthly_amount),
    startDate: row.start_date as string,
    endDate: (row.end_date as string) ?? null,
    active: row.active as boolean,
    notes: (row.notes as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function getCafAllocations(): Promise<ActionResult<CafAllocation[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("caf_allocations")
    .select("*")
    .eq("household_id", householdId)
    .order("active", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération des allocations" };

  return { success: true, data: (data ?? []).map(mapCafAllocation) };
}

export async function createCafAllocation(formData: CafAllocationFormData): Promise<ActionResult<CafAllocation>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = cafAllocationSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("caf_allocations")
    .insert({
      household_id: householdId,
      allocation_type: parsed.data.allocationType,
      monthly_amount: parsed.data.monthlyAmount,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      active: parsed.data.active,
      notes: parsed.data.notes,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la création de l'allocation" };

  revalidatePath("/budget");
  return { success: true, data: mapCafAllocation(data) };
}

export async function updateCafAllocation(id: string, formData: CafAllocationFormData): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = cafAllocationSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };

  const { error } = await supabase
    .from("caf_allocations")
    .update({
      allocation_type: parsed.data.allocationType,
      monthly_amount: parsed.data.monthlyAmount,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      active: parsed.data.active,
      notes: parsed.data.notes,
    })
    .eq("id", id);

  if (error) return { success: false, error: "Erreur lors de la mise à jour" };

  revalidatePath("/budget");
  return { success: true };
}

export async function deleteCafAllocation(id: string): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("caf_allocations").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression" };

  revalidatePath("/budget");
  return { success: true };
}

// ── Savings Goals ──

function mapSavingsGoal(row: Record<string, unknown>): SavingsGoal {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    name: row.name as string,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: (row.target_date as string) ?? null,
    icon: (row.icon as string) ?? null,
    active: row.active as boolean,
    createdAt: row.created_at as string,
  };
}

export async function getSavingsGoals(): Promise<ActionResult<SavingsGoal[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("household_id", householdId)
    .order("active", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération des objectifs" };

  return { success: true, data: (data ?? []).map(mapSavingsGoal) };
}

export async function createSavingsGoal(formData: SavingsGoalFormData): Promise<ActionResult<SavingsGoal>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = savingsGoalSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("savings_goals")
    .insert({
      household_id: householdId,
      name: parsed.data.name,
      target_amount: parsed.data.targetAmount,
      current_amount: parsed.data.currentAmount,
      target_date: parsed.data.targetDate,
      icon: parsed.data.icon,
      active: parsed.data.active,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la création de l'objectif" };

  revalidatePath("/budget");
  return { success: true, data: mapSavingsGoal(data) };
}

export async function updateSavingsGoal(id: string, formData: SavingsGoalFormData): Promise<ActionResult<SavingsGoal>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = savingsGoalSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };

  const { data, error } = await supabase
    .from("savings_goals")
    .update({
      name: parsed.data.name,
      target_amount: parsed.data.targetAmount,
      current_amount: parsed.data.currentAmount,
      target_date: parsed.data.targetDate,
      icon: parsed.data.icon,
      active: parsed.data.active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la mise à jour" };

  revalidatePath("/budget");
  return { success: true, data: mapSavingsGoal(data) };
}

export async function deleteSavingsGoal(id: string): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("savings_goals").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression" };

  revalidatePath("/budget");
  return { success: true };
}

// ── Budget Summary ──

export async function getBudgetSummary(month: string): Promise<ActionResult<BudgetSummary>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const [entriesRes, allocRes] = await Promise.all([
    supabase
      .from("budget_entries")
      .select("*")
      .eq("household_id", householdId)
      .eq("month", month),
    supabase
      .from("caf_allocations")
      .select("*")
      .eq("household_id", householdId)
      .eq("active", true),
  ]);

  if (entriesRes.error || allocRes.error) {
    return { success: false, error: "Erreur lors du calcul du résumé" };
  }

  const entries = (entriesRes.data ?? []).map(mapBudgetEntry);
  const allocations = (allocRes.data ?? []).map(mapCafAllocation);

  const totalExpenses = entries
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = entries
    .filter((e) => e.amount < 0)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);

  const totalAllocations = allocations.reduce((sum, a) => sum + a.monthlyAmount, 0);

  const byCategory: Record<string, number> = {};
  for (const entry of entries.filter((e) => e.amount > 0)) {
    byCategory[entry.category] = (byCategory[entry.category] ?? 0) + entry.amount;
  }

  const byMember: Record<string, number> = {};
  for (const entry of entries.filter((e) => e.amount > 0)) {
    const key = entry.memberId ?? "foyer";
    byMember[key] = (byMember[key] ?? 0) + entry.amount;
  }

  return {
    success: true,
    data: {
      month,
      totalExpenses,
      totalIncome,
      totalAllocations,
      netBalance: totalAllocations + totalIncome - totalExpenses,
      byCategory,
      byMember,
      entryCount: entries.length,
    },
  };
}

// ── Monthly History (for charts) ──

export async function getBudgetHistory(months: number = 6): Promise<ActionResult<BudgetSummary[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const summaries: BudgetSummary[] = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;

    const { data: entries } = await supabase
      .from("budget_entries")
      .select("*")
      .eq("household_id", householdId)
      .eq("month", monthStr);

    const mapped = (entries ?? []).map(mapBudgetEntry);
    const totalExpenses = mapped.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
    const totalIncome = mapped.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);

    const byCategory: Record<string, number> = {};
    for (const entry of mapped.filter((e) => e.amount > 0)) {
      byCategory[entry.category] = (byCategory[entry.category] ?? 0) + entry.amount;
    }

    summaries.push({
      month: monthStr,
      totalExpenses,
      totalIncome,
      totalAllocations: 0,
      netBalance: totalIncome - totalExpenses,
      byCategory,
      byMember: {},
      entryCount: mapped.length,
    });
  }

  return { success: true, data: summaries.reverse() };
}
