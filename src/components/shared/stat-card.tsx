"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { cn } from "@/lib/utils";

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
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up overflow-hidden",
        gradientClass,
        className
      )}
      role="status"
      aria-label={`${label} : ${value}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
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
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-transform hover:scale-110",
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
