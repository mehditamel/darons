"use client";

import { useState } from "react";
import { Pencil, Trash2, MoreHorizontal, Target, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { deleteSavingsGoal } from "@/lib/actions/budget";
import type { SavingsGoal } from "@/types/budget";
import { SavingsGoalForm } from "./savings-goal-form";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SavingsGoalCardProps {
  goals: SavingsGoal[];
}

export function SavingsGoalCard({ goals }: SavingsGoalCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteSavingsGoal(deleteId);
    setDeleteId(null);
  };

  const activeGoals = goals.filter((g) => g.active);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Objectifs d&apos;épargne
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun objectif d&apos;épargne défini
            </p>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => {
                const percent = Math.min(
                  Math.round((goal.currentAmount / goal.targetAmount) * 100),
                  100
                );

                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {goal.icon && <span className="mr-1">{goal.icon}</span>}
                          {goal.name}
                        </p>
                        {goal.targetDate && (
                          <p className="text-xs text-muted-foreground">
                            Objectif : {formatDate(goal.targetDate)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold whitespace-nowrap">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditGoal(goal)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(goal.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percent} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <SavingsGoalForm
        open={showForm}
        onOpenChange={setShowForm}
      />

      {editGoal && (
        <SavingsGoalForm
          open={!!editGoal}
          onOpenChange={(open) => !open && setEditGoal(null)}
          goal={editGoal}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet objectif ?</AlertDialogTitle>
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
