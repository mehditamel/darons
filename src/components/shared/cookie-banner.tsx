"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

    function handleReset() {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      setVisible(true);
    }

    window.addEventListener("cookie-consent-reset", handleReset);
    return () => window.removeEventListener("cookie-consent-reset", handleReset);
  }, []);

  function handleChoice(choice: "accepted" | "refused") {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
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
            Darons utilise uniquement des cookies necessaires au
            fonctionnement du site (authentification, preferences). Aucun cookie
            publicitaire ou de tracking n'est utilise.{" "}
            <Link
              href="/politique-confidentialite"
              className="underline hover:text-foreground"
            >
              En savoir plus
            </Link>
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleChoice("accepted")}>
              Accepter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleChoice("refused")}
            >
              Refuser
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
