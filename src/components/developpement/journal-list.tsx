"use client";

import { useState } from "react";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { JournalForm } from "./journal-form";
import { deleteJournalEntry } from "@/lib/actions/educational";
import { formatDate } from "@/lib/utils";
import type { ParentJournalEntry, Mood } from "@/types/health";

interface JournalListProps {
  memberId: string;
  entries: ParentJournalEntry[];
}

const MOOD_ICONS: Record<Mood, string> = {
  great: "☀️",
  good: "🌤️",
  neutral: "☁️",
  difficult: "🌧️",
  tough: "⛈️",
};

export function JournalList({ memberId, entries }: JournalListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ParentJournalEntry | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingEntry(undefined);
    setFormOpen(true);
  };

  const handleEdit = (entry: ParentJournalEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteJournalEntry(deletingId);
    setDeletingId(null);
  };

  if (entries.length === 0) {
    return (
      <>
        <EmptyState
          icon={BookOpen}
          title="Le journal de votre famille"
          description="Notez les premiers mots, les fous rires, les petites victoires. Vous serez contents de les relire."
          actionLabel="Écrire une première note"
          onAction={handleAdd}
        />
        <JournalForm
          open={formOpen}
          onOpenChange={setFormOpen}
          memberId={memberId}
          entry={editingEntry}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle entrée
        </Button>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {entry.mood && (
                    <span className="text-xl" title={entry.mood}>
                      {MOOD_ICONS[entry.mood as Mood]}
                    </span>
                  )}
                  <span className="text-sm font-medium">
                    {formatDate(entry.entryDate, "EEEE d MMMM yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"

                        aria-label="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"

                        aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {entry.content}
              </p>
              {entry.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <JournalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        memberId={memberId}
        entry={editingEntry}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
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
    </div>
  );
}
