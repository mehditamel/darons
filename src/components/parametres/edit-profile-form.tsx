"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, Check } from "lucide-react";
import { profileSchema, type ProfileFormData } from "@/lib/validators/family";
import { updateProfile } from "@/lib/actions/family";
import { useToast } from "@/hooks/use-toast";

interface EditProfileFormProps {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function EditProfileForm({ firstName, lastName, email, role }: EditProfileFormProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName, lastName },
  });

  function handleSubmit() {
    form.handleSubmit((data) => {
      startTransition(async () => {
        const result = await updateProfile(data);
        if (result.success) {
          setEditing(false);
          toast({ title: "Profil mis à jour" });
        } else {
          toast({
            title: "Erreur",
            description: result.error ?? "Impossible de mettre à jour le profil",
            variant: "destructive",
          });
        }
      });
    })();
  }

  if (!editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{firstName} {lastName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Modifier
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="profile-firstName">Prénom</Label>
          <Input
            id="profile-firstName"
            {...form.register("firstName")}
            disabled={isPending}
          />
          {form.formState.errors.firstName && (
            <p className="text-xs text-destructive" role="alert">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="profile-lastName">Nom</Label>
          <Input
            id="profile-lastName"
            {...form.register("lastName")}
            disabled={isPending}
          />
          {form.formState.errors.lastName && (
            <p className="text-xs text-destructive" role="alert">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{email} — {role}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Check className="h-4 w-4 mr-1" />
          )}
          Enregistrer
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            form.reset({ firstName, lastName });
            setEditing(false);
          }}
          disabled={isPending}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
