"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSharedExpense } from "@/lib/actions/shared-expenses";
import { useToast } from "@/hooks/use-toast";

interface DeleteExpenseButtonProps {
  expenseId: string;
  expenseTitle: string;
}

export function DeleteExpenseButton({ expenseId, expenseTitle }: DeleteExpenseButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteSharedExpense(expenseId);
    setDeleting(false);

    if (result.success) {
      toast({
        title: "Depense supprimee",
        description: `"${expenseTitle}" a ete supprimee.`,
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error ?? "Impossible de supprimer la depense",
        variant: "destructive",
      });
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Supprimer</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette depense ?</AlertDialogTitle>
          <AlertDialogDescription>
            La depense &quot;{expenseTitle}&quot; sera definitivement supprimee. Les equilibres du groupe seront recalcules.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
