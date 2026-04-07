"use client";

import { useState, useEffect, useRef, useTransition } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/shared/form-error";
import { ConfettiBurst, useConfetti } from "@/components/shared/confetti-burst";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { vaccinationSchema, type VaccinationFormData } from "@/lib/validators/health";
import { createVaccination } from "@/lib/actions/health";
import { VACCINATION_SCHEDULE } from "@/lib/constants";

interface VaccinationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  prefill?: {
    vaccineCode: string;
    vaccineName: string;
    doseNumber: number;
  };
}

export function VaccinationForm({ open, onOpenChange, memberId, prefill }: VaccinationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const lastSubmitData = useRef<VaccinationFormData | null>(null);
  const { toast } = useToast();
  const { isActive: showConfetti, trigger: triggerConfetti } = useConfetti();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VaccinationFormData>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: {
      memberId,
      vaccineCode: prefill?.vaccineCode ?? "",
      vaccineName: prefill?.vaccineName ?? "",
      doseNumber: prefill?.doseNumber ?? 1,
      administeredDate: new Date().toISOString().split("T")[0],
      practitioner: "",
      batchNumber: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (prefill) {
      setValue("vaccineCode", prefill.vaccineCode);
      setValue("vaccineName", prefill.vaccineName);
      setValue("doseNumber", prefill.doseNumber);
    }
  }, [prefill, setValue]);

  const selectedVaccineCode = watch("vaccineCode");

  const handleVaccineChange = (code: string) => {
    const vaccine = VACCINATION_SCHEDULE.find((v) => v.code === code);
    if (vaccine) {
      setValue("vaccineCode", code, { shouldValidate: true });
      setValue("vaccineName", vaccine.name, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: VaccinationFormData) => {
    lastSubmitData.current = data;
    setError(null);

    startTransition(async () => {
      const result = await createVaccination(data);

      if (result.success) {
        triggerConfetti();
        reset();
        setTimeout(() => onOpenChange(false), 800);
        toast({ title: "Vaccin enregistré 🎉" });
        trackEvent("vaccine_recorded", { vaccineCode: data.vaccineCode ?? "unknown" });
      } else {
        setError(result.error ?? "Une erreur est survenue");
        toast({ title: "Erreur", description: result.error ?? "Une erreur est survenue", variant: "destructive" });
      }
    });
  };

  const handleRetry = () => {
    if (lastSubmitData.current) {
      onSubmit(lastSubmitData.current);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md relative overflow-hidden" aria-label="Enregistrer un vaccin">
        <ConfettiBurst active={showConfetti} />
        <DialogHeader>
          <DialogTitle>Enregistrer un vaccin</DialogTitle>
          <DialogDescription>
            Enregistrez une dose de vaccin administrée
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Vaccin</Label>
            <Select
              value={selectedVaccineCode}
              onValueChange={handleVaccineChange}
            >
              <SelectTrigger aria-describedby={errors.vaccineCode ? "vaccineCode-error" : undefined}>
                <SelectValue placeholder="Sélectionner un vaccin" />
              </SelectTrigger>
              <SelectContent>
                {VACCINATION_SCHEDULE.map((v) => (
                  <SelectItem key={v.code} value={v.code}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vaccineCode && (
              <p id="vaccineCode-error" className="text-xs text-destructive" role="alert">{errors.vaccineCode.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doseNumber">N° de dose</Label>
              <Input
                id="doseNumber"
                type="number"
                inputMode="numeric"
                min={1}
                max={5}
                aria-describedby={errors.doseNumber ? "doseNumber-error" : undefined}
                {...register("doseNumber", { valueAsNumber: true })}
              />
              {errors.doseNumber && (
                <p id="doseNumber-error" className="text-xs text-destructive" role="alert">{errors.doseNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="administeredDate">Date d'administration</Label>
              <Input
                id="administeredDate"
                type="date"
                aria-describedby={errors.administeredDate ? "administeredDate-error" : undefined}
                {...register("administeredDate")}
              />
              {errors.administeredDate && (
                <p id="administeredDate-error" className="text-xs text-destructive" role="alert">{errors.administeredDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="practitioner">Praticien (optionnel)</Label>
            <Input id="practitioner" {...register("practitioner")} placeholder="Dr..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">N° de lot (optionnel)</Label>
            <Input id="batchNumber" {...register("batchNumber")} placeholder="Numéro de lot" />
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "En cours..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
