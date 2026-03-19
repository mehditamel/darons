import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminMetricsChart } from "@/components/admin/admin-metrics-chart";
import { AdminStatsGrid } from "@/components/admin/admin-stats-grid";
import { getAdminDashboardSummary, getAdminMetrics, computeDailyMetrics, getAdminEngagementMetrics } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";
import { BarChart3, Users, DollarSign, GitBranch, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin — Tableau de bord SaaS",
  description: "Métriques et KPIs du produit",
};

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (profile?.email !== "mehdi@tamel.fr") redirect("/dashboard");

  const [summaryResult, metricsResult, engagementResult] = await Promise.all([
    getAdminDashboardSummary(),
    getAdminMetrics(30),
    getAdminEngagementMetrics(),
  ]);

  const summary = summaryResult.data ?? {
    totalUsers: 0,
    premiumUsers: 0,
    familyProUsers: 0,
    mrr: 0,
    conversionRate: 0,
    referralCount: 0,
  };

  const metrics = metricsResult.data ?? [];

  const engagement = engagementResult.data ?? {
    dau: 0,
    mau: 0,
    dauMauRatio: 0,
    activationRate: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord Admin"
        description="Métriques SaaS — Darons"
      />

      {/* Navigation sub-pages */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Utilisateurs", href: "/admin/users", icon: Users, color: "text-warm-blue" },
          { label: "Revenus", href: "/admin/revenue", icon: DollarSign, color: "text-warm-teal" },
          { label: "Cohortes", href: "/admin/cohorts", icon: GitBranch, color: "text-warm-purple" },
          { label: "Système", href: "/admin/system", icon: Activity, color: "text-warm-orange" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
              <CardContent className="flex items-center gap-3 pt-6">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <AdminStatsGrid summary={summary} engagement={engagement} />

      {/* Metrics chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-warm-blue" />
              <div>
                <CardTitle>Évolution sur 30 jours</CardTitle>
                <CardDescription>Utilisateurs, MRR et conversions</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminMetricsChart metrics={metrics} />
        </CardContent>
      </Card>

      {/* Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Free</span>
                <span className="font-medium">
                  {summary.totalUsers - summary.premiumUsers - summary.familyProUsers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Premium (9,90 €)</span>
                <span className="font-medium">{summary.premiumUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Family Pro (19,90 €)</span>
                <span className="font-medium">{summary.familyProUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicateurs clés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">MRR</span>
                <span className="font-bold text-warm-teal">{summary.mrr.toLocaleString("fr-FR")} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taux de conversion</span>
                <span className="font-bold">{summary.conversionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Parrainages</span>
                <span className="font-bold">{summary.referralCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ARR estimé</span>
                <span className="font-bold text-warm-gold">{(summary.mrr * 12).toLocaleString("fr-FR")} €</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
