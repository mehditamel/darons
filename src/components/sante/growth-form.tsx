"use client";

import { useState, useRef } from "react";
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
import { FormError } from "@/components/shared/form-error";
import { growthMeasurementSchema, type GrowthMeasurementFormData } from "@/lib/validators/health";
import { createGrowthMeasurement } from "@/lib/actions/health";
import { trackEvent } from "@/lib/analytics";

interface GrowthFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
}

export function GrowthForm({ open, onOpenChange, memberId }: GrowthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSubmitData = useRef<GrowthMeasurementFormData | null>(null);

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
    lastSubmitData.current = data;
    setIsSubmitting(true);
    setError(null);

    const result = await createGrowthMeasurement(data);
    setIsSubmitting(false);

    if (result.success) {
      reset();
      onOpenChange(false);
      trackEvent("growth_measured");
    } else {
      setError(result.error ?? "Une erreur est survenue");
    }
  };

  const handleRetry = () => {
    if (lastSubmitData.current) {
      onSubmit(lastSubmitData.current);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-label="Ajouter une mesure de croissance">
        <DialogHeader>
          <DialogTitle>Ajouter une mesure</DialogTitle>
          <DialogDescription>
            Enregistrez les mesures de croissance
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="measurementDate">Date de mesure</Label>
            <Input
              id="measurementDate"
              type="date"
              aria-describedby={errors.measurementDate ? "measurementDate-error" : undefined}
              {...register("measurementDate")}
            />
            {errors.measurementDate && (
              <p id="measurementDate-error" className="text-xs text-destructive" role="alert">{errors.measurementDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weightKg">Poids (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                inputMode="decimal"
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
                inputMode="decimal"
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
                inputMode="decimal"
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

          <FormError message={error} onRetry={handleRetry} id="form-error" />

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
