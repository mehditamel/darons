import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, ArrowRight } from "lucide-react";
import type { DevelopmentMilestone, MilestoneCategory } from "@/types/health";
import { MILESTONE_CATEGORY_LABELS } from "@/types/health";
import { differenceInMonths } from "date-fns";

interface MilestonesProgressCardProps {
  milestones: DevelopmentMilestone[];
  childName: string;
  birthDate: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  motricite: "bg-warm-teal",
  langage: "bg-warm-blue",
  cognition: "bg-warm-purple",
  social: "bg-warm-orange",
  autonomie: "bg-warm-gold",
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
            <div className="space-y-2">
              {categoryStats.filter((c) => c.total > 0).map((stat) => (
                <div key={stat.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {MILESTONE_CATEGORY_LABELS[stat.category]}
                    </span>
                    <span className="text-xs font-medium">{stat.achieved}/{stat.total}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${CATEGORY_COLORS[stat.category] ?? "bg-primary"}`}
                      style={{ width: `${stat.percent}%` }}
                    />
                  </div>
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
