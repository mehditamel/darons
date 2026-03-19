"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bridgeClient, isBridgeConfigured } from "@/lib/integrations/bridge";
import { categorizeTransactions } from "@/lib/ai/categorize-transactions";
import type { BankTransactionFilter } from "@/lib/validators/banking";
import { bankTransactionFilterSchema } from "@/lib/validators/banking";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface BankConnection {
  id: string;
  householdId: string;
  bridgeItemId: string;
  bankName: string;
  status: string;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  connectionId: string;
  bridgeAccountId: string;
  name: string;
  accountType: string | null;
  balance: number | null;
  currency: string;
  lastSyncAt: string | null;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  bridgeTransactionId: string | null;
  amount: number;
  currency: string;
  description: string | null;
  categoryAuto: string | null;
  categoryUser: string | null;
  aiCategory: string | null;
  memberId: string | null;
  transactionDate: string;
  isRecurring: boolean;
  tags: string[];
  createdAt: string;
}

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

function mapConnection(row: Record<string, unknown>): BankConnection {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    bridgeItemId: row.bridge_item_id as string,
    bankName: row.bank_name as string,
    status: row.status as string,
    lastSyncAt: (row.last_sync_at as string) ?? null,
    createdAt: row.created_at as string,
  };
}

function mapAccount(row: Record<string, unknown>): BankAccount {
  return {
    id: row.id as string,
    connectionId: row.connection_id as string,
    bridgeAccountId: row.bridge_account_id as string,
    name: row.name as string,
    accountType: (row.account_type as string) ?? null,
    balance: row.balance != null ? Number(row.balance) : null,
    currency: (row.currency as string) || "EUR",
    lastSyncAt: (row.last_sync_at as string) ?? null,
  };
}

function mapTransaction(row: Record<string, unknown>): BankTransaction {
  return {
    id: row.id as string,
    accountId: row.account_id as string,
    bridgeTransactionId: (row.bridge_transaction_id as string) ?? null,
    amount: Number(row.amount),
    currency: (row.currency as string) || "EUR",
    description: (row.description as string) ?? null,
    categoryAuto: (row.category_auto as string) ?? null,
    categoryUser: (row.category_user as string) ?? null,
    aiCategory: (row.ai_category as string) ?? null,
    memberId: (row.member_id as string) ?? null,
    transactionDate: row.transaction_date as string,
    isRecurring: (row.is_recurring as boolean) ?? false,
    tags: (row.tags as string[]) ?? [],
    createdAt: row.created_at as string,
  };
}

// ── Bank Connections ──

export async function getBankConnections(): Promise<ActionResult<BankConnection[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("bank_connections")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération des connexions" };
  return { success: true, data: (data ?? []).map(mapConnection) };
}

// ── Bank Accounts ──

export async function getBankAccounts(connectionId?: string): Promise<ActionResult<BankAccount[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  let query = supabase
    .from("bank_accounts")
    .select("*, bank_connections!inner(household_id)")
    .eq("bank_connections.household_id", householdId);

  if (connectionId) {
    query = query.eq("connection_id", connectionId);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: "Erreur lors de la récupération des comptes" };
  return { success: true, data: (data ?? []).map(mapAccount) };
}

// ── Sync from Bridge API ──

export async function syncBankAccounts(connectionId: string): Promise<ActionResult> {
  if (!isBridgeConfigured()) return { success: false, error: "Bridge API non configurée" };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: conn } = await supabase
    .from("bank_connections")
    .select("bridge_item_id")
    .eq("id", connectionId)
    .single();

  if (!conn) return { success: false, error: "Connexion introuvable" };

  try {
    const token = await bridgeClient.authenticate(user.email!, "");
    const accounts = await bridgeClient.getAccounts(token);

    for (const acc of accounts) {
      if (String(acc.item_id) === conn.bridge_item_id) {
        await supabase.from("bank_accounts").upsert(
          {
            connection_id: connectionId,
            bridge_account_id: String(acc.id),
            name: acc.name,
            account_type: acc.type,
            balance: acc.balance,
            currency: acc.currency_code || "EUR",
            last_sync_at: new Date().toISOString(),
          },
          { onConflict: "bridge_account_id" }
        );
      }
    }

    await supabase
      .from("bank_connections")
      .update({ last_sync_at: new Date().toISOString(), status: "active" })
      .eq("id", connectionId);

    revalidatePath("/budget");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur de synchronisation";
    return { success: false, error: message };
  }
}

