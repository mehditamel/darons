"use client";

import { useEffect, useState } from "react";
import { Share, Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "pwa-install-dismissed";
const VISIT_COUNT_KEY = "pwa-visit-count";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_VISITS = 2;

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iOS 13+ iPad reports as Mac — detect via touch points
  const isIPadOS = ua.includes("Macintosh") && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || isIPadOS;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // Older iOS exposes the boolean via navigator.standalone
  const navAny = navigator as Navigator & { standalone?: boolean };
  return navAny.standalone === true;
}

export function IosInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isIos()) return;
    if (isStandalone()) return;

    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;
    if (dismissedUntil) localStorage.removeItem(DISMISS_KEY);

    // The visit count is shared with InstallPrompt — don't increment twice
    const visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? "0", 10);
    if (visitCount < MIN_VISITS) return;

    // Slight delay so the prompt doesn't fight with first-paint
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION_MS));
    setShow(false);
  }

  if (!show) return null;

  return (
    <Card className="border-warm-teal/30 bg-warm-teal/5 lg:hidden">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-warm-orange to-warm-orange/80 text-sm font-bold text-white shadow-sm">
              D
            </div>
            <div>
              <p className="text-sm font-semibold">Installe Darons</p>
              <p className="text-xs text-muted-foreground">
                Ajoute l&apos;app à ton écran d&apos;accueil en 3 secondes.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleDismiss}
            aria-label="Masquer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ol className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background font-semibold text-foreground">
              1
            </span>
            <span className="flex items-center gap-1.5">
              Appuie sur
              <Share className="h-3.5 w-3.5 text-warm-blue" aria-label="Partager" />
              <span className="font-medium text-foreground">Partager</span>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background font-semibold text-foreground">
              2
            </span>
            <span className="flex items-center gap-1.5">
              Choisis
              <Plus className="h-3.5 w-3.5 text-warm-blue" aria-label="Sur l'écran d'accueil" />
              <span className="font-medium text-foreground">Sur l&apos;écran d&apos;accueil</span>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background font-semibold text-foreground">
              3
            </span>
            <span>
              Et c&apos;est plié. <span className="font-medium text-foreground">Ajouter</span>.
            </span>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
