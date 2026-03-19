"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PiggyBank, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CHILD_COST_REFERENCE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function CombienCouteEnfantPage() {
  const breakdown = useMemo(() => {
    return CHILD_COST_REFERENCE.map((tranche) => {
      const totalMensuel = (Object.values(tranche.categories) as number[]).reduce((a, b) => a + b, 0);
      const dureeMois = tranche.maxMonths - tranche.minMonths;
      const totalPeriode = totalMensuel * dureeMois;
      return {
        ...tranche,
        totalMensuel,
        totalPeriode,
        categories: Object.entries(tranche.categories).map(([key, value]) => ({
          key,
          label: CATEGORY_LABELS[key] ?? key,
          montant: value,
          pct: totalMensuel > 0 ? (value / totalMensuel) * 100 : 0,
        })),
      };
    });
  }, []);

  const totalGlobal = breakdown.reduce((a, b) => a + b.totalPeriode, 0);
  const moyenneMensuelle = totalGlobal / 216; // 18 ans = 216 mois

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-gold/10 text-warm-gold flex items-center justify-center mx-auto">
          <PiggyBank className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Combien coûte un enfant de 0 à 18 ans ?
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Le vrai coût, poste par poste, tranche d&apos;âge par tranche d&apos;âge.
          Spoiler : c&apos;est beaucoup, mais les aides aident.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="card-playful">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-warm-gold">
              {formatCurrency(totalGlobal)}
            </p>
            <p className="text-xs text-muted-foreground">Coût total estimé (0-18 ans)</p>
          </CardContent>
        </Card>
        <Card className="card-playful">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-warm-orange">
              {formatCurrency(moyenneMensuelle)}
            </p>
            <p className="text-xs text-muted-foreground">Coût moyen / mois</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {breakdown.map((tranche) => (
          <Card key={tranche.ageRange} className="card-playful">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{tranche.ageRange}</CardTitle>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(tranche.totalMensuel)}/mois</p>
                  <p className="text-xs text-muted-foreground">
                    soit {formatCurrency(tranche.totalPeriode)} sur la période
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tranche.categories
                .filter((c) => c.montant > 0)
                .sort((a, b) => b.montant - a.montant)
                .map((cat) => (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{cat.label}</span>
                      <span className="font-medium">
                        {formatCurrency(cat.montant)}
                        <span className="text-muted-foreground ml-1">({cat.pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-warm-gold"
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-warm-teal/5 border-warm-teal/20">
        <CardContent className="pt-6 text-center space-y-3">
          <p className="font-medium">
            Calcule tes aides et réduis ce montant avec notre simulateur de droits
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/outils/mes-droits">
              <Button variant="outline">Calculer mes aides</Button>
            </Link>
            <Link href="/register">
              <Button>Créer mon compte gratuit <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  alimentation: "Alimentation",
  couches_hygiene: "Couches & hygiène",
  garde: "Mode de garde",
  vetements: "Vêtements",
  sante: "Santé",
  loisirs: "Loisirs & activités",
  equipement: "Équipement",
  scolarite: "Scolarité",
};
