"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cafAllocationSchema, type CafAllocationFormData } from "@/lib/validators/budget";
import { createCafAllocation, updateCafAllocation } from "@/lib/actions/budget";
import { CAF_ALLOCATION_TYPES, type CafAllocation } from "@/types/budget";

interface CafAllocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation?: CafAllocation;
}

export function CafAllocationForm({
  open,
  onOpenChange,
  allocation,
}: CafAllocationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CafAllocationFormData>({
    resolver: zodResolver(cafAllocationSchema),
    defaultValues: allocation
      ? {
          allocationType: allocation.allocationType,
          monthlyAmount: allocation.monthlyAmount,
          startDate: allocation.startDate,
          endDate: allocation.endDate,
          active: allocation.active,
          notes: allocation.notes,
        }
      : {
          allocationType: "",
          monthlyAmount: 0,
          startDate: new Date().toISOString().slice(0, 10),
          endDate: null,
          active: true,
          notes: null,
        },
  });

  const allocationType = watch("allocationType");
  const active = watch("active");

  const onSubmit = async (data: CafAllocationFormData) => {
    setLoading(true);
    setError(null);

    const result = allocation
      ? await updateCafAllocation(allocation.id, data)
      : await createCafAllocation(data);

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {allocation ? "Modifier l'allocation" : "Ajouter une allocation CAF"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allocationType">Type d&apos;allocation</Label>
            <Select
              value={allocationType}
              onValueChange={(v) => setValue("allocationType", v)}
            >
              <SelectTrigger id="allocationType">
                <SelectValue placeholder="Sélectionnez le type" />
              </SelectTrigger>
              <SelectContent>
                {CAF_ALLOCATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.allocationType && (
              <p className="text-xs text-destructive">{errors.allocationType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyAmount">Montant mensuel (€)</Label>
            <Input
              id="monthlyAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              {...register("monthlyAmount", { valueAsNumber: true })}
            />
            {errors.monthlyAmount && (
              <p className="text-xs text-destructive">{errors.monthlyAmount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin (optionnel)</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="active"
              checked={active}
              onCheckedChange={(v) => setValue("active", v)}
            />
            <Label htmlFor="active">Allocation active</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Détails supplémentaires..."
              {...register("notes")}
            />
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
              {allocation ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
