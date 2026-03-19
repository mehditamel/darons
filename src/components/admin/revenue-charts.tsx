"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, TrendingUp, Users } from "lucide-react";

export interface RevenueData {
  mrr: number;
  arr: number;
  arpu: number;
  totalPaying: number;
  freeUsers: number;
  premiumUsers: number;
  familyProUsers: number;
  mrrHistory: Array<{ date: string; mrr: number; users: number }>;
}

interface RevenueChartsProps {
  revenue: RevenueData;
}

export function RevenueCharts({ revenue }: RevenueChartsProps) {
  const kpis = [
    {
      label: "MRR",
      value: `${revenue.mrr.toLocaleString("fr-FR")} €`,
      icon: DollarSign,
      color: "text-warm-teal",
    },
    {
      label: "ARR",
      value: `${revenue.arr.toLocaleString("fr-FR")} €`,
      icon: TrendingUp,
      color: "text-warm-gold",
    },
    {
      label: "ARPU",
      value: `${revenue.arpu.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`,
      icon: Users,
      color: "text-warm-blue",
    },
    {
      label: "Abonnés payants",
      value: revenue.totalPaying.toString(),
      icon: Users,
      color: "text-warm-purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                  <span className="text-sm text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">{revenue.freeUsers}</p>
              <p className="text-sm text-muted-foreground">Free</p>
              <p className="text-xs text-muted-foreground">0 €/mois</p>
            </div>
            <div className="rounded-lg border border-warm-teal/30 bg-warm-teal/5 p-4 text-center">
              <p className="text-2xl font-bold text-warm-teal">{revenue.premiumUsers}</p>
              <p className="text-sm text-muted-foreground">Premium</p>
              <p className="text-xs text-muted-foreground">9,90 €/mois</p>
            </div>
            <div className="rounded-lg border border-warm-gold/30 bg-warm-gold/5 p-4 text-center">
              <p className="text-2xl font-bold text-warm-gold">{revenue.familyProUsers}</p>
              <p className="text-sm text-muted-foreground">Family Pro</p>
              <p className="text-xs text-muted-foreground">19,90 €/mois</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MRR evolution */}
      {revenue.mrrHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution du MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue.mrrHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "mrr" ? `${value} €` : value,
                      name === "mrr" ? "MRR" : "Utilisateurs",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mrr"
                    stroke="#2BA89E"
                    name="MRR (€)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#4A7BE8"
                    name="Utilisateurs payants"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
