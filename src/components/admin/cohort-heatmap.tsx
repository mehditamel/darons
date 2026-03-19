"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CohortData {
  cohortDate: string;
  totalUsers: number;
  retentionJ1: number;
  retentionJ7: number;
  retentionJ30: number;
  retentionJ90: number;
}

interface CohortHeatmapProps {
  cohorts: CohortData[];
}

function getCellColor(rate: number): string {
  if (rate >= 80) return "bg-green-600 text-white";
  if (rate >= 60) return "bg-green-400 text-white";
  if (rate >= 40) return "bg-yellow-400 text-black";
  if (rate >= 20) return "bg-orange-400 text-white";
  if (rate > 0) return "bg-red-400 text-white";
  return "bg-muted text-muted-foreground";
}

export function CohortHeatmap({ cohorts }: CohortHeatmapProps) {
  if (cohorts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse de cohortes</CardTitle>
          <CardDescription>
            Les données de rétention apparaîtront ici lorsque suffisamment d&apos;utilisateurs se seront inscrits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">Aucune donnée de cohorte disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const periods = ["J+1", "J+7", "J+30", "J+90"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rétention par cohorte</CardTitle>
        <CardDescription>
          Pourcentage d&apos;utilisateurs actifs après J+1, J+7, J+30 et J+90
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium">Semaine</th>
                <th className="px-3 py-2 text-center font-medium">Inscrits</th>
                {periods.map((p) => (
                  <th key={p} className="px-3 py-2 text-center font-medium">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => {
                const rates = [
                  cohort.retentionJ1,
                  cohort.retentionJ7,
                  cohort.retentionJ30,
                  cohort.retentionJ90,
                ];
                return (
                  <tr key={cohort.cohortDate} className="border-b last:border-b-0">
                    <td className="px-3 py-2 text-xs">
                      {new Date(cohort.cohortDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-medium">
                      {cohort.totalUsers}
                    </td>
                    {rates.map((rate, i) => (
                      <td key={i} className="px-1 py-1 text-center">
                        <span
                          className={cn(
                            "inline-block w-14 rounded px-2 py-1 text-xs font-medium",
                            getCellColor(rate)
                          )}
                        >
                          {rate > 0 ? `${rate}%` : "—"}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span>Rétention :</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-red-400" /> &lt;20%
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-orange-400" /> 20-40%
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-yellow-400" /> 40-60%
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-green-400" /> 60-80%
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-green-600" /> &gt;80%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
