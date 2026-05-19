"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Syringe,
  Phone,
  Stethoscope,
  StickyNote,
  Baby,
  Clock,
} from "lucide-react";
import { format, differenceInMonths, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import type { TrustCardPayload } from "@/types/trust-card";

interface Props {
  payload: TrustCardPayload;
}

function formatAge(birthDate: string): string {
  const now = new Date();
  const birth = new Date(birthDate);
  const years = differenceInYears(now, birth);
  const months = differenceInMonths(now, birth) % 12;
  if (years === 0) return `${differenceInMonths(now, birth)} mois`;
  if (years < 3) return `${years} an${years > 1 ? "s" : ""} et ${months} mois`;
  return `${years} ans`;
}

const SEVERITY_META = {
  severe: { label: "Sévère", className: "bg-warm-red text-white" },
  moderate: { label: "Modérée", className: "bg-warm-orange text-white" },
  mild: { label: "Légère", className: "bg-warm-gold/80 text-warm-darkblue" },
} as const;

export function PublicTrustCardView({ payload }: Props) {
  const hasAllergies = payload.sections.includes("allergies") && payload.allergies && payload.allergies.length > 0;

  return (
    <div className="space-y-4">
      <Card className="border-warm-teal/30 bg-warm-teal/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-warm-teal/20 flex items-center justify-center">
              <Baby className="h-6 w-6 text-warm-teal" />
            </div>
            <div>
              <CardTitle>{payload.childFirstName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatAge(payload.childBirthDate)} · né
                {payload.identite?.firstName ? "" : ""} le{" "}
                {format(new Date(payload.childBirthDate), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Accès jusqu'au {format(new Date(payload.expiresAt), "d MMM 'à' HH:mm", { locale: fr })}
        </CardContent>
      </Card>

      {hasAllergies && (
        <Card className="border-warm-red/40">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warm-red" />
              <CardTitle className="text-base">Allergies — à connaître absolument</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {payload.allergies!.map((a, i) => {
              const meta = SEVERITY_META[a.severity as keyof typeof SEVERITY_META] ?? SEVERITY_META.moderate;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-warm-red/5 border border-warm-red/20">
                  <Badge className={meta.className}>{meta.label}</Badge>
                  <div className="flex-1">
                    <div className="font-medium">{a.allergen}</div>
                    {a.reaction && (
                      <div className="text-sm text-muted-foreground">Réaction : {a.reaction}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {payload.sections.includes("emergency") && payload.emergencyContacts && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-warm-orange" />
              <CardTitle className="text-base">Numéros d'urgence</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {payload.emergencyContacts.map((c, i) => (
              <a
                key={i}
                href={`tel:${c.phone.replace(/\s/g, "")}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:border-warm-orange hover:bg-warm-orange/5 transition-colors"
              >
                <span className="text-sm">{c.label}</span>
                <span className="font-mono font-semibold text-warm-orange">{c.phone}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {payload.sections.includes("practitioners") && payload.practitioners && payload.practitioners.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-warm-teal" />
              <CardTitle className="text-base">Médecins de référence</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {payload.practitioners.map((p, i) => (
              <div key={i} className="p-3 rounded-lg border">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground capitalize">{p.type}</div>
                {p.phone && <div className="text-sm mt-1">📍 {p.phone}</div>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {payload.sections.includes("vaccinations") && payload.vaccinations && payload.vaccinations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-warm-blue" />
              <CardTitle className="text-base">Vaccinations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {payload.vaccinations.slice(0, 10).map((v, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                <span>{v.vaccineName}</span>
                <span className="text-muted-foreground text-xs">
                  {v.administeredDate
                    ? `✓ ${format(new Date(v.administeredDate), "d MMM yyyy", { locale: fr })}`
                    : v.status === "overdue"
                    ? "⚠ en retard"
                    : "à faire"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {payload.sections.includes("routines") && payload.notes && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-warm-purple" />
              <CardTitle className="text-base">Notes & routines</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{payload.notes}</p>
          </CardContent>
        </Card>
      )}

      {payload.sections.includes("identite") && payload.identite && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Identité</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">Nom :</span>{" "}
              {payload.identite.firstName} {payload.identite.lastName}
            </div>
            <div>
              <span className="text-muted-foreground">Date de naissance :</span>{" "}
              {format(new Date(payload.identite.birthDate), "d MMMM yyyy", { locale: fr })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
