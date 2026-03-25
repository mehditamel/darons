import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Activity, CheckCircle, AlertTriangle, Server } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SystemStatus } from "@/components/admin/system-status";
import { getSystemHealth } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin — Système",
  description: "État de santé des services et APIs externes",
};

export default async function AdminSystemPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (profile?.email !== "mehdi@tamel.fr") redirect("/dashboard");

  const healthResult = await getSystemHealth();
  const health = healthResult.data ?? { services: [], lastErrors: [] };

  const totalServices = health.services.length;
  const healthyServices = health.services.filter((s) => s.status === "healthy").length;
  const degradedOrDown = health.services.filter(
    (s) => s.status === "degraded" || s.status === "down",
  ).length;
  const recentErrors = health.lastErrors.length;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Monitoring système"
        description="État des services et APIs externes"
        icon={<Activity className="h-5 w-5" />}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Services"
          value={String(totalServices)}
          icon={Server}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Opérationnels"
          value={String(healthyServices)}
          icon={CheckCircle}
          color="bg-warm-green/10 text-warm-green"
          gradientClass="card-gradient-green"
          trend={totalServices > 0 ? `${Math.round((healthyServices / totalServices) * 100)}%` : undefined}
          trendUp={healthyServices === totalServices}
        />
        <StatCard
          label="Dégradés / Down"
          value={String(degradedOrDown)}
          icon={AlertTriangle}
          color={degradedOrDown > 0 ? "bg-warm-red/10 text-warm-red" : "bg-warm-green/10 text-warm-green"}
          gradientClass={degradedOrDown > 0 ? "card-gradient-red" : "card-gradient-green"}
        />
        <StatCard
          label="Erreurs récentes"
          value={String(recentErrors)}
          icon={Activity}
          color={recentErrors > 0 ? "bg-warm-orange/10 text-warm-orange" : "bg-warm-green/10 text-warm-green"}
          gradientClass={recentErrors > 0 ? "card-gradient-orange" : "card-gradient-green"}
        />
      </div>

      <SystemStatus health={health} />
    </div>
  );
}
