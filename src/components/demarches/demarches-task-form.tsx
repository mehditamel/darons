"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  administrativeTaskSchema,
  type AdministrativeTaskFormData,
} from "@/lib/validators/demarches";
import { createAdministrativeTask } from "@/lib/actions/demarches";
import { TASK_CATEGORY_LABELS, TASK_PRIORITY_LABELS } from "@/types/demarches";
import type { FamilyMember } from "@/types/family";
import { useState } from "react";

interface DemarchesTaskFormProps {
  members: FamilyMember[];
}

export function DemarchesTaskForm({ members }: DemarchesTaskFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const childMembers = members.filter((m) => m.memberType === "child");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdministrativeTaskFormData>({
    resolver: zodResolver(administrativeTaskSchema),
    defaultValues: {
      title: "",
      description: null,
      category: "autre",
      dueDate: null,
      memberId: null,
      priority: "normal",
      url: null,
      completed: false,
    },
  });

  const currentCategory = watch("category");
  const currentPriority = watch("priority");
  const currentMember = watch("memberId");

  const onSubmit = async (data: AdministrativeTaskFormData) => {
    const result = await createAdministrativeTask(data);
    if (result.success) {
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Ajouter une démarche
        </CardTitle>
        <CardDescription>
          Ajoutez une démarche personnalisée à votre checklist
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              placeholder="Ex : Inscription périscolaire"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Détails de la démarche..."
              rows={2}
              {...register("description")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={currentCategory}
                onValueChange={(val) =>
                  setValue(
                    "category",
                    val as AdministrativeTaskFormData["category"],
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_CATEGORY_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select
                value={currentPriority}
                onValueChange={(val) =>
                  setValue(
                    "priority",
                    val as AdministrativeTaskFormData["priority"],
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d&apos;échéance</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>

            {childMembers.length > 0 && (
              <div className="space-y-2">
                <Label>Enfant concerné</Label>
                <Select
                  value={currentMember ?? "none"}
                  onValueChange={(val) =>
                    setValue("memberId", val === "none" ? null : val, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun (foyer)</SelectItem>
                    {childMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Lien utile (optionnel)</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://..."
              {...register("url")}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
            {submitted && (
              <p className="text-sm text-green-600">
                Démarche ajoutée avec succès
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
