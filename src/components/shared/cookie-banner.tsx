"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cp_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t bg-card p-4 shadow-lg lg:bottom-4 lg:left-4 lg:right-auto lg:max-w-md lg:rounded-xl lg:border"
      role="dialog"
      aria-label="Consentement cookies"
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-warm-orange" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium">Cookies fonctionnels uniquement</p>
          <p className="text-xs text-muted-foreground">
            Darons utilise uniquement des cookies nécessaires au
            fonctionnement du site (authentification, préférences). Aucun cookie
            publicitaire ou de tracking n&apos;est utilisé.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAccept}>
              Compris
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAccept}
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
