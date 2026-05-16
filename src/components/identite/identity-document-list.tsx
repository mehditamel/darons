"use client";

import { useState } from "react";
import { Plus, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { IdentityDocumentCard } from "@/components/identite/identity-document-card";
import { IdentityDocumentForm } from "@/components/identite/identity-document-form";
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
import { deleteIdentityDocument } from "@/lib/actions/identity";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import type { IdentityDocumentWithMember } from "@/lib/actions/identity";
import { DOCUMENT_TYPE_LABELS } from "@/types/family";
import type { FamilyMember } from "@/types/family";

interface IdentityDocumentListProps {
  documents: IdentityDocumentWithMember[];
  members: FamilyMember[];
}

export function IdentityDocumentList({ documents, members }: IdentityDocumentListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IdentityDocumentWithMember | undefined>();
  const [deleting, setDeleting] = useState<IdentityDocumentWithMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const feedback = useActionFeedback();

  const handleEdit = (doc: IdentityDocumentWithMember) => {
    setEditing(doc);
    setFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditing(undefined);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    const docLabel = DOCUMENT_TYPE_LABELS[deleting.documentType] ?? "Document";
    const result = await deleteIdentityDocument(deleting.id);
    setIsDeleting(false);
    setDeleting(null);
    if (result.success) {
      feedback.success({
        title: "Document supprimé",
        description: `${docLabel} retiré de la liste.`,
      });
    } else {
      feedback.error({
        title: "Suppression impossible",
        description: result.error ?? "Réessaie dans quelques instants.",
      });
    }
  };

  if (documents.length === 0 && members.length > 0) {
    return (
      <>
        <EmptyState
          icon={IdCard}
          title="Aucun papier enregistré"
          description="CNI, passeport, livret de famille... Ajoute-les ici et on te prévient avant qu'ils expirent. Fini la panique au guichet."
          actionLabel="Ajouter un premier papier"
          onAction={() => setFormOpen(true)}
        />
        <IdentityDocumentForm
          open={formOpen}
          onOpenChange={handleCloseForm}
          members={members}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {documents.length} document{documents.length > 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>
      <div className="space-y-3">
        {documents.map((doc) => (
          <IdentityDocumentCard
            key={doc.id}
            document={doc}
            onEdit={handleEdit}
            onDelete={(d) => setDeleting(d)}
          />
        ))}
      </div>

      <IdentityDocumentForm
        key={editing?.id ?? "new"}
        open={formOpen}
        onOpenChange={handleCloseForm}
        members={members}
        document={editing}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le document sera définitivement supprimé.
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
    </>
  );
}
