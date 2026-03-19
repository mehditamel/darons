import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des utilisateurs"
        description="Liste des comptes utilisateurs et gestion des plans"
      />
      <UserManagementTable users={users} />
    </div>
  );
}
