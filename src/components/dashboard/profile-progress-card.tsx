"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/shared/progress-ring";

const ConfettiEffect = dynamic(
  () => import("@/components/shared/confetti-effect").then((m) => m.ConfettiEffect),
  { ssr: false }
);

export interface CompletionItem {
  label: string;
  done: boolean;
  href: string;
  hint: string;
}

interface ProfileProgressCardProps {
  items: CompletionItem[];
  storageKey?: string;
}

export function ProfileProgressCard({ items, storageKey = "darons:profile-100-celebrated" }: ProfileProgressCardProps) {
  const totalDone = items.filter((i) => i.done).length;
  const percent = Math.round((totalDone / items.length) * 100);
  const nextStep = items.find((i) => !i.done);
  const remaining = items.length - totalDone;
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    if (percent !== 100 || typeof window === "undefined") return;
    try {
      const already = window.localStorage.getItem(storageKey);
      if (already) return;
      window.localStorage.setItem(storageKey, new Date().toISOString());
      setShowConfetti(true);
    } catch {
      // localStorage unavailable — silently skip the celebration
    }
  }, [percent, storageKey]);

  if (percent === 100) {
    return (
      <>
        <ConfettiEffect trigger={showConfetti} />
        <Card className="border-warm-green/30 bg-warm-green/5 card-interactive">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <ProgressRing
                  value={100}
                  size={64}
                  strokeWidth={6}
                  color="text-warm-green"
                  animated
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-warm-green" aria-hidden="true" />
                  <p className="text-sm font-semibold">Ton profil est complet 🎉</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Darons gère ta tribu de bout en bout. Les alertes IA tournent en fond.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <Card className="border-dashed border-warm-orange/30 bg-warm-orange/5 card-interactive">
      <CardContent className="p-5">
        <div className="flex items-start gap-5">
          <div className="shrink-0">
            <ProgressRing
              value={percent}
              size={72}
              strokeWidth={6}
              color="text-warm-orange"
              animated
            />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-4 w-4 text-warm-orange shrink-0" aria-hidden="true" />
                <p className="text-sm font-semibold truncate">
                  Ton profil est à {percent}%
                </p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {remaining} étape{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}
              </Badge>
            </div>

            {nextStep && (
              <div className="rounded-xl bg-background/70 p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Prochaine étape
                  </p>
                  <p className="text-sm font-medium truncate">{nextStep.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {nextStep.hint}
                  </p>
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <Link href={nextStep.href}>
                    Continuer
                    <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {items.map((item, i) => (
                <span
                  key={item.label}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors animate-fade-in-up ${
                    item.done
                      ? "bg-warm-green/10 text-warm-green"
                      : "bg-muted text-muted-foreground"
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {item.done ? "✓" : "○"} {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
