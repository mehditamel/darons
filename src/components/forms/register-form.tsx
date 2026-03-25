"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Loader2, CheckCircle2, Shield, CreditCard, EyeOff } from "lucide-react";
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
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch("password", "");

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
          setError("Cet email est déjà utilisé par un autre compte.");
        } else {
          setError("Une erreur est survenue lors de l'inscription.");
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      if (err instanceof Error && err.message.includes("Supabase")) {
        setError("La connexion à Supabase n'est pas configurée. Vérifiez vos variables d'environnement.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
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
          <CardTitle>Inscription réussie !</CardTitle>
          <CardDescription>
            Vérifie tes emails pour confirmer ton compte, puis connecte-toi
            pour découvrir ton espace Darons.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button onClick={() => router.push("/login")}>
            Aller à la connexion
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle>Crée ton compte</CardTitle>
        <CardDescription>
          Rejoins les darons qui gèrent
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
              <Label htmlFor="firstName">Prénom</Label>
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
                <p className="text-xs text-destructive" role="alert">
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
                <p className="text-xs text-destructive" role="alert">
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
              <p className="text-xs text-destructive" role="alert">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="8 caractères minimum"
                className="pl-10"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
            {watchedPassword && (
              <PasswordStrength password={watchedPassword} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive" role="alert">
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
              J'accepte les{" "}
              <Link
                href="/cgu"
                className="text-primary hover:underline"
                target="_blank"
              >
                conditions générales d'utilisation
              </Link>{" "}
              et la{" "}
              <Link
                href="/politique-confidentialite"
                className="text-primary hover:underline"
                target="_blank"
              >
                politique de confidentialité
              </Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-destructive" role="alert">
              {errors.acceptTerms.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            C'est parti, c'est gratuit
          </Button>

          <div className="flex items-center justify-center gap-4 pt-2">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Shield className="h-3 w-3" /> Chiffré AES-256
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CreditCard className="h-3 w-3" /> Sans carte bancaire
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <EyeOff className="h-3 w-3" /> Zéro tracking
            </span>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Très faible", color: "bg-warm-red" },
    { label: "Faible", color: "bg-warm-orange" },
    { label: "Moyen", color: "bg-warm-gold" },
    { label: "Bon", color: "bg-warm-blue" },
    { label: "Fort", color: "bg-warm-green" },
  ];

  return { score, ...levels[score] };
}

function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);
  const width = `${((score + 1) / 5) * 100}%`;

  return (
    <div className="space-y-1 pt-1">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
