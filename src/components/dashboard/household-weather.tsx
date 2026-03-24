import { HeartPulse, Wallet, FileText, Sun, CloudSun, Cloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  { icon: typeof Sun; color: string; bg: string; label: string }
> = {
  good: { icon: Sun, color: "text-warm-green", bg: "bg-warm-green/10", label: "OK" },
  warning: { icon: CloudSun, color: "text-warm-orange", bg: "bg-warm-orange/10", label: "Attention" },
  alert: { icon: Cloud, color: "text-warm-red", bg: "bg-warm-red/10", label: "Urgent" },
};

const MODULE_CONFIG = {
  health: { icon: HeartPulse, color: "text-warm-teal" },
  budget: { icon: Wallet, color: "text-warm-blue" },
  admin: { icon: FileText, color: "text-warm-orange" },
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

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {indicators.map(({ key, data }) => {
            const statusConfig = STATUS_CONFIG[data.status];
            const moduleConfig = MODULE_CONFIG[key];
            const StatusIcon = statusConfig.icon;
            const ModuleIcon = moduleConfig.icon;

            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all",
                  statusConfig.bg
                )}
              >
                <div className="flex items-center gap-1.5">
                  <ModuleIcon
                    className={cn("h-4 w-4", moduleConfig.color)}
                  />
                  <StatusIcon
                    className={cn("h-4 w-4", statusConfig.color)}
                  />
                </div>
                <span className="text-xs font-semibold">{data.label}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {data.detail}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
