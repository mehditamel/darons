import type { Metadata } from "next";
import {
  Footprints,
  MessageCircle,
  Brain,
  Users2,
  Hand,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { DeveloppementTabs } from "@/components/developpement/developpement-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFamilyMembers } from "@/lib/actions/family";
import { getMilestones, getJournalEntries } from "@/lib/actions/educational";
import { DEVELOPMENT_MILESTONES_REFERENCE } from "@/lib/constants";
import { calculateAge, formatRelativeDate } from "@/lib/utils";
import type { DevelopmentMilestone, ParentJournalEntry } from "@/types/health";
import { MOOD_LABELS as MOOD_LABEL_MAP } from "@/types/health";

export const metadata: Metadata = {
  title: "Développement",
  description: "Suivez les jalons de développement, le journal parental et les progrès de vos enfants",
};

type MilestoneCategory = "motricite" | "langage" | "cognition" | "social" | "autonomie";

const CATEGORY_CONFIG: Record<MilestoneCategory, { label: string; icon: React.ReactNode; color: string; gradient: string }> = {
  motricite: { label: "Motricité", icon: <Footprints className="h-5 w-5" aria-hidden="true" />, color: "bg-warm-teal/10 text-warm-teal", gradient: "card-gradient-teal" },
  langage: { label: "Langage", icon: <MessageCircle className="h-5 w-5" aria-hidden="true" />, color: "bg-warm-blue/10 text-warm-blue", gradient: "card-gradient-blue" },
  cognition: { label: "Cognition", icon: <Brain className="h-5 w-5" aria-hidden="true" />, color: "bg-warm-purple/10 text-warm-purple", gradient: "card-gradient-purple" },
  social: { label: "Social", icon: <Users2 className="h-5 w-5" aria-hidden="true" />, color: "bg-warm-orange/10 text-warm-orange", gradient: "card-gradient-orange" },
  autonomie: { label: "Autonomie", icon: <Hand className="h-5 w-5" aria-hidden="true" />, color: "bg-warm-green/10 text-warm-green", gradient: "card-gradient-green" },
};

function getMilestoneStats(
  milestones: DevelopmentMilestone[],
  childAgeMonths: number,
) {
  const categories: MilestoneCategory[] = ["motricite", "langage", "cognition", "social", "autonomie"];
  const stats: Record<MilestoneCategory, { achieved: number; expected: number }> = {
    motricite: { achieved: 0, expected: 0 },
    langage: { achieved: 0, expected: 0 },
    cognition: { achieved: 0, expected: 0 },
    social: { achieved: 0, expected: 0 },
    autonomie: { achieved: 0, expected: 0 },
  };

  for (const cat of categories) {
    const refMilestones = DEVELOPMENT_MILESTONES_REFERENCE.filter(
      (m) => m.category === cat && m.expectedAgeMonths <= childAgeMonths + 3,
    );
    const achieved = milestones.filter(
      (m) => m.category === cat && m.achievedDate,
    ).length;
    stats[cat] = { achieved, expected: refMilestones.length };
  }

  return stats;
}

function getDelayedMilestones(
  milestones: DevelopmentMilestone[],
  childAgeMonths: number,
): string[] {
  const achievedNames = new Set(
    milestones.filter((m) => m.achievedDate).map((m) => m.milestoneName),
  );

  return DEVELOPMENT_MILESTONES_REFERENCE
    .filter(
      (ref) =>
        ref.expectedAgeMonths + 3 < childAgeMonths &&
        !achievedNames.has(ref.name),
    )
    .map((ref) => ref.name);
}

export default async function DeveloppementPage() {
  const membersResult = await getFamilyMembers();
  const allMembers = membersResult.data ?? [];
  const children = allMembers.filter((m) => m.memberType === "child");

  const milestonesByMember: Record<string, DevelopmentMilestone[]> = {};
  const journalByMember: Record<string, ParentJournalEntry[]> = {};

  await Promise.all(
    children.map(async (child) => {
      const [milestonesResult, journalResult] = await Promise.all([
        getMilestones(child.id),
        getJournalEntries(child.id),
      ]);
      milestonesByMember[child.id] = milestonesResult.data ?? [];
      journalByMember[child.id] = journalResult.data ?? [];
    })
  );

  // Compute stats for the first child (main display)
  const firstChild = children[0];
  const firstChildAge = firstChild ? calculateAge(firstChild.birthDate) : null;
  const firstChildAgeMonths = firstChild
    ? Math.floor((new Date().getTime() - new Date(firstChild.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    : 0;
  const firstChildMilestones = firstChild ? milestonesByMember[firstChild.id] ?? [] : [];
  const stats = firstChild ? getMilestoneStats(firstChildMilestones, firstChildAgeMonths) : null;

  // Detect delayed milestones
  const delayedAlerts: { childName: string; milestones: string[] }[] = [];
  for (const child of children) {
    const ageMonths = Math.floor(
      (new Date().getTime() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
    );
    const delayed = getDelayedMilestones(milestonesByMember[child.id] ?? [], ageMonths);
    if (delayed.length > 0) {
      delayedAlerts.push({ childName: child.firstName, milestones: delayed });
    }
  }

  // Latest journal entry across all children
  const allJournalEntries = Object.values(journalByMember).flat();
  const latestJournal = allJournalEntries.length > 0
    ? allJournalEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Développement"
        description={firstChild ? `Les progrès de ${firstChild.firstName} (${firstChildAge?.label})` : "Suivez les jalons de développement et tenez le journal parental"}
      />

      {/* Milestone stats by category */}
      {stats && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {(Object.entries(CATEGORY_CONFIG) as [MilestoneCategory, typeof CATEGORY_CONFIG[MilestoneCategory]][]).map(
            ([cat, config]) => {
              const catStats = stats[cat];
              const pct = catStats.expected > 0
                ? Math.round((catStats.achieved / catStats.expected) * 100)
                : 0;
              return (
                <StatCard
                  key={cat}
                  label={config.label}
                  value={`${catStats.achieved}/${catStats.expected}`}
                  icon={config.icon}
                  color={config.color}
                  gradientClass={config.gradient}
                  trend={catStats.expected > 0 ? `${pct}%` : undefined}
                  trendUp={pct >= 70}
                />
              );
            },
          )}
        </div>
      )}

      {/* Delayed milestone alerts */}
      {delayedAlerts.map((alert) => (
        <AlertCard
          key={alert.childName}
          title={`Jalons en retard — ${alert.childName}`}
          message={`${alert.milestones.length} jalon${alert.milestones.length > 1 ? "s" : ""} attendu${alert.milestones.length > 1 ? "s" : ""} non validé${alert.milestones.length > 1 ? "s" : ""} : ${alert.milestones.slice(0, 3).join(", ")}${alert.milestones.length > 3 ? "…" : ""}`}
          priority="medium"
          category="Développement"
        />
      ))}

      {/* Latest journal entry */}
      {latestJournal && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-warm-purple" />
                Dernière note du journal
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {formatRelativeDate(latestJournal.createdAt)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {latestJournal.content}
            </p>
            {latestJournal.mood && (
              <p className="text-xs text-muted-foreground mt-2">
                Humeur : {MOOD_LABEL_MAP[latestJournal.mood] ?? latestJournal.mood}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <DeveloppementTabs
        milestonesByMember={milestonesByMember}
        journalByMember={journalByMember}
      >
        {children}
      </DeveloppementTabs>
    </div>
  );
}
