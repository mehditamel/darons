"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { journalEntrySchema, type JournalEntryFormData } from "@/lib/validators/educational";
import { createJournalEntry, updateJournalEntry } from "@/lib/actions/educational";
import { trackEvent } from "@/lib/analytics";
import type { ParentJournalEntry, Mood } from "@/types/health";
import { MOOD_LABELS } from "@/types/health";
import { cn } from "@/lib/utils";

interface JournalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  entry?: ParentJournalEntry;
}

const MOOD_ICONS: Record<Mood, string> = {
  great: "☀️",
  good: "🌤️",
  neutral: "☁️",
  difficult: "🌧️",
  tough: "⛈️",
};

const MOOD_OPTIONS = Object.entries(MOOD_LABELS) as [Mood, string][];

export function JournalForm({
  open,
  onOpenChange,
  memberId,
  entry,
}: JournalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!entry;

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: entry
      ? {
          memberId: entry.memberId,
          entryDate: entry.entryDate,
          content: entry.content,
          mood: entry.mood as Mood | undefined,
          tags: entry.tags ?? [],
        }
      : {
          memberId,
          entryDate: today,
          content: "",
          mood: undefined,
          tags: [],
        },
  });

  const selectedMood = watch("mood");

  const onSubmit = async (data: JournalEntryFormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = isEditing
      ? await updateJournalEntry(entry.id, data)
      : await createJournalEntry(data);

    setIsSubmitting(false);

    if (result.success) {
      reset();
      onOpenChange(false);
      if (!entry) trackEvent("journal_entry_created");
    } else {
      setError(result.error ?? "Une erreur est survenue");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'entrée" : "Nouvelle entrée"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("memberId")} />

          <div className="space-y-2">
            <Label htmlFor="entryDate">Date *</Label>
            <Input
              id="entryDate"
              type="date"
              {...register("entryDate")}
            />
            {errors.entryDate && (
              <p className="text-sm text-destructive" role="alert">{errors.entryDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Humeur du jour</Label>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue("mood", selectedMood === value ? undefined : value)
                  }
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors",
                    selectedMood === value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  <span className="text-xl">{MOOD_ICONS[value]}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              placeholder="Les premiers mots, les fous rires, les petites victoires..."
              className="min-h-[120px]"
              {...register("content")}
            />
            {errors.content && (
              <p className="text-sm text-destructive" role="alert">{errors.content.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "En cours..."
                : isEditing
                  ? "Modifier"
                  : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
