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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/shared/form-error";
import { familyMemberSchema, type FamilyMemberFormData } from "@/lib/validators/family";
import { createFamilyMember, updateFamilyMember } from "@/lib/actions/family";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import type { FamilyMember } from "@/types/family";

interface MemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: FamilyMember;
}

export function MemberForm({ open, onOpenChange, member }: MemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSubmitData = useRef<FamilyMemberFormData | null>(null);
  const isEditing = !!member;
  const feedback = useActionFeedback();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: member
      ? {
          firstName: member.firstName,
          lastName: member.lastName,
          birthDate: member.birthDate,
          gender: member.gender,
          memberType: member.memberType,
          notes: member.notes ?? "",
        }
      : {
          firstName: "",
          lastName: "",
          birthDate: "",
          gender: undefined,
          memberType: undefined,
          notes: "",
        },
  });

  const onSubmit = async (data: FamilyMemberFormData) => {
    lastSubmitData.current = data;
    setIsSubmitting(true);
    setError(null);

    const result = isEditing
      ? await updateFamilyMember(member.id, data)
      : await createFamilyMember(data);

    setIsSubmitting(false);

    if (result.success) {
      feedback.success({
        title: isEditing
          ? `${data.firstName} a été mis à jour`
          : `${data.firstName} a rejoint le foyer`,
        description: isEditing
          ? "Les nouvelles infos sont sauvegardées."
          : data.memberType === "child"
            ? "On t'aide à suivre sa santé, son éveil et ses papiers."
            : "Membre adulte ajouté au foyer.",
      });
      reset();
      onOpenChange(false);
    } else {
      setError(result.error ?? "Une erreur est survenue");
      feedback.error({
        title: isEditing ? "Mise à jour impossible" : "Ajout impossible",
        description: result.error ?? "Réessaie dans quelques instants.",
      });
    }
  };

  const handleRetry = () => {
    if (lastSubmitData.current) {
      onSubmit(lastSubmitData.current);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-label={isEditing ? "Modifier un membre" : "Ajouter un membre"}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier un membre" : "Ajouter un membre"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du membre du foyer"
              : "Ajoutez un nouveau membre à votre foyer"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                {...register("firstName")}
                placeholder="Prénom"
              />
              {errors.firstName && (
                <p id="firstName-error" className="text-xs text-destructive" role="alert">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                {...register("lastName")}
                placeholder="Nom"
              />
              {errors.lastName && (
                <p id="lastName-error" className="text-xs text-destructive" role="alert">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Date de naissance</Label>
            <Input
              id="birthDate"
              type="date"
              aria-describedby={errors.birthDate ? "birthDate-error" : undefined}
              {...register("birthDate")}
            />
            {errors.birthDate && (
              <p id="birthDate-error" className="text-xs text-destructive" role="alert">{errors.birthDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Genre</Label>
              <Select
                value={watch("gender")}
                onValueChange={(v) => setValue("gender", v as "M" | "F", { shouldValidate: true })}
              >
                <SelectTrigger aria-describedby={errors.gender ? "gender-error" : undefined}>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p id="gender-error" className="text-xs text-destructive" role="alert">{errors.gender.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={watch("memberType")}
                onValueChange={(v) => setValue("memberType", v as "adult" | "child", { shouldValidate: true })}
              >
                <SelectTrigger aria-describedby={errors.memberType ? "memberType-error" : undefined}>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">Adulte</SelectItem>
                  <SelectItem value="child">Enfant</SelectItem>
                </SelectContent>
              </Select>
              {errors.memberType && (
                <p id="memberType-error" className="text-xs text-destructive" role="alert">{errors.memberType.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              aria-describedby={errors.notes ? "notes-error" : undefined}
              {...register("notes")}
              placeholder="Notes..."
              rows={2}
            />
            {errors.notes && (
              <p id="notes-error" className="text-xs text-destructive" role="alert">{errors.notes.message}</p>
            )}
          </div>

          <FormError message={error} onRetry={handleRetry} id="form-error" />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "En cours..." : isEditing ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
