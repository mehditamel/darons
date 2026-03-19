"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
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
import { allergySchema, type AllergyFormData } from "@/lib/validators/health";
import { createAllergy, updateAllergy } from "@/lib/actions/health-enriched";
import { useToast } from "@/hooks/use-toast";
import type { Allergy } from "@/types/health";

interface AllergyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  existing?: Allergy;
}

export function AllergyForm({
  open,
  onOpenChange,
  memberId,
  existing,
}: AllergyFormProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AllergyFormData>({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      memberId,
      allergen: existing?.allergen ?? "",
      severity: existing?.severity ?? "moderate",
      reaction: existing?.reaction ?? "",
      diagnosedDate: existing?.diagnosedDate ?? "",
      notes: existing?.notes ?? "",
    },
  });

  const onSubmit = async (data: AllergyFormData) => {
    const result = existing
      ? await updateAllergy(existing.id, data)
      : await createAllergy(data);

    if (!result.success) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: existing ? "Allergie mise à jour" : "Allergie enregistrée",
      description: data.allergen,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Modifier l'allergie" : "Ajouter une allergie"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("memberId")} />

          <div>
            <Label htmlFor="allergen">Allergène</Label>
            <Input
              id="allergen"
              placeholder="ex: Arachide, Lait de vache, Pénicilline..."
              {...register("allergen")}
            />
            {errors.allergen && (
              <p className="text-sm text-red-500 mt-1">{errors.allergen.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="severity">Sévérité</Label>
            <Select
              value={watch("severity")}
              onValueChange={(v: string) =>
                setValue("severity", v as AllergyFormData["severity"])
              }
            >
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Légère</SelectItem>
                <SelectItem value="moderate">Modérée</SelectItem>
                <SelectItem value="severe">Sévère</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reaction">Réaction</Label>
            <Input
              id="reaction"
              placeholder="ex: Urticaire, œdème, difficultés respiratoires..."
              {...register("reaction")}
            />
          </div>

          <div>
            <Label htmlFor="diagnosedDate">Date de diagnostic</Label>
            <Input
              id="diagnosedDate"
              type="date"
              {...register("diagnosedDate")}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Précautions, traitements..."
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement..."
                : existing
                  ? "Mettre à jour"
                  : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
