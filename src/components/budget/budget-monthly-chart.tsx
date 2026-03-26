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

const LABEL_MAP: Record<string, string> = {
  depenses: "Dépenses",
  revenus: "Revenus + Allocations",
};

interface MonthlyTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function MonthlyTooltip({ active, payload, label }: MonthlyTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg px-4 py-3 min-w-[160px]">
      <p className="text-sm font-medium text-foreground capitalize mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            {LABEL_MAP[entry.dataKey] ?? entry.dataKey}
          </span>
          <span className="text-sm font-semibold" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

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
            <defs>
              <linearGradient id="gradientExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8534A" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#E8534A" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.5} />
              </linearGradient>
            </defs>
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
            <Tooltip content={<MonthlyTooltip />} />
            <Legend
              formatter={(value: string) =>
                LABEL_MAP[value] ?? value
              }
            />
            <Bar
              dataKey="depenses"
              fill="url(#gradientExpenses)"
              radius={[4, 4, 0, 0]}
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="revenus"
              fill="url(#gradientIncome)"
              radius={[4, 4, 0, 0]}
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
