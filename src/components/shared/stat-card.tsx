"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Sparkline } from "@/components/shared/sparkline";
import { cn } from "@/lib/utils";

const SHADOW_MAP: Record<string, string> = {
  "card-gradient-orange": "hover:shadow-warm-orange",
  "card-gradient-teal": "hover:shadow-warm-teal",
  "card-gradient-blue": "hover:shadow-warm-blue",
  "card-gradient-purple": "hover:shadow-warm-purple",
  "card-gradient-gold": "hover:shadow-warm-gold",
  "card-gradient-green": "hover:shadow-warm-green",
  "card-gradient-red": "hover:shadow-warm-red",
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
  const coloredShadow = gradientClass ? SHADOW_MAP[gradientClass] : undefined;
  const sparklineColor = gradientClass ? COLOR_MAP[gradientClass] : "#2BA89E";

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-in-up overflow-hidden",
        gradientClass,
        coloredShadow,
        className
      )}
      role="status"
      aria-label={`${label} : ${value}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold" aria-hidden="true">
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
                  trendUp ? "text-warm-green" : "text-warm-red"
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
