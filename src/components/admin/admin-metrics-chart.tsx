"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AdminMetricsDaily } from "@/types/sharing";

interface AdminMetricsChartProps {
  metrics: AdminMetricsDaily[];
}

export function AdminMetricsChart({ metrics }: AdminMetricsChartProps) {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Aucune donnée disponible.</p>
        <p className="text-xs mt-1">Les métriques seront collectées quotidiennement.</p>
      </div>
    );
  }

  const data = metrics.map((m) => ({
    date: new Date(m.metricDate).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    utilisateurs: m.totalUsers,
    nouveaux: m.newUsers,
    mrr: m.mrrCents / 100,
    premium: m.premiumUsers,
    pro: m.familyProUsers,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "mrr") return [`${value.toLocaleString("fr-FR")} €`, "MRR"];
            return [value, name];
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="utilisateurs"
          stroke="#4A7BE8"
          strokeWidth={2}
          dot={false}
          name="Utilisateurs"
        />
        <Line
          type="monotone"
          dataKey="nouveaux"
          stroke="#2BA89E"
          strokeWidth={2}
          dot={false}
          name="Nouveaux"
        />
        <Line
          type="monotone"
          dataKey="mrr"
          stroke="#D4A843"
          strokeWidth={2}
          dot={false}
          name="MRR (€)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
