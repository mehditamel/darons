"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Loader2, Shield, CreditCard, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { loginSchema, resetPasswordSchema, type LoginFormData } from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath = "/dashboard", authError = false, serviceUnavailable = false }: { nextPath?: string; authError?: boolean; serviceUnavailable?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [error, setError] = useState<string | null>(serviceUnavailable ? "Ton espace est temporairement indisponible. Réessaie dans un instant. Les outils publics restent accessibles." : authError ? "Ce lien de connexion est invalide ou a expiré. Demande un nouveau lien ou utilise ton mot de passe." : null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("La connexion est indisponible. Réessaie dans un instant.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMagicLink() {
    const email = getValues("email");
    if (!resetPasswordSchema.safeParse({ email }).success) {
      setError("Veuillez saisir une adresse email valide");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (authError) {
        setError("Impossible d'envoyer le lien. Vérifiez votre email.");
        return;
      }

      setMagicLinkSent(true);
    } catch {
      setError("La connexion est indisponible. Réessaie dans un instant.");
    } finally {
      setIsLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warm-teal/10">
            <Mail className="h-8 w-8 text-warm-teal" />
          </div>
          <h1 className="text-2xl font-semibold leading-none tracking-tight">Vérifiez vos emails</h1>
          <CardDescription>
            Un lien de connexion a été envoyé à votre adresse email.
            Cliquez sur le lien pour vous connecter.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button variant="ghost" onClick={() => setMagicLinkSent(false)}>
            Retour
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Connexion</h1>
        <CardDescription>
          Connectez-vous à votre espace familial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={isMagicLink ? (event) => { event.preventDefault(); void handleMagicLink(); } : handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
              {serviceUnavailable && <Link href="/outils" className="mt-2 block font-medium underline">Accéder aux outils gratuits</Link>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="mehdi@exemple.fr"
                className="pl-10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive" role="alert">{errors.email.message}</p>
            )}
          </div>

          {!isMagicLink && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/reset-password"
                  className="text-xs text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {isMagicLink ? (
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le lien de connexion
            </Button>
          ) : (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => { setIsMagicLink(!isMagicLink); setError(null); }}
          >
            <Mail className="mr-2 h-4 w-4" />
            {isMagicLink
              ? "Se connecter avec mot de passe"
              : "Se connecter par magic link"}
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Shield className="h-3 w-3" /> Espace personnel
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CreditCard className="h-3 w-3" /> Offre gratuite disponible
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <EyeOff className="h-3 w-3" /> Préférences de confidentialité
            </span>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Créer un compte
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
