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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { medicalAppointmentSchema, type MedicalAppointmentFormData } from "@/lib/validators/health";
import { createMedicalAppointment } from "@/lib/actions/health";

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
}

const APPOINTMENT_TYPES = [
  "Pédiatre",
  "Médecin généraliste",
  "Dentiste",
  "Ophtalmologue",
  "ORL",
  "Dermatologue",
  "Allergologue",
  "Urgences",
  "PMI",
  "Autre",
] as const;

export function AppointmentForm({ open, onOpenChange, memberId }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MedicalAppointmentFormData>({
    resolver: zodResolver(medicalAppointmentSchema),
    defaultValues: {
      memberId,
      appointmentType: "",
      practitioner: "",
      location: "",
      appointmentDate: "",
      notes: "",
    },
  });

  const onSubmit = async (data: MedicalAppointmentFormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = await createMedicalAppointment(data);
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
          <DialogTitle>Ajouter un rendez-vous</DialogTitle>
          <DialogDescription>
            Planifiez un rendez-vous médical
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Type de rendez-vous</Label>
            <Select
              value={watch("appointmentType")}
              onValueChange={(v) => setValue("appointmentType", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.appointmentType && (
              <p className="text-xs text-destructive">{errors.appointmentType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentDate">Date et heure</Label>
            <Input id="appointmentDate" type="datetime-local" {...register("appointmentDate")} />
            {errors.appointmentDate && (
              <p className="text-xs text-destructive">{errors.appointmentDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="practitioner">Praticien (optionnel)</Label>
            <Input id="practitioner" {...register("practitioner")} placeholder="Dr..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu (optionnel)</Label>
            <Input id="location" {...register("location")} placeholder="Adresse ou nom du cabinet" />
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
              {isSubmitting ? "En cours..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
