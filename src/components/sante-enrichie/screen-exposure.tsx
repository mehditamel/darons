"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SCREEN_EXPOSURE_RECOMMENDATIONS } from "@/lib/constants";
import { differenceInMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DailyHealthJournal } from "@/types/health";
import type { FamilyMember } from "@/types/family";

interface ScreenExposureProps {
  member: FamilyMember;
  journal: DailyHealthJournal[];
}

export function ScreenExposure({ member, journal }: ScreenExposureProps) {
  const childAgeMonths = differenceInMonths(new Date(), new Date(member.birthDate));

  const currentReco = SCREEN_EXPOSURE_RECOMMENDATIONS.find(
    (r) => childAgeMonths >= r.minMonths && childAgeMonths < r.maxMonths
  );

  const screenEntries = journal
    .filter((e) => e.screenTimeMinutes !== null && e.screenTimeMinutes !== undefined)
    .sort((a, b) => a.entryDate.localeCompare(b.entryDate))
    .slice(-30);

  const chartData = screenEntries.map((e) => ({
    date: format(new Date(e.entryDate), "dd/MM", { locale: fr }),
    minutes: e.screenTimeMinutes ?? 0,
    limit: currentReco?.maxMinutesPerDay ?? 0,
  }));

  const avgScreenTime =
    screenEntries.length > 0
      ? Math.round(
          screenEntries.reduce((sum, e) => sum + (e.screenTimeMinutes ?? 0), 0) /
            screenEntries.length
        )
      : null;

  const isOverLimit =
    avgScreenTime !== null &&
    currentReco &&
    avgScreenTime > currentReco.maxMinutesPerDay;

  return (
    <div className="space-y-4">
      {currentReco && (
        <Card
          className={
            isOverLimit
              ? "border-orange-200 bg-orange-50/30"
              : "border-green-200 bg-green-50/30"
          }
        >
          <CardContent className="py-4 px-4">
            <div className="flex items-start gap-3">
              {isOverLimit ? (
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  Recommandation ({currentReco.ageRange}) :{" "}
                  {currentReco.recommendation}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentReco.details}
                </p>
                {avgScreenTime !== null && (
                  <p className="text-xs mt-2">
                    <Badge
                      variant="outline"
                      className={
                        isOverLimit
                          ? "bg-orange-100 text-orange-700 border-orange-200"
                          : "bg-green-100 text-green-700 border-green-200"
                      }
                    >
                      Moyenne : {avgScreenTime} min/jour
                    </Badge>
                    {currentReco.maxMinutesPerDay > 0 && (
                      <span className="ml-2 text-muted-foreground">
                        (limite : {currentReco.maxMinutesPerDay} min/jour)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {childAgeMonths < 3 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Monitor className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Le suivi de l&apos;exposition aux \u00e9crans commence \u00e0 partir de 3 mois.
            </p>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              \u00c9volution du temps d&apos;\u00e9cran (30 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  label={{ value: "min", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      minutes: "Temps d'\u00e9cran",
                      limit: "Limite recommand\u00e9e",
                    };
                    return [`${value} min`, labels[name] ?? name];
                  }}
                />
                <Line
                  dataKey="minutes"
                  stroke="#E8734A"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="minutes"
                />
                {currentReco && currentReco.maxMinutesPerDay > 0 && (
                  <Line
                    dataKey="limit"
                    stroke="#4CAF50"
                    strokeDasharray="5 5"
                    dot={false}
                    name="limit"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {chartData.length === 0 && childAgeMonths >= 3 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Monitor className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune donn\u00e9e d&apos;exposition aux \u00e9crans. Renseignez le temps d&apos;\u00e9cran
              dans le journal quotidien.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
