"use client";

import { HeartPulse, Wallet, FileText, Sun, CloudSun, Cloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { cn } from "@/lib/utils";

type WeatherStatus = "good" | "warning" | "alert";

interface WeatherIndicator {
  label: string;
  status: WeatherStatus;
  detail: string;
}

interface HouseholdWeatherProps {
  health: WeatherIndicator;
  budget: WeatherIndicator;
  admin: WeatherIndicator;
}

const STATUS_CONFIG: Record<
  WeatherStatus,
  { icon: typeof Sun; color: string; bg: string; label: string; score: number; ringColor: string }
> = {
  good: { icon: Sun, color: "text-warm-green", bg: "bg-warm-green/10", label: "OK", score: 100, ringColor: "text-warm-green" },
  warning: { icon: CloudSun, color: "text-warm-orange", bg: "bg-warm-orange/10", label: "Attention", score: 60, ringColor: "text-warm-orange" },
  alert: { icon: Cloud, color: "text-warm-red", bg: "bg-warm-red/10", label: "Urgent", score: 25, ringColor: "text-warm-red" },
};

const MODULE_CONFIG = {
  health: { icon: HeartPulse, color: "text-warm-teal", label: "Santé" },
  budget: { icon: Wallet, color: "text-warm-blue", label: "Budget" },
  admin: { icon: FileText, color: "text-warm-orange", label: "Admin" },
} as const;

export function HouseholdWeather({
  health,
  budget,
  admin,
}: HouseholdWeatherProps) {
  const indicators = [
    { key: "health" as const, data: health },
    { key: "budget" as const, data: budget },
    { key: "admin" as const, data: admin },
  ];

  const overallScore = Math.round(
    indicators.reduce((sum, { data }) => sum + STATUS_CONFIG[data.status].score, 0) / 3
  );
  const overallColor = overallScore >= 80 ? "text-warm-green" : overallScore >= 50 ? "text-warm-orange" : "text-warm-red";

  return (
    <Card className="border-dashed overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Overall gauge */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <ProgressRing
              value={overallScore}
              size={56}
              strokeWidth={5}
              color={overallColor}
              animated
            />
            <span className="text-[10px] font-medium text-muted-foreground">Global</span>
          </div>

          {/* Module indicators */}
          <div className="grid grid-cols-3 gap-2 flex-1">
            {indicators.map(({ key, data }) => {
              const statusConfig = STATUS_CONFIG[data.status];
              const moduleConfig = MODULE_CONFIG[key];
              const StatusIcon = statusConfig.icon;
              const ModuleIcon = moduleConfig.icon;

              return (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-all",
                    statusConfig.bg,
                    data.status === "alert" && "animate-pulse"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <ModuleIcon
                      className={cn("h-3.5 w-3.5", moduleConfig.color)}
                    />
                    <StatusIcon
                      className={cn("h-3.5 w-3.5", statusConfig.color)}
                    />
                  </div>
                  <span className="text-[10px] font-semibold">{moduleConfig.label}</span>
                  <span className="text-[9px] text-muted-foreground text-center leading-tight line-clamp-2">
                    {data.detail}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
