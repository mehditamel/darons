"use client";

import { useState, useEffect } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsSubmitting(true);
    setError(null);

    const result = await createVaccination(data);
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
              <SelectTrigger>
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
              <p className="text-xs text-destructive">{errors.vaccineCode.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doseNumber">N° de dose</Label>
              <Input
                id="doseNumber"
                type="number"
                min={1}
                max={5}
                {...register("doseNumber", { valueAsNumber: true })}
              />
              {errors.doseNumber && (
                <p className="text-xs text-destructive">{errors.doseNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="administeredDate">Date d&apos;administration</Label>
              <Input id="administeredDate" type="date" {...register("administeredDate")} />
              {errors.administeredDate && (
                <p className="text-xs text-destructive">{errors.administeredDate.message}</p>
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
