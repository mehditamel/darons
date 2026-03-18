"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sendInvitation } from "@/lib/actions/sharing";
import { invitationSchema, type InvitationFormData } from "@/lib/validators/sharing";
import { INVITATION_ROLE_LABELS } from "@/types/sharing";
import { Send } from "lucide-react";

interface InvitationFormProps {
  disabled?: boolean;
}

export function InvitationForm({ disabled }: InvitationFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      role: "viewer",
    },
  });

  const onSubmit = async (data: InvitationFormData) => {
    setLoading(true);
    const result = await sendInvitation(data);
    setLoading(false);

    if (result.success) {
      toast({ title: "Invitation envoyée", description: `Invitation envoyée à ${data.email}` });
      form.reset();
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          type="email"
          placeholder="grandparent@email.com"
          disabled={disabled}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rôle</Label>
        <Select
          disabled={disabled}
          value={form.watch("role")}
          onValueChange={(value) => form.setValue("role", value as InvitationFormData["role"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir un rôle" />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(INVITATION_ROLE_LABELS) as [InvitationFormData["role"], string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {form.watch("role") === "partner" && "Accès complet en lecture et écriture"}
          {form.watch("role") === "viewer" && "Accès en lecture seule"}
          {form.watch("role") === "nanny" && "Accès limité à la santé et aux activités"}
        </p>
      </div>

      <Button type="submit" disabled={loading || disabled} className="w-full">
        <Send className="h-4 w-4 mr-2" />
        {loading ? "Envoi en cours..." : "Envoyer l'invitation"}
      </Button>

      {disabled && (
        <p className="text-xs text-muted-foreground text-center">
          Passez au plan Family Pro pour inviter des proches.
        </p>
      )}
    </form>
  );
}