export async function syncBankTransactions(
  accountId: string,
  since?: string
): Promise<ActionResult> {
  if (!isBridgeConfigured()) return { success: false, error: "Bridge API non configurée" };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: account } = await supabase
    .from("bank_accounts")
    .select("bridge_account_id")
    .eq("id", accountId)
    .single();

  if (!account) return { success: false, error: "Compte introuvable" };

  try {
    const token = await bridgeClient.authenticate(user.email!, "");
    const transactions = await bridgeClient.getTransactions(
      token,
      Number(account.bridge_account_id),
      since
    );

    const rows = transactions.map((tx) => ({
      account_id: accountId,
      bridge_transaction_id: String(tx.id),
      amount: tx.amount,
      currency: tx.currency_code || "EUR",
      description: tx.clean_description || tx.description,
      category_auto: tx.category_id ? String(tx.category_id) : null,
      transaction_date: tx.date,
      is_recurring: false,
    }));

    if (rows.length > 0) {
      await supabase
        .from("bank_transactions")
        .upsert(rows, { onConflict: "bridge_transaction_id" });
    }

    revalidatePath("/budget");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur de synchronisation";
    return { success: false, error: message };
  }
}

// ── Read Transactions ──

export async function getBankTransactions(
  filters?: BankTransactionFilter
): Promise<ActionResult<BankTransaction[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  if (filters) {
    const parsed = bankTransactionFilterSchema.safeParse(filters);
    if (!parsed.success) return { success: false, error: "Filtres invalides" };
  }

  let query = supabase
    .from("bank_transactions")
    .select("*, bank_accounts!inner(connection_id, bank_connections!inner(household_id))")
    .eq("bank_accounts.bank_connections.household_id", householdId)
    .order("transaction_date", { ascending: false })
    .limit(200);

  if (filters?.accountId) {
    query = query.eq("account_id", filters.accountId);
  }
  if (filters?.memberId) {
    query = query.eq("member_id", filters.memberId);
  }
  if (filters?.startDate) {
    query = query.gte("transaction_date", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("transaction_date", filters.endDate);
  }
  if (filters?.search) {
    query = query.ilike("description", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: "Erreur lors de la récupération des transactions" };
  return { success: true, data: (data ?? []).map(mapTransaction) };
}

// ── Update Transaction ──

export async function updateTransactionCategory(
  transactionId: string,
  category: string
): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("bank_transactions")
    .update({ category_user: category })
    .eq("id", transactionId);

  if (error) return { success: false, error: "Erreur lors de la mise à jour" };
  revalidatePath("/budget");
  return { success: true };
}

export async function assignTransactionToMember(
  transactionId: string,
  memberId: string | null
): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("bank_transactions")
    .update({ member_id: memberId })
    .eq("id", transactionId);

  if (error) return { success: false, error: "Erreur lors de la mise à jour" };
  revalidatePath("/budget");
  return { success: true };
}

// ── AI Categorization ──

export async function aiCategorizeUncategorized(): Promise<ActionResult<number>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data: transactions } = await supabase
    .from("bank_transactions")
    .select("id, description, amount, transaction_date, bank_accounts!inner(connection_id, bank_connections!inner(household_id))")
    .eq("bank_accounts.bank_connections.household_id", householdId)
    .is("category_user", null)
    .is("ai_category", null)
    .limit(20);

  if (!transactions || transactions.length === 0) {
    return { success: true, data: 0 };
  }

  const input = transactions.map((tx) => ({
    id: tx.id as string,
    description: (tx.description as string) || "",
    amount: Number(tx.amount),
    date: tx.transaction_date as string,
  }));

  const results = await categorizeTransactions(input);
  let categorized = 0;

  for (const result of results) {
    const { error } = await supabase
      .from("bank_transactions")
      .update({
        ai_category: result.category,
        ai_categorized_at: new Date().toISOString(),
      })
      .eq("id", result.id);

    if (!error) categorized++;
  }

  revalidatePath("/budget");
  return { success: true, data: categorized };
}
