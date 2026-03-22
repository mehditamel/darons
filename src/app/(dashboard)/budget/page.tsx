import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { BudgetTabs } from "@/components/budget/budget-tabs";
import { AiCoachCard } from "@/components/budget/ai-coach-card";
import { RoundupSettingsCard } from "@/components/budget/roundup-settings-card";
import { BudgetForecastCard } from "@/components/budget/budget-forecast-card";
import { BankConnections } from "@/components/budget/bank-connections";
import { BankTransactionsList } from "@/components/budget/bank-transactions-list";
import { getFamilyMembers } from "@/lib/actions/family";
import {
  getBudgetEntries,
  getCafAllocations,
  getSavingsGoals,
  getBudgetSummary,
  getBudgetHistory,
} from "@/lib/actions/budget";
import { getBankConnections, getBankTransactions } from "@/lib/actions/banking";
import { getRoundupSettings } from "@/lib/actions/roundup";
import { PLAN_LIMITS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Budget familial",
  description: "Suivez vos dépenses, allocations CAF et reste à charge",
};

export default async function BudgetPage() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("subscription_plan").eq("id", user.id).single()
    : { data: null };
  const plan = (profile?.subscription_plan ?? "free") as keyof typeof PLAN_LIMITS;
  const hasAiCoach = PLAN_LIMITS[plan].hasAiCoach;
  const hasOpenBanking = PLAN_LIMITS[plan].hasOpenBanking;

  const [membersResult, entriesResult, allocResult, goalsResult, summaryResult, historyResult, roundupResult, connectionsResult, bankTxResult] =
    await Promise.all([
      getFamilyMembers(),
      getBudgetEntries(currentMonth),
      getCafAllocations(),
      getSavingsGoals(),
      getBudgetSummary(currentMonth),
      getBudgetHistory(6),
      getRoundupSettings(),
      getBankConnections(),
      hasOpenBanking ? getBankTransactions({ startDate: currentMonth }) : Promise.resolve({ success: true as const, data: [] }),
    ]);

  const members = membersResult.data ?? [];
  const entries = entriesResult.data ?? [];
  const allocations = allocResult.data ?? [];
  const goals = goalsResult.data ?? [];
  const history = historyResult.data ?? [];
  const bankConnections = connectionsResult.data ?? [];
  const bankTransactions = bankTxResult.data ?? [];

  const summary = summaryResult.data ?? {
    month: currentMonth,
    totalExpenses: 0,
    totalIncome: 0,
    totalAllocations: allocations
      .filter((a) => a.active)
      .reduce((sum, a) => sum + a.monthlyAmount, 0),
    netBalance: 0,
    byCategory: {},
    byMember: {},
    entryCount: 0,
  };

  // Add allocations to summary if not already counted
  if (summary.totalAllocations === 0 && allocations.length > 0) {
    summary.totalAllocations = allocations
      .filter((a) => a.active)
      .reduce((sum, a) => sum + a.monthlyAmount, 0);
    summary.netBalance = summary.totalAllocations + summary.totalIncome - summary.totalExpenses;
  }

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Budget familial"
        description="Où passe ta thune ? On te montre"
        icon={<Wallet className="h-5 w-5" />}
      />

      <BudgetForecastCard currentSummary={summary} history={history} />

      <BudgetTabs
        entries={entries}
        allocations={allocations}
        goals={goals}
        summary={summary}
        history={history}
        members={members}
        currentMonth={currentMonth}
      />

      {/* Banking section */}
      <BankConnections
        connections={bankConnections}
        hasOpenBanking={hasOpenBanking}
      />

      {hasOpenBanking && bankTransactions.length > 0 && (
        <BankTransactionsList
          transactions={bankTransactions}
          members={members}
        />
      )}

      {hasOpenBanking && roundupResult.data && (
        <RoundupSettingsCard settings={roundupResult.data} goals={goals} />
      )}

      <AiCoachCard hasAccess={hasAiCoach} />
    </div>
  );
}
