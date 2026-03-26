"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUDGET_CATEGORY_LABELS, BUDGET_CATEGORY_COLORS, type BudgetCategory } from "@/types/budget";
import { formatCurrency } from "@/lib/utils";

interface CategoryTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string };
  }>;
}

function CategoryTooltip({ active, payload }: CategoryTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  return (
    <div className="rounded-xl bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg px-4 py-3">
      <p className="text-sm font-medium text-foreground flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: entry.payload.color }}
        />
        {entry.name}
      </p>
      <p className="text-base font-semibold mt-1" style={{ color: entry.payload.color }}>
        {formatCurrency(entry.value)}
      </p>
    </div>
  );
}

// Vibrant color palette for pie chart
const VIBRANT_COLORS: Record<string, string> = {
  alimentation: "#F97316",
  sante: "#14B8A6",
  garde: "#8B5CF6",
  vetements: "#EC4899",
  loisirs: "#3B82F6",
  scolarite: "#F59E0B",
  transport: "#6366F1",
  logement: "#10B981",
  assurance: "#EF4444",
  autre: "#94A3B8",
};

interface BudgetCategoryChartProps {
  byCategory: Record<string, number>;
}

export function BudgetCategoryChart({ byCategory }: BudgetCategoryChartProps) {
  const data = Object.entries(byCategory)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: BUDGET_CATEGORY_LABELS[key as BudgetCategory] ?? key,
      value,
      color: VIBRANT_COLORS[key] ?? BUDGET_CATEGORY_COLORS[key as BudgetCategory] ?? "#BDBDBD",
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
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
              activeIndex={-1}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
                  stroke="transparent"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CategoryTooltip />} />
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
