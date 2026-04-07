"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Lock, Loader2, Check } from "lucide-react";

interface PhoneNumberSettingsProps {
  currentPhoneNumber: string | null;
  hasSms: boolean;
}

function maskPhoneNumber(phone: string): string {
  if (phone.length < 8) return phone;
  return phone.slice(0, 4) + " ** ** " + phone.slice(-2);
}

export function PhoneNumberSettings({ currentPhoneNumber, hasSms }: PhoneNumberSettingsProps) {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(currentPhoneNumber ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasSms) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 p-4">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Alertes SMS</p>
            <p className="text-xs text-muted-foreground">
              Passez au plan Family Pro pour recevoir les alertes critiques par SMS.
            </p>
          </div>
          <Badge variant="outline">Family Pro</Badge>
        </CardContent>
      </Card>
    );
  }

  async function handleSave() {
    setError(null);
    setSaved(false);

    if (phone && !/^\+33[1-9]\d{8}$/.test(phone)) {
      setError("Format invalide. Utilisez le format +33612345678");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/profile/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Erreur lors de la sauvegarde");
        return;
      }

      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Numéro de téléphone
        </CardTitle>
        <CardDescription>
          Pour les alertes SMS critiques (vaccins en retard, documents expirés)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!editing && currentPhoneNumber ? (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <p className="text-sm font-medium">{maskPhoneNumber(currentPhoneNumber)}</p>
            <div className="flex items-center gap-2">
              {saved && <Check className="h-4 w-4 text-green-500" />}
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Modifier
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              type="tel"
              inputMode="tel"
              placeholder="+33612345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
              {currentPhoneNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(false);
                    setPhone(currentPhoneNumber);
                    setError(null);
                  }}
                >
                  Annuler
                </Button>
              )}
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Maximum 5 SMS/mois. Uniquement pour les alertes critiques.
        </p>
      </CardContent>
    </Card>
  );
}
