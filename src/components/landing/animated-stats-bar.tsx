"use client";

import { AnimatedCounter } from "@/components/shared/animated-counter";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

const STATS: Array<{ value: number; suffix: string; label: string; prefix?: string; isZero?: boolean }> = [
  { value: 6, suffix: " modules", label: "Modules complets" },
  { value: 15, suffix: " outils", label: "Outils gratuits" },
  { value: 100, suffix: "% gratuit", label: "Gratuit pour toujours" },
  { value: 0, suffix: "€", label: "Pas de premium caché", prefix: "", isZero: true },
];

export function AnimatedStatsBar() {
  return (
    <ScrollReveal direction="up">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-gradient">
              {stat.isZero ? (
                "0€"
              ) : (
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix ?? ""}
                  duration={1.2}
                />
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
