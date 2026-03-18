"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { savingsGoalSchema, type SavingsGoalFormData } from "@/lib/validators/budget";
import { createSavingsGoal, updateSavingsGoal } from "@/lib/actions/budget";
import type { SavingsGoal } from "@/types/budget";

interface SavingsGoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: SavingsGoal;
}

export function SavingsGoalForm({ open, onOpenChange, goal }: SavingsGoalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: goal
      ? {
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          targetDate: goal.targetDate,
          icon: goal.icon,
          active: goal.active,
        }
      : {
          name: "",
          targetAmount: 0,
          currentAmount: 0,
          targetDate: null,
          icon: null,
          active: true,
        },
  });

  const onSubmit = async (data: SavingsGoalFormData) => {
    setLoading(true);
    setError(null);

    const result = goal
      ? await updateSavingsGoal(goal.id, data)
      : await createSavingsGoal(data);

    setLoading(false);

    if (result.success) {
      reset();
      onOpenChange(false);
    } else {
      setError(result.error ?? "Une erreur est survenue");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {goal ? "Modifier l'objectif" : "Nouvel objectif d'épargne"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l&apos;objectif</Label>
            <Input
              id="name"
              placeholder="Ex : Vacances été 2026, Rentrée scolaire..."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Objectif (€)</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="1 000"
                {...register("targetAmount", { valueAsNumber: true })}
              />
              {errors.targetAmount && (
                <p className="text-xs text-destructive">{errors.targetAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount">Épargné (€)</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                {...register("currentAmount", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetDate">Date cible (optionnel)</Label>
              <Input
                id="targetDate"
                type="date"
                {...register("targetDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icône (optionnel)</Label>
              <Input
                id="icon"
                placeholder="Ex : ✈️ 🎒 🏖️"
                maxLength={4}
                {...register("icon")}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {goal ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
