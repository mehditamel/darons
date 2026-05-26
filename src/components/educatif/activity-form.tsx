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
import { Switch } from "@/components/ui/switch";
import { activitySchema, type ActivityFormData } from "@/lib/validators/educational";
import { createActivity, updateActivity } from "@/lib/actions/educational";
import type { Activity } from "@/types/educational";
import { ACTIVITY_CATEGORY_LABELS, type ActivityCategory } from "@/types/educational";

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  activity?: Activity;
}

const CATEGORY_OPTIONS = Object.entries(ACTIVITY_CATEGORY_LABELS) as [ActivityCategory, string][];

export function ActivityForm({
  open,
  onOpenChange,
  memberId,
  activity,
}: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!activity;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity
      ? {
          memberId: activity.memberId,
          name: activity.name,
          category: activity.category ?? "",
          provider: activity.provider ?? "",
          schedule: activity.schedule ?? "",
          costMonthly: activity.costMonthly ?? undefined,
          startDate: activity.startDate ?? "",
          endDate: activity.endDate ?? "",
          active: activity.active,
          notes: activity.notes ?? "",
        }
      : {
          memberId,
          name: "",
          category: "",
          provider: "",
          schedule: "",
          costMonthly: undefined,
          startDate: "",
          endDate: "",
          active: true,
          notes: "",
        },
  });

  const selectedCategory = watch("category");
  const isActive = watch("active");

  const onSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = isEditing
      ? await updateActivity(activity.id, data)
      : await createActivity(data);

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
            {isEditing ? "Modifier l'activité" : "Ajouter une activité"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("memberId")} />

          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'activité *</Label>
            <Input
              id="name"
              placeholder="ex: Bébé nageur, Éveil musical"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive" role="alert">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={selectedCategory ?? ""}
                onValueChange={(v) => setValue("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="costMonthly">Coût mensuel (€)</Label>
              <Input
                id="costMonthly"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("costMonthly", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Organisme / Club</Label>
            <Input
              id="provider"
              placeholder="Nom du club ou organisme"
              {...register("provider")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Horaires</Label>
            <Input
              id="schedule"
              placeholder="ex: Mercredi 10h-11h"
              {...register("schedule")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={(checked: boolean) => setValue("active", checked)}
            />
            <Label htmlFor="active">Activité en cours</Label>
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
