import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { BudgetTabs } from "@/components/budget/budget-tabs";
import { getFamilyMembers } from "@/lib/actions/family";
import {
  getBudgetEntries,
  getCafAllocations,
  getSavingsGoals,
  getBudgetSummary,
  getBudgetHistory,
} from "@/lib/actions/budget";

export const metadata: Metadata = {
  title: "Budget familial",
  description: "Suivez vos dépenses, allocations CAF et reste à charge",
};

export default async function BudgetPage() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [membersResult, entriesResult, allocResult, goalsResult, summaryResult, historyResult] =
    await Promise.all([
      getFamilyMembers(),
      getBudgetEntries(currentMonth),
      getCafAllocations(),
      getSavingsGoals(),
      getBudgetSummary(currentMonth),
      getBudgetHistory(6),
    ]);

  const members = membersResult.data ?? [];
  const entries = entriesResult.data ?? [];
  const allocations = allocResult.data ?? [];
  const goals = goalsResult.data ?? [];
  const history = historyResult.data ?? [];

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
    <div className="space-y-6">
      <PageHeader
        title="Budget familial"
        description="Suivez vos dépenses, allocations CAF et reste à charge"
      />

      <BudgetTabs
        entries={entries}
        allocations={allocations}
        goals={goals}
        summary={summary}
        history={history}
        members={members}
        currentMonth={currentMonth}
      />
    </div>
  );
}
