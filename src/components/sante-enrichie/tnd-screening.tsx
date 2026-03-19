"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { TND_SCREENING_GRIDS } from "@/lib/constants";
import { differenceInMonths } from "date-fns";
import type { HealthExamination } from "@/types/health";
import type { FamilyMember } from "@/types/family";

interface TndScreeningProps {
  member: FamilyMember;
  examinations: HealthExamination[];
}

const CATEGORY_LABELS: Record<string, string> = {
  motricite: "Motricité",
  langage: "Langage",
  attention: "Attention",
  social: "Interactions sociales",
};

const CATEGORY_COLORS: Record<string, string> = {
  motricite: "text-blue-600",
  langage: "text-purple-600",
  attention: "text-amber-600",
  social: "text-teal-600",
};

export function TndScreening({ member, examinations }: TndScreeningProps) {
  const childAgeMonths = differenceInMonths(new Date(), new Date(member.birthDate));

  const currentGrid = TND_SCREENING_GRIDS.find(
    (g) => childAgeMonths >= g.minMonths && childAgeMonths < g.maxMonths
  );

  const latestExamWithTnd = [...examinations]
    .filter((e) => e.tndScreeningNotes)
    .sort((a, b) => (b.completedDate ?? "").localeCompare(a.completedDate ?? ""))
    [0];

  if (!currentGrid) {
    const allGrids = TND_SCREENING_GRIDS;
    const nextGrid = allGrids.find((g) => childAgeMonths < g.minMonths);

    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {childAgeMonths < 3
              ? `Le repérage TND commence à partir de 3 mois. ${member.firstName} a ${childAgeMonths} mois.`
              : nextGrid
                ? `Prochaine grille disponible : ${nextGrid.ageRange}`
                : `Pas de grille de repérage adaptée à l'âge actuel (${childAgeMonths} mois).`}
          </p>
        </CardContent>
      </Card>
    );
  }

  const categories = Array.from(new Set(currentGrid.items.map((i) => i.category)));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Grille de repérage TND — {currentGrid.ageRange}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Cochez les compétences observées chez {member.firstName} ({childAgeMonths} mois).
            En cas de doute, parlez-en au pédiatre lors du prochain examen.
          </p>
        </CardHeader>
        <CardContent>
          {categories.map((cat) => (
            <div key={cat} className="mb-4 last:mb-0">
              <h4 className={`text-sm font-semibold mb-2 ${CATEGORY_COLORS[cat] ?? ""}`}>
                {CATEGORY_LABELS[cat] ?? cat}
              </h4>
              <div className="space-y-1">
                {currentGrid.items
                  .filter((i) => i.category === cat)
                  .map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50"
                    >
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {latestExamWithTnd && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dernières notes TND</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                Examen n°{latestExamWithTnd.examNumber}
              </Badge>
              {latestExamWithTnd.completedDate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(latestExamWithTnd.completedDate).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">
              {latestExamWithTnd.tndScreeningNotes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="py-3 px-4">
          <p className="text-xs text-blue-700">
            <strong>Important :</strong> Cette grille est un outil d&apos;observation simplifié,
            pas un diagnostic. Si plusieurs items ne sont pas observés, consultez votre
            pédiatre pour un bilan approfondi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
