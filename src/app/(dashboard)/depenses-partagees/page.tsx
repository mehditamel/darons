import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpenseGroupList } from "@/components/depenses-partagees/expense-group-list";
import { CreateGroupDialog } from "@/components/depenses-partagees/create-group-dialog";
import { getExpenseGroups } from "@/lib/actions/shared-expenses";
import { Receipt, Users, PiggyBank } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dépenses partagées",
  description: "Partagez et équilibrez les dépenses en famille ou entre amis",
};

export default async function DepensesPartageesPage() {
  const groupsResult = await getExpenseGroups();
  const groups = groupsResult.data ?? [];

  const activeGroups = groups.filter((g) => g.isActive);
  const totalExpenses = groups.reduce((sum, g) => sum + (g.totalExpenses ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dépenses partagées"
        description="Gérez les dépenses entre membres de la famille et amis, à la manière de Tricount"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-blue/10">
              <Users className="h-5 w-5 text-warm-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeGroups.length}</p>
              <p className="text-xs text-muted-foreground">Groupe{activeGroups.length > 1 ? "s" : ""} actif{activeGroups.length > 1 ? "s" : ""}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-orange/10">
              <Receipt className="h-5 w-5 text-warm-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalExpenses.toLocaleString("fr-FR")} €</p>
              <p className="text-xs text-muted-foreground">Total des dépenses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-teal/10">
              <PiggyBank className="h-5 w-5 text-warm-teal" />
            </div>
            <div>
              <p className="text-2xl font-bold">{groups.reduce((sum, g) => sum + (g.memberCount ?? 0), 0)}</p>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mes groupes</CardTitle>
              <CardDescription>
                Créez un groupe pour chaque occasion de partage de frais
              </CardDescription>
            </div>
            <CreateGroupDialog />
          </div>
        </CardHeader>
        <CardContent>
          {groups.length > 0 ? (
            <ExpenseGroupList groups={groups} />
          ) : (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-medium mb-1">Aucun groupe de dépenses</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez un groupe pour commencer à partager les frais en famille ou entre amis.
              </p>
              <CreateGroupDialog />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
