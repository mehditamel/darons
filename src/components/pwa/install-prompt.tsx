"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed before (with 7-day expiry)
    const dismissedUntil = localStorage.getItem("pwa-install-dismissed");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setDismissed(true);
      return;
    }
    localStorage.removeItem("pwa-install-dismissed");

    // Only show after 2 visits
    const visitCount = parseInt(localStorage.getItem("pwa-visit-count") || "0", 10) + 1;
    localStorage.setItem("pwa-visit-count", String(visitCount));
    if (visitCount < 2) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Remember dismissal for 7 days
    localStorage.setItem("pwa-install-dismissed", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  if (isInstalled || dismissed || !deferredPrompt) return null;

  return (
    <Card className="border-warm-teal/30 bg-warm-teal/5">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-warm-teal shrink-0" />
          <div>
            <p className="text-sm font-medium">Installer Darons</p>
            <p className="text-xs text-muted-foreground">
              Accédez rapidement depuis votre écran d&apos;accueil
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleInstall}>
            Installer
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
