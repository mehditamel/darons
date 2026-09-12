"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Syringe, ArrowRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { publicVaccinationDates, VACCINATION_REFERENCE_URL, VACCINATION_REFERENCE_YEAR } from "@/lib/public-vaccination";
import { formatDate } from "@/lib/utils";


export default function CalendrierVaccinalPage() {
  const [birthDate, setBirthDate] = useState("");

  const { dates: schedule, error } = useMemo(() => publicVaccinationDates(birthDate), [birthDate]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-orange/10 text-warm-orange flex items-center justify-center mx-auto">
          <Syringe className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Calendrier vaccinal {VACCINATION_REFERENCE_YEAR}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Les dates indicatives des vaccinations du nourrisson, selon sa date de naissance.
          Ce calendrier ne détermine pas les doses déjà réalisées ni les rattrapages.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <Label htmlFor="birthDate">Date de naissance de l'enfant</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="mt-2"
            aria-invalid={!!error}
            aria-describedby={error ? "birth-date-error" : "vaccination-reference"}
          />
          {error && <p id="birth-date-error" role="alert" className="mt-3 text-sm text-danger">{error}</p>}
        </CardContent>
      </Card>

      <p id="vaccination-reference" className="mx-auto max-w-2xl text-sm text-muted-foreground">
        Référence : <a href={VACCINATION_REFERENCE_URL} className="text-primary underline">Santé publique France, calendrier 2026</a>.
        Les méningocoques B et ACWY font partie du schéma actuel. Pour les enfants nés depuis 2023,
        les éventuels rattrapages sont à adapter au carnet de vaccination avec un professionnel de santé.
      </p>

      {schedule && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-center">
            Calendrier personnalisé
          </h2>

          <div className="space-y-3 max-w-2xl mx-auto">
            {schedule.map((vaccine, i) => (
              <Card
                key={`${vaccine.vaccineCode}-${vaccine.doseNumber}-${i}`}

              >
                <CardContent className="py-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex flex-col items-center min-w-[60px]">
                      <span className="text-xs text-muted-foreground">
                        {vaccine.label}
                      </span>
                      <Calendar className="w-5 h-5 text-warm-orange mt-1" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {vaccine.vaccineName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dose {vaccine.doseNumber}
                        {vaccine.vaccineCode && ` — ${vaccine.vaccineCode}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDate(vaccine.scheduledDate, "dd/MM/yyyy")}
                    </p>
                    {vaccine.isPast ? (
                      <Badge variant="secondary" className="text-xs">
                        Date passée
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-primary text-primary-foreground">
                        À planifier
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="max-w-2xl mx-auto bg-warm-orange/5 border-warm-orange/20">
            <CardContent className="pt-6 text-center space-y-3">
              <p className="font-medium">
                Retrouve aussi le guide des vaccinations
              </p>
              <Button asChild>
                <Link href="/outils/guide-vaccins-obligatoires">
                  Lire le guide <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!schedule && !error && (
        <div className="text-center py-12 text-muted-foreground">
          <Syringe className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Entrez la date de naissance pour générer le calendrier</p>
        </div>
      )}
    </div>
  );
}
