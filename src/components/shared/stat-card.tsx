"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Sparkline } from "@/components/shared/sparkline";
import { cn } from "@/lib/utils";

type CardTone =
  | "orange"
  | "teal"
  | "blue"
  | "purple"
  | "gold"
  | "green"
  | "red";

const TONE_MAP: Record<string, CardTone> = {
  "card-gradient-orange": "orange",
  "card-gradient-teal": "teal",
  "card-gradient-blue": "blue",
  "card-gradient-purple": "purple",
  "card-gradient-gold": "gold",
  "card-gradient-green": "green",
  "card-gradient-red": "red",
};

const COLOR_MAP: Record<string, string> = {
  "card-gradient-orange": "#E8734A",
  "card-gradient-teal": "#2BA89E",
  "card-gradient-blue": "#4A7BE8",
  "card-gradient-purple": "#7B5EA7",
  "card-gradient-gold": "#D4A843",
  "card-gradient-green": "#4CAF50",
  "card-gradient-red": "#E8534A",
};

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  gradientClass?: string;
  className?: string;
  numericValue?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  sparklineData?: number[];
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  color = "bg-primary/10 text-primary",
  gradientClass,
  className,
  numericValue,
  valuePrefix = "",
  valueSuffix = "",
  sparklineData,
}: StatCardProps) {
  const tone = gradientClass ? TONE_MAP[gradientClass] : undefined;
  const sparklineColor = gradientClass ? COLOR_MAP[gradientClass] : "#2BA89E";

  return (
    <Card
      variant={gradientClass ? "gradient" : "interactive"}
      tone={tone}
      className={cn("animate-fade-in-up overflow-hidden", className)}
      role="status"
      aria-label={`${label} : ${value}`}
    >
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-xl sm:text-2xl font-bold" aria-hidden="true">
              {numericValue !== undefined ? (
                <AnimatedCounter
                  value={numericValue}
                  prefix={valuePrefix}
                  suffix={valueSuffix}
                  duration={1}
                />
              ) : (
                value
              )}
            </p>
            {trend && (
              <p
                className={cn(
                  "text-xs flex items-center gap-1 font-medium",
                  trendUp ? "text-success" : "text-danger"
                )}
              >
                {trendUp ? (
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-3 w-3" aria-hidden="true" />
                )}
                {trend}
              </p>
            )}
            {sparklineData && sparklineData.length >= 2 && (
              <div className="pt-1">
                <Sparkline
                  data={sparklineData}
                  color={sparklineColor}
                  width={80}
                  height={20}
                />
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110",
              color
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
