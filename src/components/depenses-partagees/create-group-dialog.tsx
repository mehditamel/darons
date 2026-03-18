"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createExpenseGroup } from "@/lib/actions/shared-expenses";
import { expenseGroupSchema, type ExpenseGroupFormData } from "@/lib/validators/sharing";
import { Plus } from "lucide-react";

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ExpenseGroupFormData>({
    resolver: zodResolver(expenseGroupSchema),
    defaultValues: {
      name: "",
      description: null,
      currency: "EUR",
    },
  });

  const onSubmit = async (data: ExpenseGroupFormData) => {
    setLoading(true);
    const result = await createExpenseGroup(data);
    setLoading(false);

    if (result.success) {
      toast({ title: "Groupe créé", description: `Le groupe "${data.name}" a été créé` });
      form.reset();
      setOpen(false);
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau groupe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un groupe de dépenses</DialogTitle>
          <DialogDescription>
            Créez un groupe pour partager les frais avec votre famille ou vos amis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du groupe</Label>
            <Input
              id="name"
              placeholder="Ex: Vacances été 2026"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Input
              id="description"
              placeholder="Détails du groupe..."
              {...form.register("description")}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Création..." : "Créer le groupe"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
