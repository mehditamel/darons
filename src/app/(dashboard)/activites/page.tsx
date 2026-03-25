import type { Metadata } from "next";
import { Palette, Euro, Clock, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { ActivityList } from "@/components/educatif/activity-list";
import { WeeklyPlanning } from "@/components/educatif/weekly-planning";
import { AiSuggestionsCard } from "@/components/educatif/ai-suggestions-card";
import { getFamilyMembers } from "@/lib/actions/family";
import { getActivities } from "@/lib/actions/educational";
import { PLAN_LIMITS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { calculateAge, formatCurrency } from "@/lib/utils";
import type { Activity } from "@/types/educational";

export const metadata: Metadata = {
  title: "Activités & loisirs",
  description: "Gérez les activités extra-scolaires et loisirs de vos enfants",
};

export default async function ActivitesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("subscription_plan").eq("id", user.id).single()
    : { data: null };
  const plan = (profile?.subscription_plan ?? "free") as keyof typeof PLAN_LIMITS;
  const hasAiSuggestions = PLAN_LIMITS[plan].hasAiCoach;

  const membersResult = await getFamilyMembers();
  const allMembers = membersResult.data ?? [];
  const children = allMembers.filter((m) => m.memberType === "child");

  const activitiesByMember: Record<string, Activity[]> = {};

  await Promise.all(
    children.map(async (child) => {
      const result = await getActivities(child.id);
      activitiesByMember[child.id] = result.data ?? [];
    })
  );

  // Aggregate stats
  const allActivities = Object.values(activitiesByMember).flat();
  const activeActivities = allActivities.filter((a) => a.active);
  const totalMonthlyCost = activeActivities.reduce((acc, a) => acc + (a.costMonthly ?? 0), 0);
  const totalCount = activeActivities.length;

  // Count unique schedule days (rough estimate of hours per week)
  const scheduleDays = new Set<string>();
  for (const activity of activeActivities) {
    if (activity.schedule) {
      const dayMatch = activity.schedule.match(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/gi);
      if (dayMatch) dayMatch.forEach((d) => scheduleDays.add(d.toLowerCase()));
    }
  }

  // Check children without activities (over 3 years old)
  const childrenWithoutActivities = children.filter((child) => {
    const age = calculateAge(child.birthDate);
    const activities = activitiesByMember[child.id] ?? [];
    return age.years >= 3 && activities.filter((a) => a.active).length === 0;
  });

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Activités & loisirs"
        description="Gérez les activités extra-scolaires et le planning hebdomadaire"
        icon={<Palette className="h-5 w-5" />}
      />

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Activités en cours"
          value={String(totalCount)}
          icon={Sparkles}
          color="bg-warm-purple/10 text-warm-purple"
          gradientClass="card-gradient-purple"
        />
        <StatCard
          label="Coût mensuel"
          value={totalMonthlyCost > 0 ? formatCurrency(totalMonthlyCost) : "0 €"}
          icon={Euro}
          color="bg-warm-gold/10 text-warm-gold"
          gradientClass="card-gradient-gold"
          numericValue={totalMonthlyCost}
          valueSuffix=" €"
        />
        <StatCard
          label="Jours occupés / sem."
          value={`${scheduleDays.size}`}
          icon={Clock}
          color="bg-warm-teal/10 text-warm-teal"
          gradientClass="card-gradient-teal"
          trend={scheduleDays.size > 0 ? `${Array.from(scheduleDays).slice(0, 3).join(", ")}` : undefined}
        />
      </div>

      {/* Suggestion for children without activities */}
      {childrenWithoutActivities.map((child) => (
        <AlertCard
          key={child.id}
          title={`Des idées d'activités pour ${child.firstName} ?`}
          message={`${child.firstName} a ${calculateAge(child.birthDate).label} et n'a pas encore d'activité. Bébé nageur, éveil musical, judo... il y en a pour tous les goûts !`}
          priority="low"
          category="Activités"
        />
      ))}

      <WeeklyPlanning
        activitiesByMember={activitiesByMember}
        childMembers={children}
      />

      <ActivityList
        activitiesByMember={activitiesByMember}
      >
        {children}
      </ActivityList>

      {children.map((child) => (
        <AiSuggestionsCard
          key={child.id}
          childId={child.id}
          childName={child.firstName}
          hasAccess={hasAiSuggestions}
        />
      ))}
    </div>
  );
}
