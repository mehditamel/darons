"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createSharedExpense } from "@/lib/actions/shared-expenses";
import { sharedExpenseSchema, type SharedExpenseFormData } from "@/lib/validators/sharing";
import { SHARED_EXPENSE_CATEGORIES } from "@/types/sharing";
import type { ExpenseGroupMember } from "@/types/sharing";
import { Plus } from "lucide-react";

interface AddExpenseDialogProps {
  groupId: string;
  members: ExpenseGroupMember[];
}

export function AddExpenseDialog({ groupId, members }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<SharedExpenseFormData>({
    resolver: zodResolver(sharedExpenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      paidBy: members[0]?.id ?? "",
      category: null,
      expenseDate: today,
      notes: null,
      splitType: "equal",
    },
  });

  const onSubmit = async (data: SharedExpenseFormData) => {
    setLoading(true);
    const result = await createSharedExpense(groupId, data);
    setLoading(false);

    if (result.success) {
      toast({ title: "Dépense ajoutée" });
      form.reset({ ...form.formState.defaultValues, expenseDate: today });
      setOpen(false);
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle dépense</DialogTitle>
          <DialogDescription>
            Ajoutez une dépense à partager entre les participants.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Description</Label>
            <Input id="title" placeholder="Ex: Restaurant" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive" role="alert">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0.00"
                {...form.register("amount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Date</Label>
              <Input id="expenseDate" type="date" {...form.register("expenseDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payé par</Label>
            <Select
              value={form.watch("paidBy")}
              onValueChange={(value) => form.setValue("paidBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qui a payé ?" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Catégorie (optionnel)</Label>
            <Select
              value={form.watch("category") ?? ""}
              onValueChange={(value) => form.setValue("category", value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {SHARED_EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Ajout en cours..." : "Ajouter la dépense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
