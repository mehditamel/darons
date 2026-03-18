import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpenseList } from "@/components/depenses-partagees/expense-list";
import { BalanceOverview } from "@/components/depenses-partagees/balance-overview";
import { AddExpenseDialog } from "@/components/depenses-partagees/add-expense-dialog";
import { AddMemberDialog } from "@/components/depenses-partagees/add-member-dialog";
import {
  getExpenseGroup,
  getGroupMembers,
  getGroupExpenses,
  getGroupBalances,
  getSettlementSuggestions,
} from "@/lib/actions/shared-expenses";
import { ArrowLeft, Receipt, Users, Scale } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Détail du groupe",
};

interface Props {
  params: { groupId: string };
}

export default async function GroupDetailPage({ params }: Props) {
  const [groupResult, membersResult, expensesResult, balancesResult, suggestionsResult] =
    await Promise.all([
      getExpenseGroup(params.groupId),
      getGroupMembers(params.groupId),
      getGroupExpenses(params.groupId),
      getGroupBalances(params.groupId),
      getSettlementSuggestions(params.groupId),
    ]);

  if (!groupResult.success || !groupResult.data) notFound();

  const group = groupResult.data;
  const members = membersResult.data ?? [];
  const expenses = expensesResult.data ?? [];
  const balances = balancesResult.data ?? [];
  const suggestions = suggestionsResult.data ?? [];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/depenses-partagees">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
        </Button>
      </div>

      <PageHeader
        title={group.name}
        description={group.description ?? "Groupe de dépenses partagées"}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Receipt className="h-5 w-5 text-warm-orange" />
            <div>
              <p className="text-xl font-bold">{totalExpenses.toLocaleString("fr-FR")} €</p>
              <p className="text-xs text-muted-foreground">Total dépenses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-warm-blue" />
            <div>
              <p className="text-xl font-bold">{members.length}</p>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Scale className="h-5 w-5 text-warm-teal" />
            <div>
              <p className="text-xl font-bold">
                {members.length > 0
                  ? (totalExpenses / members.length).toLocaleString("fr-FR", {
                      maximumFractionDigits: 2,
                    })
                  : 0}{" "}
                €
              </p>
              <p className="text-xs text-muted-foreground">Par personne</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Balances */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Équilibres</CardTitle>
              <AddMemberDialog groupId={group.id} />
            </div>
            <CardDescription>
              Qui doit quoi à qui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceOverview
              balances={balances}
              suggestions={suggestions}
              groupId={group.id}
            />
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Dépenses</CardTitle>
              <AddExpenseDialog groupId={group.id} members={members} />
            </div>
            <CardDescription>
              {expenses.length} dépense{expenses.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseList expenses={expenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
