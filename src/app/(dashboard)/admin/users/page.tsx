import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users, Crown, CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { getAdminUserList } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin — Utilisateurs",
  description: "Gestion des utilisateurs de la plateforme",
};

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (profile?.email !== "mehdi@tamel.fr") redirect("/dashboard");

  const usersResult = await getAdminUserList();
  const users = usersResult.data ?? [];

  const totalUsers = users.length;
  const premiumUsers = users.filter(
    (u) => u.plan === "premium" || u.plan === "family_pro",
  ).length;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const newThisMonth = users.filter((u) => u.createdAt.startsWith(thisMonth)).length;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Gestion des utilisateurs"
        description="Liste des comptes utilisateurs et gestion des plans"
        icon={<Users className="h-5 w-5" />}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total utilisateurs"
          value={String(totalUsers)}
          icon={Users}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Premium / Pro"
          value={String(premiumUsers)}
          icon={Crown}
          color="bg-warm-gold/10 text-warm-gold"
          gradientClass="card-gradient-gold"
          trend={totalUsers > 0 ? `${Math.round((premiumUsers / totalUsers) * 100)}% conversion` : undefined}
          trendUp={premiumUsers > 0}
        />
        <StatCard
          label="Inscrits ce mois"
          value={String(newThisMonth)}
          icon={CalendarPlus}
          color="bg-warm-teal/10 text-warm-teal"
          gradientClass="card-gradient-teal"
        />
      </div>

      <UserManagementTable users={users} />
    </div>
  );
}
