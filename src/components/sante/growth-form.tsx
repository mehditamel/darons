"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { growthMeasurementSchema, type GrowthMeasurementFormData } from "@/lib/validators/health";
import { createGrowthMeasurement } from "@/lib/actions/health";

interface GrowthFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
}

export function GrowthForm({ open, onOpenChange, memberId }: GrowthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GrowthMeasurementFormData>({
    resolver: zodResolver(growthMeasurementSchema),
    defaultValues: {
      memberId,
      measurementDate: new Date().toISOString().split("T")[0],
      weightKg: undefined,
      heightCm: undefined,
      headCircumferenceCm: undefined,
      notes: "",
    },
  });

  const onSubmit = async (data: GrowthMeasurementFormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = await createGrowthMeasurement(data);
    setIsSubmitting(false);

    if (result.success) {
      reset();
      onOpenChange(false);
    } else {
      setError(result.error ?? "Une erreur est survenue");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une mesure</DialogTitle>
          <DialogDescription>
            Enregistrez les mesures de croissance
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="measurementDate">Date de mesure</Label>
            <Input id="measurementDate" type="date" {...register("measurementDate")} />
            {errors.measurementDate && (
              <p className="text-xs text-destructive">{errors.measurementDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weightKg">Poids (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.01"
                placeholder="3.50"
                {...register("weightKg", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightCm">Taille (cm)</Label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                placeholder="50.0"
                {...register("heightCm", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headCircumferenceCm">PC (cm)</Label>
              <Input
                id="headCircumferenceCm"
                type="number"
                step="0.1"
                placeholder="34.5"
                {...register("headCircumferenceCm", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Notes..." rows={2} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "En cours..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
