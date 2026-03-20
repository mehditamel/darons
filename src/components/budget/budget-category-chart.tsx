"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUDGET_CATEGORY_LABELS, BUDGET_CATEGORY_COLORS, type BudgetCategory } from "@/types/budget";
import { formatCurrency } from "@/lib/utils";

interface BudgetCategoryChartProps {
  byCategory: Record<string, number>;
}

export function BudgetCategoryChart({ byCategory }: BudgetCategoryChartProps) {
  const data = Object.entries(byCategory)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: BUDGET_CATEGORY_LABELS[key as BudgetCategory] ?? key,
      value,
      color: BUDGET_CATEGORY_COLORS[key as BudgetCategory] ?? "#BDBDBD",
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Répartition par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucune donnée pour ce mois
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Répartition par catégorie</CardTitle>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Répartition des dépenses par catégorie sous forme de camembert">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
