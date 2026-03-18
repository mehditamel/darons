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
import { budgetEntrySchema, type BudgetEntryFormData } from "@/lib/validators/budget";
import { createBudgetEntry, updateBudgetEntry } from "@/lib/actions/budget";
import { BUDGET_CATEGORY_LABELS, type BudgetEntry } from "@/types/budget";
import type { FamilyMember } from "@/types/family";

interface BudgetEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMonth: string;
  members: FamilyMember[];
  entry?: BudgetEntry;
}

export function BudgetEntryForm({
  open,
  onOpenChange,
  currentMonth,
  members,
  entry,
}: BudgetEntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isExpense = !entry || entry.amount >= 0;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BudgetEntryFormData>({
    resolver: zodResolver(budgetEntrySchema),
    defaultValues: entry
      ? {
          memberId: entry.memberId,
          month: entry.month,
          category: entry.category,
          label: entry.label,
          amount: Math.abs(entry.amount),
          isRecurring: entry.isRecurring,
          notes: entry.notes,
        }
      : {
          memberId: null,
          month: currentMonth,
          category: "autre" as const,
          label: "",
          amount: 0,
          isRecurring: false,
          notes: null,
        },
  });

  const [type, setType] = useState<"expense" | "income">(isExpense ? "expense" : "income");
  const category = watch("category");
  const isRecurring = watch("isRecurring");

  const onSubmit = async (data: BudgetEntryFormData) => {
    setLoading(true);
    setError(null);

    const finalData = {
      ...data,
      amount: type === "expense" ? Math.abs(data.amount) : -Math.abs(data.amount),
    };

    const result = entry
      ? await updateBudgetEntry(entry.id, finalData)
      : await createBudgetEntry(finalData);

    setLoading(false);

    if (result.success) {
      reset();
      onOpenChange(false);
    } else {
      setError(result.error ?? "Une erreur est survenue");
    }
  };

  const children = members.filter((m) => m.memberType === "child");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Modifier l'entrée" : "Ajouter une entrée"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setType("expense")}
            >
              Dépense
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setType("income")}
            >
              Revenu
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Libellé</Label>
            <Input
              id="label"
              placeholder="Ex : Courses Leclerc, Pédiatre..."
              {...register("label")}
            />
            {errors.label && (
              <p className="text-xs text-destructive">{errors.label.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={category}
                onValueChange={(v) => setValue("category", v as BudgetEntryFormData["category"])}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BUDGET_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {children.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="memberId">Attribuer à un enfant (optionnel)</Label>
              <Select
                value={watch("memberId") ?? "none"}
                onValueChange={(v) => setValue("memberId", v === "none" ? null : v)}
              >
                <SelectTrigger id="memberId">
                  <SelectValue placeholder="Foyer global" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Foyer global</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(v) => setValue("isRecurring", v)}
            />
            <Label htmlFor="isRecurring">Dépense récurrente</Label>
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
              {entry ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
