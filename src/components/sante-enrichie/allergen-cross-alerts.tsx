"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Allergy } from "@/types/health";
import { findAllergenMatches } from "@/lib/allergy-cross-reference";

interface AllergenCrossAlertsProps {
  allergies: Allergy[];
}

export function AllergenCrossAlerts({ allergies }: AllergenCrossAlertsProps) {
  const activeAllergies = allergies.filter((a) => a.active);
  const alertGroups = activeAllergies
    .map((allergy) => ({
      allergy,
      matches: findAllergenMatches(allergy.allergen),
    }))
    .filter((group) => group.matches.length > 0);

  if (alertGroups.length === 0) return null;

  return (
    <Card className="border-warm-orange/20 bg-warm-orange/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-5 w-5 text-warm-orange" />
          Alertes croisées allergies
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alertGroups.map(({ allergy, matches }) =>
          matches.map((match, index) => (
            <div
              key={`${allergy.id}-${index}`}
              className="rounded-lg border border-warm-orange/20 bg-background p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warm-orange shrink-0" />
                <span className="text-sm font-medium">{match.label}</span>
                <Badge
                  variant="outline"
                  className={
                    allergy.severity === "severe"
                      ? "border-red-200 text-red-700"
                      : allergy.severity === "moderate"
                        ? "border-orange-200 text-orange-700"
                        : "border-yellow-200 text-yellow-700"
                  }
                >
                  {allergy.severity === "severe"
                    ? "Sévère"
                    : allergy.severity === "moderate"
                      ? "Modéré"
                      : "Léger"}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Aliments à surveiller :
                </p>
                <div className="flex flex-wrap gap-1">
                  {match.foods.map((food, foodIndex) => (
                    <span
                      key={foodIndex}
                      className="inline-flex rounded-full bg-warm-orange/10 px-2 py-0.5 text-xs text-warm-orange"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic">
                {match.advice}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
