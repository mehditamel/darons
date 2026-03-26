"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MiniProgressRing } from "@/components/shared/progress-ring";
import { TrendingUp, ArrowRight } from "lucide-react";
import type { DevelopmentMilestone, MilestoneCategory } from "@/types/health";
import { MILESTONE_CATEGORY_LABELS } from "@/types/health";
import { differenceInMonths } from "date-fns";

interface MilestonesProgressCardProps {
  milestones: DevelopmentMilestone[];
  childName: string;
  birthDate: string;
}

const CATEGORY_RING_COLORS: Record<string, string> = {
  motricite: "text-warm-teal",
  langage: "text-warm-blue",
  cognition: "text-warm-purple",
  social: "text-warm-orange",
  autonomie: "text-warm-gold",
};

const CATEGORY_BG_COLORS: Record<string, string> = {
  motricite: "bg-warm-teal/10",
  langage: "bg-warm-blue/10",
  cognition: "bg-warm-purple/10",
  social: "bg-warm-orange/10",
  autonomie: "bg-warm-gold/10",
};

export function MilestonesProgressCard({ milestones, childName, birthDate }: MilestonesProgressCardProps) {
  const ageMonths = differenceInMonths(new Date(), new Date(birthDate));

  const categories: MilestoneCategory[] = ["motricite", "langage", "cognition", "social", "autonomie"];

  const categoryStats = categories.map((cat) => {
    const catMilestones = milestones.filter(
      (m) => m.category === cat && m.expectedAgeMonths != null && m.expectedAgeMonths <= ageMonths
    );
    const achieved = catMilestones.filter((m) => m.achievedDate != null).length;
    const total = catMilestones.length;
    const percent = total > 0 ? Math.round((achieved / total) * 100) : 0;
    return { category: cat, achieved, total, percent };
  });

  const totalAchieved = categoryStats.reduce((s, c) => s + c.achieved, 0);
  const totalExpected = categoryStats.reduce((s, c) => s + c.total, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-warm-green" />
          Développement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {totalExpected > 0 ? (
          <>
            <p className="text-xs text-muted-foreground">
              {childName} : {totalAchieved}/{totalExpected} jalons atteints
            </p>
            <div className="grid grid-cols-5 gap-2">
              {categoryStats.filter((c) => c.total > 0).map((stat) => (
                <div
                  key={stat.category}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className={`rounded-full p-1.5 ${CATEGORY_BG_COLORS[stat.category] ?? "bg-muted"}`}>
                    <MiniProgressRing
                      value={stat.percent}
                      size={28}
                      color={CATEGORY_RING_COLORS[stat.category] ?? "text-primary"}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground text-center leading-tight">
                    {MILESTONE_CATEGORY_LABELS[stat.category]}
                  </span>
                  <span className="text-[10px] font-semibold tabular-nums">
                    {stat.achieved}/{stat.total}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-2">
            Ajoute des jalons pour suivre le développement de {childName}.
          </p>
        )}
        <Button variant="ghost" size="sm" className="w-full mt-1" asChild>
          <Link href="/developpement">
            Voir le développement
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
