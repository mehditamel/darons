"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  expenseGroupSchema,
  sharedExpenseSchema,
  settlementSchema,
  type ExpenseGroupFormData,
  type SharedExpenseFormData,
  type SettlementFormData,
} from "@/lib/validators/sharing";
import type {
  ExpenseGroup,
  ExpenseGroupMember,
  SharedExpense,
  ExpenseSplit,
  ExpenseSettlement,
  MemberBalance,
  SettlementSuggestion,
} from "@/types/sharing";

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

// ── Expense Groups ──

function mapExpenseGroup(row: Record<string, unknown>): ExpenseGroup {
  return {
    id: row.id as string,
    householdId: (row.household_id as string) ?? null,
    name: row.name as string,
    description: (row.description as string) ?? null,
    createdBy: row.created_by as string,
    currency: row.currency as string,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

export async function getExpenseGroups(): Promise<
  ActionResult<ExpenseGroup[]>
> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("expense_groups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  const groups = (data ?? []).map(mapExpenseGroup);

  // Enrich with member count and total
  for (const group of groups) {
    const { count: memberCount } = await supabase
      .from("expense_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", group.id);
    group.memberCount = memberCount ?? 0;

    const { data: expenses } = await supabase
      .from("shared_expenses")
      .select("amount")
      .eq("group_id", group.id);
    group.totalExpenses = (expenses ?? []).reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );
  }

  return { success: true, data: groups };
}

export async function getExpenseGroup(
  groupId: string
): Promise<ActionResult<ExpenseGroup>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("expense_groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) return { success: false, error: "Groupe introuvable" };

  return { success: true, data: mapExpenseGroup(data) };
}

export async function createExpenseGroup(
  formData: ExpenseGroupFormData
): Promise<ActionResult<ExpenseGroup>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = expenseGroupSchema.safeParse(formData);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };

  const householdId = await getUserHouseholdId(supabase, user.id);

  const { data, error } = await supabase
    .from("expense_groups")
    .insert({
      household_id: householdId,
      name: parsed.data.name,
      description: parsed.data.description,
      created_by: user.id,
      currency: parsed.data.currency,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la création" };

  // Add creator as first member
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .single();

  await supabase.from("expense_group_members").insert({
    group_id: data.id,
    user_id: user.id,
    external_name: null,
    email: profile?.email,
  });

  revalidatePath("/depenses-partagees");
  return { success: true, data: mapExpenseGroup(data) };
}

export async function deleteExpenseGroup(
  groupId: string
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("expense_groups")
    .delete()
    .eq("id", groupId)
    .eq("created_by", user.id);

  if (error) return { success: false, error: "Erreur lors de la suppression" };

  revalidatePath("/depenses-partagees");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Group Members ──

function mapGroupMember(row: Record<string, unknown>): ExpenseGroupMember {
  return {
    id: row.id as string,
    groupId: row.group_id as string,
    userId: (row.user_id as string) ?? null,
    externalName: (row.external_name as string) ?? null,
    email: (row.email as string) ?? null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    displayName: (row.external_name as string) ?? (row.email as string) ?? "Inconnu",
  };
}

export async function getGroupMembers(
  groupId: string
): Promise<ActionResult<ExpenseGroupMember[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("expense_group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  const members = (data ?? []).map(mapGroupMember);

  // Enrich with profile names
  for (const member of members) {
    if (member.userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", member.userId)
        .single();
      if (profile) {
        member.displayName = `${profile.first_name} ${profile.last_name}`;
      }
    }
  }

  return { success: true, data: members };
}

export async function addGroupMember(
  groupId: string,
  name: string,
  email?: string
): Promise<ActionResult<ExpenseGroupMember>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("expense_group_members")
    .insert({
      group_id: groupId,
      external_name: name,
      email: email ?? null,
    })
    .select()
    .single();

  if (error)
    return { success: false, error: "Erreur lors de l'ajout du participant" };

  revalidatePath("/depenses-partagees");
  return { success: true, data: mapGroupMember(data) };
}

export async function removeGroupMember(
  memberId: string
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("expense_group_members")
    .update({ is_active: false })
    .eq("id", memberId);

  if (error) return { success: false, error: "Erreur lors de la suppression" };

  revalidatePath("/depenses-partagees");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Shared Expenses ──

function mapSharedExpense(row: Record<string, unknown>): SharedExpense {
  return {
    id: row.id as string,
    groupId: row.group_id as string,
    paidBy: row.paid_by as string,
    title: row.title as string,
    amount: Number(row.amount),
    currency: (row.currency as string) ?? "EUR",
    category: (row.category as string) ?? null,
    expenseDate: row.expense_date as string,
    receiptPath: (row.receipt_path as string) ?? null,
    notes: (row.notes as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function getGroupExpenses(
  groupId: string
): Promise<ActionResult<SharedExpense[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("shared_expenses")
    .select("*")
    .eq("group_id", groupId)
    .order("expense_date", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  const expenses = (data ?? []).map(mapSharedExpense);

  // Enrich with payer name
  for (const expense of expenses) {
    const { data: member } = await supabase
      .from("expense_group_members")
      .select("external_name, user_id")
      .eq("id", expense.paidBy)
      .single();

    if (member) {
      if (member.external_name) {
        expense.paidByName = member.external_name;
      } else if (member.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", member.user_id)
          .single();
        expense.paidByName = profile?.first_name ?? "Inconnu";
      }
    }
  }

  return { success: true, data: expenses };
}

export async function createSharedExpense(
  groupId: string,
  formData: SharedExpenseFormData
): Promise<ActionResult<SharedExpense>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = sharedExpenseSchema.safeParse(formData);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };

  const { data, error } = await supabase
    .from("shared_expenses")
    .insert({
      group_id: groupId,
      paid_by: parsed.data.paidBy,
      title: parsed.data.title,
      amount: parsed.data.amount,
      category: parsed.data.category,
      expense_date: parsed.data.expenseDate,
      notes: parsed.data.notes,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la création" };

  // Create splits
  const { data: members } = await supabase
    .from("expense_group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("is_active", true);

  const activeMembers = members ?? [];

  if (parsed.data.splitType === "equal" && activeMembers.length > 0) {
    const splitAmount =
      Math.round((parsed.data.amount / activeMembers.length) * 100) / 100;
    const splits = activeMembers.map((m) => ({
      expense_id: data.id,
      member_id: m.id,
      amount: splitAmount,
    }));
    await supabase.from("expense_splits").insert(splits);
  } else if (parsed.data.customSplits) {
    const splits = parsed.data.customSplits.map((s) => ({
      expense_id: data.id,
      member_id: s.memberId,
      amount: s.amount,
    }));
    await supabase.from("expense_splits").insert(splits);
  }

  revalidatePath("/depenses-partagees");
  return { success: true, data: mapSharedExpense(data) };
}

export async function deleteSharedExpense(
  expenseId: string
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("shared_expenses")
    .delete()
    .eq("id", expenseId);

  if (error) return { success: false, error: "Erreur lors de la suppression" };

  revalidatePath("/depenses-partagees");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Settlements ──

export async function createSettlement(
  groupId: string,
  formData: SettlementFormData
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = settlementSchema.safeParse(formData);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };

  const { error } = await supabase.from("expense_settlements").insert({
    group_id: groupId,
    from_member: parsed.data.fromMember,
    to_member: parsed.data.toMember,
    amount: parsed.data.amount,
    notes: parsed.data.notes,
  });

  if (error) return { success: false, error: "Erreur lors du remboursement" };

  revalidatePath("/depenses-partagees");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

export async function getGroupSettlements(
  groupId: string
): Promise<ActionResult<ExpenseSettlement[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("expense_settlements")
    .select("*")
    .eq("group_id", groupId)
    .order("settled_at", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id,
      groupId: row.group_id,
      fromMember: row.from_member,
      toMember: row.to_member,
      amount: Number(row.amount),
      settledAt: row.settled_at,
      notes: row.notes,
      createdAt: row.created_at,
    })),
  };
}

// ── Balances Calculation ──

export async function getGroupBalances(
  groupId: string
): Promise<ActionResult<MemberBalance[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const membersResult = await getGroupMembers(groupId);
  if (!membersResult.success || !membersResult.data)
    return { success: false, error: "Erreur" };

  const members = membersResult.data;

  const { data: expenses } = await supabase
    .from("shared_expenses")
    .select("*, expense_splits(*)")
    .eq("group_id", groupId);

  const { data: settlements } = await supabase
    .from("expense_settlements")
    .select("*")
    .eq("group_id", groupId);

  const balances: MemberBalance[] = members.map((m) => ({
    memberId: m.id,
    memberName: m.displayName ?? "Inconnu",
    totalPaid: 0,
    totalOwed: 0,
    balance: 0,
  }));

  // Calculate amounts paid
  for (const expense of expenses ?? []) {
    const payer = balances.find((b) => b.memberId === expense.paid_by);
    if (payer) payer.totalPaid += Number(expense.amount);

    for (const split of expense.expense_splits ?? []) {
      const debtor = balances.find((b) => b.memberId === split.member_id);
      if (debtor) debtor.totalOwed += Number(split.amount);
    }
  }

  // Account for settlements
  for (const settlement of settlements ?? []) {
    const from = balances.find((b) => b.memberId === settlement.from_member);
    const to = balances.find((b) => b.memberId === settlement.to_member);
    if (from) from.totalPaid += Number(settlement.amount);
    if (to) to.totalOwed += Number(settlement.amount);
  }

  // Calculate net balance (positive = owed money, negative = owes money)
  for (const b of balances) {
    b.balance = b.totalPaid - b.totalOwed;
  }

  return { success: true, data: balances };
}

export async function getSettlementSuggestions(
  groupId: string
): Promise<ActionResult<SettlementSuggestion[]>> {
  const balancesResult = await getGroupBalances(groupId);
  if (!balancesResult.success || !balancesResult.data)
    return { success: false, error: "Erreur" };

  const membersResult = await getGroupMembers(groupId);
  if (!membersResult.success || !membersResult.data)
    return { success: false, error: "Erreur" };

  const members = membersResult.data;
  const balances = [...balancesResult.data];

  // Greedy settlement algorithm
  const suggestions: SettlementSuggestion[] = [];
  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance);
  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debt = Math.abs(debtors[i].balance);
    const credit = creditors[j].balance;
    const amount = Math.min(debt, credit);

    if (amount > 0.01) {
      const fromMember = members.find(
        (m) => m.id === debtors[i].memberId
      );
      const toMember = members.find(
        (m) => m.id === creditors[j].memberId
      );

      if (fromMember && toMember) {
        suggestions.push({
          from: fromMember,
          to: toMember,
          amount: Math.round(amount * 100) / 100,
        });
      }
    }

    debtors[i].balance += amount;
    creditors[j].balance -= amount;

    if (Math.abs(debtors[i].balance) < 0.01) i++;
    if (creditors[j].balance < 0.01) j++;
  }

  return { success: true, data: suggestions };
}
