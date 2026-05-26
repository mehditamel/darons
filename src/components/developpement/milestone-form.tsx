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
import { milestoneSchema, type MilestoneFormData } from "@/lib/validators/educational";
import { createMilestone, updateMilestone } from "@/lib/actions/educational";
import type { DevelopmentMilestone, MilestoneCategory } from "@/types/health";
import { MILESTONE_CATEGORY_LABELS } from "@/types/health";

interface MilestoneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  milestone?: DevelopmentMilestone;
}

const CATEGORY_OPTIONS = Object.entries(MILESTONE_CATEGORY_LABELS) as [MilestoneCategory, string][];

export function MilestoneForm({
  open,
  onOpenChange,
  memberId,
  milestone,
}: MilestoneFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!milestone;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: milestone
      ? {
          memberId: milestone.memberId,
          category: milestone.category as MilestoneCategory,
          milestoneName: milestone.milestoneName,
          expectedAgeMonths: milestone.expectedAgeMonths ?? undefined,
          achievedDate: milestone.achievedDate ?? "",
          notes: milestone.notes ?? "",
        }
      : {
          memberId,
          category: "motricite" as MilestoneCategory,
          milestoneName: "",
          expectedAgeMonths: undefined,
          achievedDate: "",
          notes: "",
        },
  });

  const selectedCategory = watch("category");

  const onSubmit = async (data: MilestoneFormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = isEditing
      ? await updateMilestone(milestone.id, data)
      : await createMilestone(data);

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
            {isEditing ? "Modifier le jalon" : "Ajouter un jalon"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("memberId")} />

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(v) => setValue("category", v as MilestoneCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive" role="alert">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestoneName">Nom du jalon *</Label>
            <Input
              id="milestoneName"
              placeholder="ex: Premier pas, Premier mot"
              {...register("milestoneName")}
            />
            {errors.milestoneName && (
              <p className="text-sm text-destructive" role="alert">{errors.milestoneName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedAgeMonths">Âge attendu (mois)</Label>
              <Input
                id="expectedAgeMonths"
                type="number"
                min="0"
                placeholder="ex: 12"
                {...register("expectedAgeMonths", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievedDate">Date d'acquisition</Label>
              <Input
                id="achievedDate"
                type="date"
                {...register("achievedDate")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Observations..."
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
