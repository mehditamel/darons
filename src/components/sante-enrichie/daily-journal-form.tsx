"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  dailyHealthJournalSchema,
  type DailyHealthJournalFormData,
} from "@/lib/validators/health";
import {
  createDailyJournalEntry,
  updateDailyJournalEntry,
} from "@/lib/actions/health-enriched";
import { useToast } from "@/hooks/use-toast";
import type {
  DailyHealthJournal,
  Mood,
} from "@/types/health";

interface DailyJournalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  date?: string;
  existing?: DailyHealthJournal;
  isInfant: boolean;
}

const MOODS: { value: Mood; label: string; icon: string }[] = [
  { value: "great", label: "Super", icon: "☀" },
  { value: "good", label: "Bien", icon: "🌤" },
  { value: "neutral", label: "Neutre", icon: "☁" },
  { value: "difficult", label: "Difficile", icon: "🌧" },
  { value: "tough", label: "Dur", icon: "⛈" },
];

export function DailyJournalForm({
  open,
  onOpenChange,
  memberId,
  date,
  existing,
  isInfant,
}: DailyJournalFormProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DailyHealthJournalFormData>({
    resolver: zodResolver(dailyHealthJournalSchema),
    defaultValues: {
      memberId,
      entryDate: existing?.entryDate ?? date ?? new Date().toISOString().split("T")[0],
      mood: existing?.mood ?? undefined,
      sleepHours: existing?.sleepHours ?? undefined,
      sleepQuality: existing?.sleepQuality ?? undefined,
      appetite: existing?.appetite ?? undefined,
      stools: existing?.stools ?? undefined,
      screenTimeMinutes: existing?.screenTimeMinutes ?? undefined,
      notes: existing?.notes ?? "",
    },
  });

  const selectedMood = watch("mood");

  const onSubmit = async (data: DailyHealthJournalFormData) => {
    const result = existing
      ? await updateDailyJournalEntry(existing.id, data)
      : await createDailyJournalEntry(data);

    if (!result.success) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: existing ? "Entrée mise à jour" : "Entrée créée",
      description: `Journal du ${new Date(data.entryDate).toLocaleDateString("fr-FR")}`,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Journal quotidien</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("memberId")} />

          <div>
            <Label htmlFor="entryDate">Date</Label>
            <Input id="entryDate" type="date" {...register("entryDate")} />
            {errors.entryDate && (
              <p className="text-sm text-red-500 mt-1">{errors.entryDate.message}</p>
            )}
          </div>

          <div>
            <Label>Humeur</Label>
            <div className="flex gap-2 mt-1">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                    selectedMood === m.value
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:bg-muted/50"
                  }`}
                  onClick={() => setValue("mood", m.value)}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-[10px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sleepHours">Sommeil (heures)</Label>
              <Input
                id="sleepHours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="10"
                {...register("sleepHours", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="sleepQuality">Qualité du sommeil</Label>
              <Select
                value={watch("sleepQuality") ?? ""}
                onValueChange={(v: string) =>
                  setValue("sleepQuality", v as DailyHealthJournalFormData["sleepQuality"])
                }
              >
                <SelectTrigger id="sleepQuality">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Bon</SelectItem>
                  <SelectItem value="average">Moyen</SelectItem>
                  <SelectItem value="poor">Mauvais</SelectItem>
                  <SelectItem value="very_poor">Très mauvais</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="appetite">Appétit</Label>
              <Select
                value={watch("appetite") ?? ""}
                onValueChange={(v: string) =>
                  setValue("appetite", v as DailyHealthJournalFormData["appetite"])
                }
              >
                <SelectTrigger id="appetite">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Bon</SelectItem>
                  <SelectItem value="average">Moyen</SelectItem>
                  <SelectItem value="poor">Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isInfant && (
              <div>
                <Label htmlFor="stools">Selles</Label>
                <Select
                  value={watch("stools") ?? ""}
                  onValueChange={(v: string) =>
                    setValue("stools", v as DailyHealthJournalFormData["stools"])
                  }
                >
                  <SelectTrigger id="stools">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="liquid">Liquide</SelectItem>
                    <SelectItem value="hard">Dur</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="screenTimeMinutes">Temps d&apos;écran (minutes)</Label>
            <Input
              id="screenTimeMinutes"
              type="number"
              min="0"
              placeholder="0"
              {...register("screenTimeMinutes", { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Observations de la journée..."
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement..."
                : existing
                  ? "Mettre à jour"
                  : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
