"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordSchema, type UpdatePasswordFormData } from "@/lib/validators/auth";

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UpdatePasswordFormData>({ resolver: zodResolver(updatePasswordSchema) });

  async function onSubmit(data: UpdatePasswordFormData) {
    setError(null);
    try {
      const { error: authError } = await createClient().auth.updateUser({ password: data.password });
      if (authError) {
        setError("Le mot de passe n'a pas été modifié. Réessaie ou demande un nouveau lien si celui-ci a expiré.");
        return;
      }
      setSaved(true);
    } catch {
      setError("La connexion est indisponible. Ton mot de passe n'a pas été modifié. Réessaie dans un instant.");
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <h1 className="text-2xl font-semibold">{saved ? "Mot de passe mis à jour" : "Choisis un nouveau mot de passe"}</h1>
        <CardDescription>{saved ? "Tu peux maintenant retrouver ton espace familial." : "Au moins 8 caractères, avec une majuscule, une minuscule et un chiffre."}</CardDescription>
      </CardHeader>
      <CardContent>
        {saved ? (
          <div role="status"><Button asChild className="w-full"><Link href="/dashboard">Retrouver mon espace</Link></Button></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-busy={isSubmitting}>
            {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" autoComplete="new-password" {...register("password")}
                aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} />
              {errors.password && <p id="password-error" role="alert" className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "confirm-error" : undefined} />
              {errors.confirmPassword && <p id="confirm-error" role="alert" className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Enregistrement…" : "Enregistrer mon mot de passe"}</Button>
            <Link href="/reset-password" className="block text-center text-sm text-primary underline">Demander un nouveau lien</Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
