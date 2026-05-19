"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, AlertTriangle, Lock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { verifyPinAndGetCard, type VerifyResult } from "@/app/c/[token]/actions";
import type { TrustCardPayload } from "@/types/trust-card";
import { PublicTrustCardView } from "./public-trust-card-view";

interface Props {
  token: string;
}

export function PublicPinForm({ token }: Props) {
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const [payload, setPayload] = useState<TrustCardPayload | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  function handleDigit(idx: number, value: string) {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = sanitized;
    setDigits(next);
    setError(null);

    if (sanitized && idx < 3) {
      inputs.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter") {
      void submit();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      e.preventDefault();
      setDigits(pasted.split(""));
      inputs.current[3]?.focus();
    }
  }

  async function submit() {
    const pin = digits.join("");
    if (pin.length !== 4) {
      setError("Entre les 4 chiffres du PIN");
      return;
    }

    setLoading(true);
    setError(null);
    const result: VerifyResult = await verifyPinAndGetCard(token, pin);
    setLoading(false);

    switch (result.status) {
      case "ok":
        setPayload(result.payload);
        break;
      case "wrong_pin":
        setError(
          result.remaining > 0
            ? `PIN incorrect. ${result.remaining} essai${result.remaining > 1 ? "s" : ""} restant${result.remaining > 1 ? "s" : ""}.`
            : "PIN incorrect."
        );
        setDigits(["", "", "", ""]);
        inputs.current[0]?.focus();
        break;
      case "locked":
        setLocked(result.until);
        break;
      case "expired":
        setError("Ce carnet a expiré.");
        break;
      case "revoked":
        setError("Ce carnet a été révoqué par son créateur.");
        break;
      case "invalid_token":
        setError("Ce lien n'est pas valide.");
        break;
      case "error":
        setError(result.message);
        break;
    }
  }

  if (payload) {
    return <PublicTrustCardView payload={payload} />;
  }

  if (locked) {
    const until = format(new Date(locked), "d MMM 'à' HH:mm", { locale: fr });
    return (
      <Card className="border-warm-orange/30">
        <CardContent className="p-8 text-center space-y-3">
          <Lock className="h-12 w-12 mx-auto text-warm-orange" />
          <h2 className="text-xl font-semibold">Trop d'essais</h2>
          <p className="text-sm text-muted-foreground">
            Pour protéger ces infos, le carnet est temporairement bloqué.
          </p>
          <p className="text-sm">
            Réessaie après le <strong>{until}</strong>.
          </p>
          <p className="text-xs text-muted-foreground pt-2">
            Si ce n'est pas toi qui essaies, préviens la personne qui t'a donné ce lien.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8 text-center space-y-5">
        <ShieldCheck className="h-12 w-12 mx-auto text-warm-teal" />
        <div>
          <h1 className="text-xl font-semibold">Entre le PIN</h1>
          <p className="text-sm text-muted-foreground mt-1">
            La personne qui t'a confié ce lien t'a aussi donné un code à 4 chiffres.
          </p>
        </div>

        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="h-14 w-12 text-center text-2xl font-mono font-semibold rounded-lg border-2 border-input focus:border-warm-teal focus:outline-none transition-colors"
              aria-label={`Chiffre ${idx + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive flex items-center justify-center gap-1" role="alert">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
        )}

        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Vérification…
            </>
          ) : (
            "Ouvrir le carnet"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
