"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X, Bell, Save, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SignupNudgeProps {
  variant?: "inline" | "banner";
}

export function SignupNudge({ variant = "inline" }: SignupNudgeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === "banner") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-in-left">
        <Card className="max-w-lg mx-auto border-warm-orange/30 bg-background shadow-lg">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex-1">
              <p className="font-semibold text-sm">Tu utilises déjà Darons comme un pro</p>
              <p className="text-xs text-muted-foreground">
                Crée ton compte pour tout centraliser et recevoir des alertes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/register">
                <Button size="sm">
                  C&apos;est gratuit <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
              <button
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-warm-orange/5 to-warm-teal/5 border-warm-orange/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-3">
            <p className="font-semibold">
              Sauvegarde tes données et fais-en plus
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 text-warm-teal" />
                Sauvegarde multi-appareils
              </span>
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-warm-orange" />
                Alertes automatiques
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-warm-purple" />
                Conseils IA personnalisés
              </span>
            </div>
            <Link href="/register">
              <Button size="sm">
                Créer mon compte gratuit <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
