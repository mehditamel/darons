"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BudgetSummary } from "@/types/budget";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BudgetMonthlyChartProps {
  history: BudgetSummary[];
}

export function BudgetMonthlyChart({ history }: BudgetMonthlyChartProps) {
  const data = history.map((s) => ({
    month: format(new Date(s.month), "MMM yy", { locale: fr }),
    depenses: s.totalExpenses,
    revenus: s.totalIncome + s.totalAllocations,
  }));

  if (data.every((d) => d.depenses === 0 && d.revenus === 0)) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Évolution mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Pas encore de données sur plusieurs mois
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Évolution mensuelle</CardTitle>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Graphique de l'évolution du budget mensuel : dépenses et revenus sur les derniers mois">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${Math.round(v / 100) * 100} €`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === "depenses" ? "Dépenses" : "Revenus + Allocations",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              }}
            />
            <Legend
              formatter={(value: string) =>
                value === "depenses" ? "Dépenses" : "Revenus + Allocations"
              }
            />
            <Bar dataKey="depenses" fill="#E8534A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenus" fill="#4CAF50" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
