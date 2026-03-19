"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, Download } from "lucide-react";
import { updateUserPlan } from "@/lib/actions/admin";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
  createdAt: string;
  householdName: string | null;
  memberCount: number;
}

interface UserManagementTableProps {
  users: AdminUser[];
}

const PLAN_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  free: { label: "Free", variant: "secondary" },
  premium: { label: "Premium", variant: "default" },
  family_pro: { label: "Family Pro", variant: "outline" },
};

export function UserManagementTable({ users }: UserManagementTableProps) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase());

    const matchesPlan = planFilter === "all" || u.plan === planFilter;

    return matchesSearch && matchesPlan;
  });

  async function handlePlanChange(userId: string, newPlan: string) {
    await updateUserPlan(userId, newPlan);
  }

  function handleExportCsv() {
    const headers = "Email,Prénom,Nom,Plan,Inscrit le,Foyer,Membres\n";
    const rows = filtered
      .map(
        (u) =>
          `"${u.email}","${u.firstName}","${u.lastName}","${u.plan}","${new Date(u.createdAt).toLocaleDateString("fr-FR")}","${u.householdName ?? ""}","${u.memberCount}"`
      )
      .join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + headers + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utilisateurs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-warm-blue" />
            {filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par email, nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="family_pro">Family Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Utilisateur</th>
                <th className="px-3 py-2 text-left font-medium">Plan</th>
                <th className="px-3 py-2 text-left font-medium hidden sm:table-cell">Foyer</th>
                <th className="px-3 py-2 text-left font-medium hidden md:table-cell">Inscrit le</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((user) => {
                const badge = PLAN_BADGES[user.plan] ?? PLAN_BADGES.free;
                return (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <span className="text-xs">
                        {user.householdName ?? "—"} ({user.memberCount})
                      </span>
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Select
                        value={user.plan}
                        onValueChange={(val) => handlePlanChange(user.id, val)}
                      >
                        <SelectTrigger className="h-7 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="family_pro">Family Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
