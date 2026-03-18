"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Syringe, ArrowRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { VACCINATION_SCHEDULE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { addMonths } from "date-fns";

export default function CalendrierVaccinalPage() {
  const [birthDate, setBirthDate] = useState("");

  const schedule = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;

    const today = new Date();
    // Flatten vaccines with doses into individual entries
    return VACCINATION_SCHEDULE.flatMap((vaccine) =>
      vaccine.doses.map((dose) => {
        const scheduledDate = addMonths(birth, dose.ageMonths);
        return {
          vaccineCode: vaccine.code,
          vaccineName: vaccine.name,
          doseNumber: dose.doseNumber,
          ageMonths: dose.ageMonths,
          scheduledDate,
          isPast: scheduledDate < today,
        };
      })
    ).sort((a, b) => a.ageMonths - b.ageMonths);
  }, [birthDate]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-orange/10 text-warm-orange flex items-center justify-center mx-auto">
          <Syringe className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Calendrier vaccinal 2025
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Les 9 vaccins obligatoires pour votre enfant. Entrez sa date de
          naissance pour voir les dates personnalisées.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <Label htmlFor="birthDate">Date de naissance de l&apos;enfant</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="mt-2"
          />
        </CardContent>
      </Card>

      {schedule && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-center">
            Calendrier personnalisé
          </h2>

          <div className="space-y-3 max-w-2xl mx-auto">
            {schedule.map((vaccine, i) => (
              <Card
                key={`${vaccine.vaccineCode}-${vaccine.doseNumber}-${i}`}
                className={vaccine.isPast ? "opacity-60" : ""}
              >
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center min-w-[60px]">
                      <span className="text-xs text-muted-foreground">
                        {vaccine.ageMonths} mois
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
                        Passé
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-warm-orange">
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
                Recevez des rappels automatiques pour chaque vaccin
              </p>
              <Link href="/register">
                <Button>
                  Créer mon compte gratuit <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {!schedule && (
        <div className="text-center py-12 text-muted-foreground">
          <Syringe className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Entrez la date de naissance pour générer le calendrier</p>
        </div>
      )}
    </div>
  );
}
