import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { RevenueCharts } from "@/components/admin/revenue-charts";
import { getRevenueMetrics } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin — Revenus",
  description: "Métriques de revenus SaaS",
};

export default async function AdminRevenuePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (profile?.email !== "mehdi@tamel.fr") redirect("/dashboard");

  const revenueResult = await getRevenueMetrics();
  const revenue = revenueResult.data ?? {
    mrr: 0,
    arr: 0,
    arpu: 0,
    totalPaying: 0,
    freeUsers: 0,
    premiumUsers: 0,
    familyProUsers: 0,
    mrrHistory: [],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenus"
        description="Métriques de revenus — MRR, ARR, ARPU"
      />
      <RevenueCharts revenue={revenue} />
    </div>
  );
}
