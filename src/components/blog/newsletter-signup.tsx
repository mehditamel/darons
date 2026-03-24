"use client";

import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Entre une adresse email valide.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Bienvenue dans la team Darons !");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error ?? "Une erreur est survenue. Réessaie.");
      }
    } catch {
      setStatus("error");
      setMessage("Impossible de se connecter. Réessaie plus tard.");
    }
  }

  if (status === "success") {
    return (
      <Card className="bg-warm-green/5 border-warm-green/20">
        <CardContent className="pt-6 text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-warm-green/10">
            <Check className="h-5 w-5 text-warm-green" />
          </div>
          <p className="font-medium text-warm-green">{message}</p>
          <p className="text-sm text-muted-foreground">
            Tu recevras nos prochains articles par email.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-warm-orange/5 border-warm-orange/20">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warm-orange/10">
            <Mail className="h-5 w-5 text-warm-orange" />
          </div>
          <div>
            <p className="font-medium">
              Reçois nos meilleurs conseils de daron chaque semaine
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Fiscalité, santé, budget, démarches — directement dans ta boîte.
              Pas de spam, promis.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="ton@email.fr"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={status === "loading"} className="shrink-0">
            {status === "loading" ? "..." : "S'abonner"}
            {status !== "loading" && <ArrowRight className="ml-1 h-4 w-4" />}
          </Button>
        </form>
        {status === "error" && (
          <p className="text-sm text-destructive">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
