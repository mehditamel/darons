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
  healthExaminationSchema,
  type HealthExaminationFormData,
} from "@/lib/validators/health";
import {
  createHealthExamination,
  updateHealthExamination,
} from "@/lib/actions/health-enriched";
import { useToast } from "@/hooks/use-toast";
import type { HealthExamination } from "@/types/health";

interface ExaminationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  examNumber: number;
  examAgeLabel: string;
  existing?: HealthExamination;
}

export function ExaminationForm({
  open,
  onOpenChange,
  memberId,
  examNumber,
  examAgeLabel,
  existing,
}: ExaminationFormProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HealthExaminationFormData>({
    resolver: zodResolver(healthExaminationSchema),
    defaultValues: {
      memberId,
      examNumber,
      examAgeLabel,
      completedDate: existing?.completedDate ?? "",
      practitioner: existing?.practitioner ?? "",
      weightKg: existing?.weightKg ?? undefined,
      heightCm: existing?.heightCm ?? undefined,
      headCircumferenceCm: existing?.headCircumferenceCm ?? undefined,
      screenExposureNotes: existing?.screenExposureNotes ?? "",
      tndScreeningNotes: existing?.tndScreeningNotes ?? "",
      notes: existing?.notes ?? "",
    },
  });

  const onSubmit = async (data: HealthExaminationFormData) => {
    const result = existing
      ? await updateHealthExamination(existing.id, data)
      : await createHealthExamination(data);

    if (!result.success) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: existing ? "Examen mis \u00e0 jour" : "Examen enregistr\u00e9",
      description: `Examen n\u00b0${examNumber} (${examAgeLabel})`,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Examen n\u00b0{examNumber} — {examAgeLabel}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("memberId")} />
          <input type="hidden" {...register("examNumber", { valueAsNumber: true })} />
          <input type="hidden" {...register("examAgeLabel")} />

          <div>
            <Label htmlFor="completedDate">Date de l&apos;examen</Label>
            <Input
              id="completedDate"
              type="date"
              {...register("completedDate")}
            />
            {errors.completedDate && (
              <p className="text-sm text-red-500 mt-1">{errors.completedDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="practitioner">Praticien</Label>
            <Input
              id="practitioner"
              placeholder="Dr Martin"
              {...register("practitioner")}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="weightKg">Poids (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.01"
                placeholder="5.20"
                {...register("weightKg", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="heightCm">Taille (cm)</Label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                placeholder="60.0"
                {...register("heightCm", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="headCircumferenceCm">PC (cm)</Label>
              <Input
                id="headCircumferenceCm"
                type="number"
                step="0.1"
                placeholder="40.0"
                {...register("headCircumferenceCm", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tndScreeningNotes">Notes rep\u00e9rage TND</Label>
            <Textarea
              id="tndScreeningNotes"
              placeholder="Observations sur le d\u00e9veloppement (motricit\u00e9, langage, attention, social)..."
              {...register("tndScreeningNotes")}
            />
          </div>

          <div>
            <Label htmlFor="screenExposureNotes">Notes exposition \u00e9crans</Label>
            <Textarea
              id="screenExposureNotes"
              placeholder="Temps d'\u00e9cran observ\u00e9, type de contenu..."
              {...register("screenExposureNotes")}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes g\u00e9n\u00e9rales</Label>
            <Textarea
              id="notes"
              placeholder="Autres observations..."
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
                  ? "Mettre \u00e0 jour"
                  : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
