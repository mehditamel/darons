import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CohortHeatmap } from "@/components/admin/cohort-heatmap";
import { getCohortAnalysis } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyse de cohortes"
        description="Rétention des utilisateurs par date d'inscription"
      />
      <CohortHeatmap cohorts={cohorts} />
    </div>
  );
}
