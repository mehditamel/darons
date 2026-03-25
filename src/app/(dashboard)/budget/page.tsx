import type { Metadata } from "next";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  HandCoins,
  Receipt,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
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
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Budget familial",
  description: "Suivez vos dépenses, allocations CAF et reste à charge",
};

function resolveMonth(monthParam?: string): string {
  if (monthParam && /^\d{4}-\d{2}-01$/.test(monthParam)) {
    const d = new Date(monthParam);
    if (!isNaN(d.getTime())) return monthParam;
  }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const currentMonth = resolveMonth(params.month);

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

  // Month-over-month comparison
  const previousMonth = history.length >= 2 ? history[1] : null;
  const expenseTrend = previousMonth && previousMonth.totalExpenses > 0
    ? ((summary.totalExpenses - previousMonth.totalExpenses) / previousMonth.totalExpenses * 100)
    : null;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Budget familial"
        description="Où passe ta thune ? On te montre"
        icon={<Wallet className="h-5 w-5" />}
      />

      {/* Summary stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Dépenses du mois"
          value={formatCurrency(summary.totalExpenses)}
          icon={<TrendingDown className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-red/10 text-warm-red"
          gradientClass="card-gradient-red"
          trend={expenseTrend !== null ? `${expenseTrend > 0 ? "+" : ""}${expenseTrend.toFixed(0)}% vs mois dernier` : undefined}
          trendUp={expenseTrend !== null && expenseTrend < 0}
        />
        <StatCard
          label="Allocations CAF"
          value={formatCurrency(summary.totalAllocations)}
          icon={<HandCoins className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-green/10 text-warm-green"
          gradientClass="card-gradient-green"
        />
        <StatCard
          label="Solde net"
          value={formatCurrency(summary.netBalance)}
          icon={summary.netBalance >= 0 ? <TrendingUp className="h-5 w-5" aria-hidden="true" /> : <TrendingDown className="h-5 w-5" aria-hidden="true" />}
          color={summary.netBalance >= 0 ? "bg-warm-green/10 text-warm-green" : "bg-warm-red/10 text-warm-red"}
          gradientClass={summary.netBalance >= 0 ? "card-gradient-green" : "card-gradient-red"}
        />
        <StatCard
          label="Opérations"
          value={String(summary.entryCount)}
          icon={<Receipt className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
      </div>

      {/* Alert if negative balance */}
      {summary.netBalance < 0 && summary.entryCount > 0 && (
        <AlertCard
          title="Solde négatif ce mois-ci"
          message={`Tes dépenses dépassent tes revenus de ${formatCurrency(Math.abs(summary.netBalance))}. Regarde les postes les plus importants pour identifier des économies possibles.`}
          priority="high"
          category="Budget"
        />
      )}

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
