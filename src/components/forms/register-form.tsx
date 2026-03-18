"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerSchema, type RegisterFormData } from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Cet email est d\u00e9j\u00e0 utilis\u00e9 par un autre compte.");
        } else {
          setError("Une erreur est survenue lors de l'inscription.");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Veuillez r\u00e9essayer.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warm-green/10">
            <CheckCircle2 className="h-8 w-8 text-warm-green" />
          </div>
          <CardTitle>Inscription r\u00e9ussie !</CardTitle>
          <CardDescription>
            V\u00e9rifiez vos emails pour confirmer votre compte, puis connectez-vous
            pour d\u00e9couvrir votre tableau de bord familial.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button onClick={() => router.push("/login")}>
            Aller \u00e0 la connexion
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle>Cr\u00e9er votre compte</CardTitle>
        <CardDescription>
          Rejoignez Ma Vie Parentale et simplifiez votre quotidien familial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Pr\u00e9nom</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="Mehdi"
                  className="pl-10"
                  {...register("firstName")}
                />
              </div>
              {errors.firstName && (
                <p className="text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                placeholder="Dupont"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="mehdi@exemple.fr"
                className="pl-10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="8 caract\u00e8res minimum"
                className="pl-10"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                className="pl-10"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="acceptTerms"
              className="mt-1 rounded border-input"
              {...register("acceptTerms")}
            />
            <Label htmlFor="acceptTerms" className="text-xs leading-relaxed">
              J&apos;accepte les{" "}
              <Link
                href="/cgu"
                className="text-primary hover:underline"
                target="_blank"
              >
                conditions g\u00e9n\u00e9rales d&apos;utilisation
              </Link>{" "}
              et la{" "}
              <Link
                href="/politique-confidentialite"
                className="text-primary hover:underline"
                target="_blank"
              >
                politique de confidentialit\u00e9
              </Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-destructive">
              {errors.acceptTerms.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cr\u00e9er mon compte gratuitement
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          D\u00e9j\u00e0 un compte ?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
