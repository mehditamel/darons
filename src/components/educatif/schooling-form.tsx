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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { schoolingSchema, type SchoolingFormData } from "@/lib/validators/educational";
import { createSchooling, updateSchooling } from "@/lib/actions/educational";
import type { Schooling } from "@/types/educational";
import { SCHOOLING_LEVEL_LABELS, SCHOOLING_LEVELS_ORDERED } from "@/types/educational";

interface SchoolingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  schooling?: Schooling;
}

export function SchoolingForm({
  open,
  onOpenChange,
  memberId,
  schooling,
}: SchoolingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!schooling;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SchoolingFormData>({
    resolver: zodResolver(schoolingSchema),
    defaultValues: schooling
      ? {
          memberId: schooling.memberId,
          schoolYear: schooling.schoolYear,
          level: schooling.level,
          establishment: schooling.establishment ?? "",
          teacher: schooling.teacher ?? "",
          className: schooling.className ?? "",
          notes: schooling.notes ?? "",
        }
      : {
          memberId,
          schoolYear: "",
          level: "",
          establishment: "",
          teacher: "",
          className: "",
          notes: "",
        },
  });

  const selectedLevel = watch("level");

  const onSubmit = async (data: SchoolingFormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = isEditing
      ? await updateSchooling(schooling.id, data)
      : await createSchooling(data);

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
          <DialogTitle>
            {isEditing ? "Modifier l'année scolaire" : "Ajouter une année scolaire"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("memberId")} />

          <div className="space-y-2">
            <Label htmlFor="schoolYear">Année scolaire *</Label>
            <Input
              id="schoolYear"
              placeholder="2025-2026"
              {...register("schoolYear")}
            />
            {errors.schoolYear && (
              <p className="text-sm text-destructive" role="alert">{errors.schoolYear.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Niveau *</Label>
            <Select
              value={selectedLevel}
              onValueChange={(v) => setValue("level", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le niveau" />
              </SelectTrigger>
              <SelectContent>
                {SCHOOLING_LEVELS_ORDERED.map((level) => (
                  <SelectItem key={level} value={level}>
                    {SCHOOLING_LEVEL_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.level && (
              <p className="text-sm text-destructive" role="alert">{errors.level.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="establishment">Établissement</Label>
            <Input
              id="establishment"
              placeholder="Nom de l'école ou de la crèche"
              {...register("establishment")}
            />
            {errors.establishment && (
              <p className="text-sm text-destructive" role="alert">{errors.establishment.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teacher">Enseignant</Label>
              <Input
                id="teacher"
                placeholder="Mme / M."
                {...register("teacher")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="className">Classe</Label>
              <Input
                id="className"
                placeholder="ex: PS-B"
                {...register("className")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Informations complémentaires..."
              {...register("notes")}
            />
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
