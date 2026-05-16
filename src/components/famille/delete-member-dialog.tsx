"use client";

import { useState } from "react";
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
import { deleteFamilyMember } from "@/lib/actions/family";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import type { FamilyMember } from "@/types/family";

interface DeleteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: FamilyMember | null;
}

export function DeleteMemberDialog({ open, onOpenChange, member }: DeleteMemberDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const feedback = useActionFeedback();

  const handleDelete = async () => {
    if (!member) return;
    setIsDeleting(true);
    const result = await deleteFamilyMember(member.id);
    setIsDeleting(false);
    if (result.success) {
      feedback.success({
        title: `${member.firstName} a été supprimé du foyer`,
        description: "Tu peux toujours le rajouter quand tu veux.",
      });
      onOpenChange(false);
    } else {
      feedback.error({
        title: "Suppression impossible",
        description: result.error ?? "Réessaie dans quelques instants.",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer {member?.firstName} ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes les données associées à ce membre
            (vaccins, documents, mesures de croissance) seront également supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
