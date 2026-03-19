"use client";

import { useState } from "react";
import { Monitor, Clock, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SCREEN_EXPOSURE_RECOMMENDATIONS } from "@/lib/constants";

const ALTERNATIVES_BY_AGE = [
  { maxMonths: 24, activities: ["Jeux de construction", "Livres cartonnés", "Peinture au doigt", "Musique et danse", "Promenade au parc", "Bac à sable", "Bain sensoriel", "Pâte à modeler"] },
  { maxMonths: 36, activities: ["Puzzles simples", "Pâtisserie avec papa/maman", "Jardinage", "Jeux d'imitation", "Vélo sans pédales", "Coloriage", "Piscine", "Histoires lues"] },
  { maxMonths: 72, activities: ["Sport collectif", "Instruments de musique", "Jeux de société", "Bricolage", "Vélo", "Lecture autonome", "Théâtre / marionnettes", "Sortie nature"] },
  { maxMonths: 216, activities: ["Sports en club", "Écriture créative", "Programmation (Scratch)", "Arts plastiques", "Randonnée", "Bénévolat", "Cuisine", "Jeux de stratégie"] },
];

function getRecommendation(ageMonths: number) {
  return SCREEN_EXPOSURE_RECOMMENDATIONS.find(
    (r) => ageMonths >= r.minMonths && ageMonths < r.maxMonths
  );
}

function getAlternatives(ageMonths: number) {
  const entry = ALTERNATIVES_BY_AGE.find((a) => ageMonths < a.maxMonths);
  return entry?.activities ?? ALTERNATIVES_BY_AGE[ALTERNATIVES_BY_AGE.length - 1].activities;
}

export default function EcransEnfantsPage() {
  const [ageMonths, setAgeMonths] = useState<number | null>(null);
  const recommendation = ageMonths !== null ? getRecommendation(ageMonths) : null;
  const alternatives = ageMonths !== null ? getAlternatives(ageMonths) : [];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-purple/10 text-warm-purple flex items-center justify-center mx-auto">
          <Monitor className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Les écrans et ton enfant
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Recommandations officielles du carnet de santé 2025.
          Pas de jugement, juste des repères clairs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quel âge a ton enfant ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "0-1 an", months: 6 },
              { label: "1-2 ans", months: 18 },
              { label: "2-3 ans", months: 30 },
              { label: "3-6 ans", months: 48 },
              { label: "6-9 ans", months: 90 },
              { label: "9-12 ans", months: 126 },
              { label: "12-15 ans", months: 162 },
              { label: "15+ ans", months: 192 },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setAgeMonths(item.months)}
                className={`rounded-xl border-2 p-4 text-center transition-all hover:border-warm-purple ${
                  ageMonths === item.months
                    ? "border-warm-purple bg-warm-purple/5 font-semibold"
                    : "border-border"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {recommendation && (
        <>
          <Card className={recommendation.maxMinutesPerDay === 0 ? "border-warm-red/30 bg-warm-red/5" : "border-warm-orange/30 bg-warm-orange/5"}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-warm-orange" />
                <div>
                  <p className="text-lg font-semibold">{recommendation.recommendation}</p>
                  <Badge variant="outline">{recommendation.ageRange}</Badge>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    recommendation.maxMinutesPerDay === 0
                      ? "bg-warm-red w-0"
                      : recommendation.maxMinutesPerDay <= 30
                        ? "bg-warm-orange w-1/6"
                        : recommendation.maxMinutesPerDay <= 60
                          ? "bg-warm-gold w-1/3"
                          : "bg-warm-blue w-1/2"
                  }`}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {recommendation.maxMinutesPerDay === 0
                  ? "Pas d'écran recommandé à cet âge"
                  : `Max ${recommendation.maxMinutesPerDay} min/jour`}
              </p>

              <p className="text-sm">{recommendation.details}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warm-gold" />
                Alternatives aux écrans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {alternatives.map((activity) => (
                  <div key={activity} className="flex items-center gap-2 text-sm py-1">
                    <span className="w-2 h-2 rounded-full bg-warm-teal shrink-0" />
                    {activity}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold">Toutes les recommandations</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SCREEN_EXPOSURE_RECOMMENDATIONS.map((rec) => (
            <Card key={rec.ageRange} className="card-playful">
              <CardContent className="pt-5">
                <Badge className="mb-2">{rec.ageRange}</Badge>
                <p className="font-semibold text-sm">{rec.recommendation}</p>
                <p className="text-xs text-muted-foreground mt-1">{rec.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
