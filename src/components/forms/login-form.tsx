"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Loader2 } from "lucide-react";
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
import { loginSchema, type LoginFormData } from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Veuillez r\u00e9essayer.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMagicLink() {
    const email = getValues("email");
    if (!email) {
      setError("Veuillez saisir votre adresse email");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (authError) {
        setError("Impossible d'envoyer le lien. V\u00e9rifiez votre email.");
        return;
      }

      setMagicLinkSent(true);
    } catch {
      setError("Une erreur est survenue. Veuillez r\u00e9essayer.");
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
          <CardTitle>V\u00e9rifiez vos emails</CardTitle>
          <CardDescription>
            Un lien de connexion a \u00e9t\u00e9 envoy\u00e9 \u00e0 votre adresse email.
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
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Connectez-vous \u00e0 votre espace familial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

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

          {!isMagicLink && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/reset-password"
                  className="text-xs text-primary hover:underline"
                >
                  Mot de passe oubli\u00e9 ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
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
          )}

          {isMagicLink ? (
            <Button
              type="button"
              className="w-full"
              onClick={handleMagicLink}
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
            onClick={() => setIsMagicLink(!isMagicLink)}
          >
            <Mail className="mr-2 h-4 w-4" />
            {isMagicLink
              ? "Se connecter avec mot de passe"
              : "Se connecter par magic link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Cr\u00e9er un compte
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
