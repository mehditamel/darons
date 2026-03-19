"use client";

import { useState, useTransition } from "react";
import { Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateUserConsent } from "@/lib/actions/rgpd";
import type { ConsentRecord } from "@/lib/actions/rgpd";

const CONSENT_TYPE_LABELS: Record<string, string> = {
  terms_of_service: "Conditions générales d'utilisation",
  privacy_policy: "Politique de confidentialité",
  health_data: "Traitement des données de santé",
  open_banking: "Connexion bancaire (Open Banking)",
  ai_processing: "Analyse par intelligence artificielle",
  email_notifications: "Notifications par email",
  sms_notifications: "Notifications par SMS",
  push_notifications: "Notifications push",
  analytics: "Mesure d'audience anonyme",
};

function getConsentLabel(type: string): string {
  return CONSENT_TYPE_LABELS[type] ?? type;
}

const CONSENT_TYPES = [
  { type: "terms_of_service", required: true },
  { type: "privacy_policy", required: true },
  { type: "health_data", required: false },
  { type: "open_banking", required: false },
  { type: "ai_processing", required: false },
  { type: "email_notifications", required: false },
  { type: "sms_notifications", required: false },
  { type: "push_notifications", required: false },
  { type: "analytics", required: false },
] as const;

interface ConsentManagerProps {
  consents: ConsentRecord[];
}

export function ConsentManager({ consents: initialConsents }: ConsentManagerProps) {
  const [consents, setConsents] = useState(initialConsents);
  const [isPending, startTransition] = useTransition();

  function isGranted(type: string): boolean {
    const consent = consents.find((c) => c.consentType === type);
    return consent?.granted ?? false;
  }

  function handleToggle(type: string, granted: boolean) {
    setConsents((prev) => {
      const existing = prev.find((c) => c.consentType === type);
      if (existing) {
        return prev.map((c) =>
          c.consentType === type ? { ...c, granted } : c
        );
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          consentType: type,
          granted,
          grantedAt: new Date().toISOString(),
          revokedAt: null,
        },
      ];
    });

    startTransition(async () => {
      await updateUserConsent(type, granted);
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-warm-blue" />
          <CardTitle>Consentements RGPD</CardTitle>
        </div>
        <CardDescription>
          Gérez vos consentements de manière granulaire. Les consentements
          obligatoires ne peuvent pas être désactivés.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {CONSENT_TYPES.map(({ type, required }) => (
          <div
            key={type}
            className="flex items-center justify-between gap-4 py-2"
          >
            <div className="flex-1">
              <Label
                htmlFor={`consent-${type}`}
                className="text-sm font-medium"
              >
                {getConsentLabel(type)}
              </Label>
              {required && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (obligatoire)
                </span>
              )}
            </div>
            <Switch
              id={`consent-${type}`}
              checked={required ? true : isGranted(type)}
              disabled={required || isPending}
              onCheckedChange={(checked) => handleToggle(type, checked)}
              aria-label={`Consentement : ${getConsentLabel(type)}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
