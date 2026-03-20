"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  HandCoins,
  BarChart3,
  Target,
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { BudgetEntryForm } from "./budget-entry-form";
import { BudgetEntryList } from "./budget-entry-list";
import { CafAllocationList } from "./caf-allocation-list";
import { SavingsGoalCard } from "./savings-goal-card";
import dynamic from "next/dynamic";

const BudgetCategoryChart = dynamic(() => import("./budget-category-chart").then((m) => m.BudgetCategoryChart), {
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  ssr: false,
});
const BudgetMonthlyChart = dynamic(() => import("./budget-monthly-chart").then((m) => m.BudgetMonthlyChart), {
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  ssr: false,
});
import type { BudgetEntry, CafAllocation, SavingsGoal, BudgetSummary } from "@/types/budget";
import type { FamilyMember } from "@/types/family";
import { formatCurrency } from "@/lib/utils";

interface BudgetTabsProps {
  entries: BudgetEntry[];
  allocations: CafAllocation[];
  goals: SavingsGoal[];
  summary: BudgetSummary;
  history: BudgetSummary[];
  members: FamilyMember[];
  currentMonth: string;
}

export function BudgetTabs({
  entries,
  allocations,
  goals,
  summary,
  history,
  members,
  currentMonth: initialMonth,
}: BudgetTabsProps) {
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date(initialMonth));

  const monthStr = format(selectedMonth, "yyyy-MM-dd");
  const monthLabel = format(selectedMonth, "MMMM yyyy", { locale: fr });

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedMonth((prev) =>
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const restAVivre = summary.netBalance;

  return (
    <div className="space-y-6">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")} aria-label="Mois précédent">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
        <Button variant="outline" size="icon" onClick={() => navigateMonth("next")} aria-label="Mois suivant">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Dépenses du mois"
          value={formatCurrency(summary.totalExpenses)}
          icon={Receipt}
          color="bg-warm-red/10 text-warm-red"
        />
        <StatCard
          label="Allocations CAF"
          value={formatCurrency(summary.totalAllocations)}
          icon={HandCoins}
          color="bg-warm-green/10 text-warm-green"
        />
        <StatCard
          label="Reste à vivre"
          value={formatCurrency(restAVivre)}
          icon={BarChart3}
          color={restAVivre >= 0 ? "bg-warm-teal/10 text-warm-teal" : "bg-warm-red/10 text-warm-red"}
        />
        <StatCard
          label="Entrées budget"
          value={`${summary.entryCount}`}
          icon={Target}
          color="bg-warm-blue/10 text-warm-blue"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="depenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="depenses" className="gap-1.5">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Dépenses & Revenus</span>
            <span className="sm:hidden">Dépenses</span>
          </TabsTrigger>
          <TabsTrigger value="allocations" className="gap-1.5">
            <HandCoins className="h-4 w-4" />
            <span className="hidden sm:inline">Allocations CAF</span>
            <span className="sm:hidden">CAF</span>
          </TabsTrigger>
          <TabsTrigger value="graphiques" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Graphiques</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="epargne" className="gap-1.5">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Épargne</span>
            <span className="sm:hidden">Épargne</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="depenses" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowEntryForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une entrée
            </Button>
          </div>
          <BudgetEntryList
            entries={entries}
            currentMonth={monthStr}
            members={members}
          />
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <CafAllocationList allocations={allocations} />
        </TabsContent>

        <TabsContent value="graphiques" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <BudgetCategoryChart byCategory={summary.byCategory} />
            <BudgetMonthlyChart history={history} />
          </div>
        </TabsContent>

        <TabsContent value="epargne" className="space-y-4">
          <SavingsGoalCard goals={goals} />
        </TabsContent>
      </Tabs>

      <BudgetEntryForm
        open={showEntryForm}
        onOpenChange={setShowEntryForm}
        currentMonth={monthStr}
        members={members}
      />
    </div>
  );
}
