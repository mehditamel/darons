"use client";

import { TrendingDown, TrendingUp, AlertTriangle, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { BudgetSummary } from "@/types/budget";

interface BudgetForecastCardProps {
  currentSummary: BudgetSummary;
  history: BudgetSummary[];
}

function calculateForecast(
  currentSummary: BudgetSummary,
  history: BudgetSummary[]
): {
  forecastExpenses: number;
  dailyBudget: number;
  daysRemaining: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
} {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = daysInMonth - currentDay;

  // Project current month expenses to full month
  const dailyRate = currentDay > 0 ? currentSummary.totalExpenses / currentDay : 0;
  const forecastExpenses = dailyRate * daysInMonth;

  // Calculate daily budget remaining
  const totalIncome = currentSummary.totalIncome + currentSummary.totalAllocations;
  const remainingBudget = totalIncome - currentSummary.totalExpenses;
  const dailyBudget = daysRemaining > 0 ? remainingBudget / daysRemaining : remainingBudget;

  // Calculate trend vs previous month
  const previousMonth = history.length >= 2 ? history[1] : null;
  let trend: "up" | "down" | "stable" = "stable";
  let trendPercent = 0;

  if (previousMonth && previousMonth.totalExpenses > 0) {
    const diff = forecastExpenses - previousMonth.totalExpenses;
    trendPercent = Math.round((diff / previousMonth.totalExpenses) * 100);
    if (trendPercent > 5) trend = "up";
    else if (trendPercent < -5) trend = "down";
  }

  return { forecastExpenses, dailyBudget, daysRemaining, trend, trendPercent };
}

export function BudgetForecastCard({ currentSummary, history }: BudgetForecastCardProps) {
  const { forecastExpenses, dailyBudget, daysRemaining, trend, trendPercent } =
    calculateForecast(currentSummary, history);

  const totalIncome = currentSummary.totalIncome + currentSummary.totalAllocations;
  const spentPercent = totalIncome > 0
    ? Math.min(Math.round((currentSummary.totalExpenses / totalIncome) * 100), 100)
    : 0;

  const isOverBudget = dailyBudget < 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-5 w-5 text-warm-blue" />
          Prévision à 30 jours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Spending progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dépensé ce mois</span>
            <span className="font-medium">
              {formatCurrency(currentSummary.totalExpenses)} / {formatCurrency(totalIncome)}
            </span>
          </div>
          <Progress
            value={spentPercent}
            className={`h-2 ${spentPercent > 80 ? "[&>div]:bg-warm-red" : ""}`}
          />
        </div>

        {/* Forecast grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Prévision fin de mois</p>
            <p className="text-lg font-semibold">{formatCurrency(forecastExpenses)}</p>
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-warm-red" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3 w-3 text-warm-green" />
              ) : null}
              {trendPercent !== 0 && (
                <span
                  className={`text-xs ${
                    trend === "up" ? "text-warm-red" : "text-warm-green"
                  }`}
                >
                  {trendPercent > 0 ? "+" : ""}{trendPercent}% vs mois dernier
                </span>
              )}
            </div>
          </div>

          <div
            className={`rounded-lg border p-3 space-y-1 ${
              isOverBudget ? "border-warm-red/30 bg-warm-red/5" : ""
            }`}
          >
            <p className="text-xs text-muted-foreground">Reste à vivre / jour</p>
            <p className={`text-lg font-semibold ${isOverBudget ? "text-warm-red" : ""}`}>
              {formatCurrency(dailyBudget)}
            </p>
            <p className="text-xs text-muted-foreground">
              {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} restant{daysRemaining > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Alert if over budget */}
        {isOverBudget && (
          <div className="flex items-start gap-2 rounded-lg bg-warm-red/10 p-3">
            <AlertTriangle className="h-4 w-4 text-warm-red mt-0.5 shrink-0" />
            <p className="text-xs text-warm-red">
              Attention, tu dépenses plus que tes revenus ce mois-ci.
              Reste à vivre négatif : {formatCurrency(Math.abs(dailyBudget))} de dépassement par jour.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
