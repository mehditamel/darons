import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TrendingUp, DollarSign, Users, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { RevenueCharts } from "@/components/admin/revenue-charts";
import { getRevenueMetrics } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

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
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Revenus"
        description="Métriques de revenus — MRR, ARR, ARPU"
        icon={<TrendingUp className="h-5 w-5" />}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="MRR"
          value={formatCurrency(revenue.mrr)}
          icon={DollarSign}
          color="bg-warm-green/10 text-warm-green"
          gradientClass="card-gradient-green"
        />
        <StatCard
          label="ARR"
          value={formatCurrency(revenue.arr)}
          icon={TrendingUp}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="ARPU"
          value={formatCurrency(revenue.arpu)}
          icon={CreditCard}
          color="bg-warm-gold/10 text-warm-gold"
          gradientClass="card-gradient-gold"
        />
        <StatCard
          label="Abonnés payants"
          value={String(revenue.totalPaying)}
          icon={Users}
          color="bg-warm-purple/10 text-warm-purple"
          gradientClass="card-gradient-purple"
          trend={revenue.premiumUsers > 0 ? `${revenue.premiumUsers} Premium + ${revenue.familyProUsers} Pro` : undefined}
        />
      </div>

      <RevenueCharts revenue={revenue} />
    </div>
  );
}
