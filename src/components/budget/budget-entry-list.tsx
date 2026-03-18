"use client";

import { useState } from "react";
import { Pencil, Trash2, MoreHorizontal, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteBudgetEntry } from "@/lib/actions/budget";
import { BUDGET_CATEGORY_LABELS, type BudgetEntry } from "@/types/budget";
import { BudgetEntryForm } from "./budget-entry-form";
import { formatCurrency } from "@/lib/utils";
import type { FamilyMember } from "@/types/family";

interface BudgetEntryListProps {
  entries: BudgetEntry[];
  currentMonth: string;
  members: FamilyMember[];
}

export function BudgetEntryList({ entries, currentMonth, members }: BudgetEntryListProps) {
  const [editEntry, setEditEntry] = useState<BudgetEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteBudgetEntry(deleteId);
    setDeleteId(null);
  };

  const childrenMap = new Map(
    members
      .filter((m) => m.memberType === "child")
      .map((m) => [m.id, m.firstName])
  );

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucune entrée pour ce mois
        </CardContent>
      </Card>
    );
  }

  const expenses = entries.filter((e) => e.amount > 0);
  const incomes = entries.filter((e) => e.amount < 0);

  return (
    <>
      <div className="space-y-4">
        {expenses.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-warm-red" />
                Dépenses ({expenses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expenses.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  childrenMap={childrenMap}
                  onEdit={() => setEditEntry(entry)}
                  onDelete={() => setDeleteId(entry.id)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {incomes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-warm-green" />
                Revenus ({incomes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {incomes.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  childrenMap={childrenMap}
                  onEdit={() => setEditEntry(entry)}
                  onDelete={() => setDeleteId(entry.id)}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {editEntry && (
        <BudgetEntryForm
          open={!!editEntry}
          onOpenChange={(open) => !open && setEditEntry(null)}
          currentMonth={currentMonth}
          members={members}
          entry={editEntry}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette entrée ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EntryRow({
  entry,
  childrenMap,
  onEdit,
  onDelete,
}: {
  entry: BudgetEntry;
  childrenMap: Map<string, string>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isExpense = entry.amount > 0;

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{entry.label}</p>
            {entry.isRecurring && (
              <RefreshCw className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-xs">
              {BUDGET_CATEGORY_LABELS[entry.category]}
            </Badge>
            {entry.memberId && childrenMap.has(entry.memberId) && (
              <Badge variant="outline" className="text-xs">
                {childrenMap.get(entry.memberId)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-semibold whitespace-nowrap ${
            isExpense ? "text-warm-red" : "text-warm-green"
          }`}
        >
          {isExpense ? "-" : "+"}{formatCurrency(Math.abs(entry.amount))}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
