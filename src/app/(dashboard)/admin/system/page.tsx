import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring système"
        description="État des services et APIs externes"
      />
      <SystemStatus health={health} />
    </div>
  );
}
