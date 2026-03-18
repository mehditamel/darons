"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Ruler, Weight, Circle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { GrowthForm } from "@/components/sante/growth-form";
import { getPercentileData } from "@/data/oms-percentiles";
import { differenceInMonths, differenceInWeeks } from "date-fns";
import type { GrowthMeasurement } from "@/types/health";
import type { FamilyMember, Gender } from "@/types/family";

interface GrowthChartProps {
  member: FamilyMember;
  measurements: GrowthMeasurement[];
}

type MetricType = "weight" | "height" | "headCircumference";

const METRIC_CONFIG: Record<MetricType, { label: string; unit: string; icon: typeof Weight; color: string }> = {
  weight: { label: "Poids", unit: "kg", icon: Weight, color: "#2BA89E" },
  height: { label: "Taille", unit: "cm", icon: Ruler, color: "#4A7BE8" },
  headCircumference: { label: "Périmètre crânien", unit: "cm", icon: Circle, color: "#7B5EA7" },
};

export function GrowthChart({ member, measurements }: GrowthChartProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricType>("weight");
  const [useCorrectedAge, setUseCorrectedAge] = useState(false);

  const isPremature =
    member.gestationalAgeWeeks !== null &&
    member.gestationalAgeWeeks !== undefined &&
    member.gestationalAgeWeeks < 37;
  const correctionWeeks = isPremature ? 40 - (member.gestationalAgeWeeks ?? 40) : 0;

  if (measurements.length === 0) {
    return (
      <>
        <EmptyState
          icon={Ruler}
          title="Aucune mesure"
          description="Enregistrez les mesures de poids, taille et périmètre crânien pour suivre la croissance."
          actionLabel="Ajouter une mesure"
          onAction={() => setFormOpen(true)}
        />
        <GrowthForm open={formOpen} onOpenChange={setFormOpen} memberId={member.id} />
      </>
    );
  }

  const percentiles = getPercentileData(activeMetric, member.gender as Gender);
  const config = METRIC_CONFIG[activeMetric];

  const childData = measurements
    .map((m) => {
      let ageMonths = differenceInMonths(new Date(m.measurementDate), new Date(member.birthDate));
      if (useCorrectedAge && isPremature) {
        const correctionMonths = Math.round(correctionWeeks / 4.33);
        ageMonths = Math.max(0, ageMonths - correctionMonths);
      }
      const value =
        activeMetric === "weight" ? m.weightKg :
        activeMetric === "height" ? m.heightCm :
        m.headCircumferenceCm;
      return value ? { ageMonths, value } : null;
    })
    .filter((d): d is { ageMonths: number; value: number } => d !== null)
    .sort((a, b) => a.ageMonths - b.ageMonths);

  const chartData = percentiles.map((p) => {
    const childPoint = childData.find((d) => d.ageMonths === p.ageMonths);
    return {
      ageMonths: p.ageMonths,
      p3: p.p3,
      p15: p.p15,
      p50: p.p50,
      p85: p.p85,
      p97: p.p97,
      enfant: childPoint?.value ?? null,
    };
  });

  // Add child measurements that fall between standard age points
  childData.forEach((cd) => {
    if (!chartData.find((d) => d.ageMonths === cd.ageMonths)) {
      chartData.push({
        ageMonths: cd.ageMonths,
        p3: null as unknown as number,
        p15: null as unknown as number,
        p50: null as unknown as number,
        p85: null as unknown as number,
        p97: null as unknown as number,
        enfant: cd.value,
      });
    }
  });
  chartData.sort((a, b) => a.ageMonths - b.ageMonths);

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2">
          {(Object.entries(METRIC_CONFIG) as [MetricType, typeof config][]).map(([key, cfg]) => (
            <Button
              key={key}
              variant={activeMetric === key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMetric(key)}
            >
              {cfg.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {isPremature && (
            <div className="flex items-center gap-2">
              <Switch
                id="corrected-age"
                checked={useCorrectedAge}
                onCheckedChange={setUseCorrectedAge}
              />
              <Label htmlFor="corrected-age" className="text-xs cursor-pointer">
                \u00c2ge corrig\u00e9 ({member.gestationalAgeWeeks} SA)
              </Label>
            </div>
          )}
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Mesure
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {config.label} — {member.firstName} ({member.gender === "M" ? "Gar\u00e7on" : "Fille"})
            {useCorrectedAge && isPremature && (
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (\u00e2ge corrig\u00e9)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="ageMonths"
                label={{ value: "Âge (mois)", position: "insideBottomRight", offset: -5 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{ value: config.unit, angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    p3: "P3", p15: "P15", p50: "P50 (médiane)",
                    p85: "P85", p97: "P97", enfant: member.firstName,
                  };
                  return [value ? `${value} ${config.unit}` : "-", labels[name] ?? name];
                }}
                labelFormatter={(label) => `${label} mois`}
              />
              <Legend />
              <Line dataKey="p3" stroke="#e0e0e0" strokeDasharray="3 3" dot={false} name="P3" />
              <Line dataKey="p15" stroke="#c0c0c0" strokeDasharray="3 3" dot={false} name="P15" />
              <Line dataKey="p50" stroke="#999" strokeWidth={2} dot={false} name="P50" />
              <Line dataKey="p85" stroke="#c0c0c0" strokeDasharray="3 3" dot={false} name="P85" />
              <Line dataKey="p97" stroke="#e0e0e0" strokeDasharray="3 3" dot={false} name="P97" />
              <Line
                dataKey="enfant"
                stroke={config.color}
                strokeWidth={3}
                dot={{ r: 5, fill: config.color }}
                name={member.firstName}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Measurements table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Mesures enregistrées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Âge</th>
                  <th className="text-right py-2 px-3">Poids (kg)</th>
                  <th className="text-right py-2 px-3">Taille (cm)</th>
                  <th className="text-right py-2 px-3">PC (cm)</th>
                </tr>
              </thead>
              <tbody>
                {[...measurements].reverse().map((m) => {
                  const ageMonths = differenceInMonths(
                    new Date(m.measurementDate),
                    new Date(member.birthDate)
                  );
                  return (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2 px-3">{new Date(m.measurementDate).toLocaleDateString("fr-FR")}</td>
                      <td className="py-2 px-3">{ageMonths} mois</td>
                      <td className="text-right py-2 px-3">{m.weightKg ?? "—"}</td>
                      <td className="text-right py-2 px-3">{m.heightCm ?? "—"}</td>
                      <td className="text-right py-2 px-3">{m.headCircumferenceCm ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <GrowthForm open={formOpen} onOpenChange={setFormOpen} memberId={member.id} />
    </>
  );
}
