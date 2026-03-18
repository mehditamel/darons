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
      title: existing ? "Allergie mise \u00e0 jour" : "Allergie enregistr\u00e9e",
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
            <Label htmlFor="allergen">Allerg\u00e8ne</Label>
            <Input
              id="allergen"
              placeholder="ex: Arachide, Lait de vache, P\u00e9nicilline..."
              {...register("allergen")}
            />
            {errors.allergen && (
              <p className="text-sm text-red-500 mt-1">{errors.allergen.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="severity">S\u00e9v\u00e9rit\u00e9</Label>
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
                <SelectItem value="mild">L\u00e9g\u00e8re</SelectItem>
                <SelectItem value="moderate">Mod\u00e9r\u00e9e</SelectItem>
                <SelectItem value="severe">S\u00e9v\u00e8re</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reaction">R\u00e9action</Label>
            <Input
              id="reaction"
              placeholder="ex: Urticaire, \u0153d\u00e8me, difficult\u00e9s respiratoires..."
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
              placeholder="Pr\u00e9cautions, traitements..."
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
                  ? "Mettre \u00e0 jour"
                  : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
