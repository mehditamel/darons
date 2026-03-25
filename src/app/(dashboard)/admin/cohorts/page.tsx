import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BarChart3, Users, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { CohortHeatmap } from "@/components/admin/cohort-heatmap";
import { getCohortAnalysis } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin — Cohortes",
  description: "Analyse de rétention par cohortes",
};

export default async function AdminCohortsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (profile?.email !== "mehdi@tamel.fr") redirect("/dashboard");

  const cohortsResult = await getCohortAnalysis();
  const cohorts = cohortsResult.data ?? [];

  const totalCohorts = cohorts.length;
  const latestCohort = cohorts.length > 0
    ? cohorts.sort((a, b) => b.cohortDate.localeCompare(a.cohortDate))[0]
    : null;
  const totalUsersTracked = cohorts.reduce((acc, c) => acc + c.totalUsers, 0);

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Analyse de cohortes"
        description="Rétention des utilisateurs par date d'inscription"
        icon={<BarChart3 className="h-5 w-5" />}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Cohortes"
          value={String(totalCohorts)}
          icon={BarChart3}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Utilisateurs suivis"
          value={String(totalUsersTracked)}
          icon={Users}
          color="bg-warm-teal/10 text-warm-teal"
          gradientClass="card-gradient-teal"
        />
        <StatCard
          label="Dernière cohorte"
          value={latestCohort ? formatDate(latestCohort.cohortDate, "MMM yyyy") : "—"}
          icon={Calendar}
          color="bg-warm-purple/10 text-warm-purple"
          gradientClass="card-gradient-purple"
          trend={latestCohort ? `${latestCohort.totalUsers} utilisateurs` : undefined}
        />
      </div>

      <CohortHeatmap cohorts={cohorts} />
    </div>
  );
}
