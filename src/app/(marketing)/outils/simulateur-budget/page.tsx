"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  { key: "alimentation", label: "Alimentation", color: "#E8734A" },
  { key: "logement", label: "Logement (loyer/crédit)", color: "#4A7BE8" },
  { key: "garde", label: "Garde d'enfant", color: "#2BA89E" },
  { key: "sante", label: "Santé (mutuelle, soins)", color: "#7B5EA7" },
  { key: "transport", label: "Transport", color: "#D4A843" },
  { key: "vetements", label: "Vêtements", color: "#4CAF50" },
  { key: "loisirs", label: "Loisirs / activités", color: "#E8534A" },
  { key: "scolarite", label: "Scolarité", color: "#4A7BE8" },
  { key: "assurance", label: "Assurances", color: "#7B5EA7" },
  { key: "autre", label: "Autre", color: "#94A3B8" },
] as const;

interface BudgetResult {
  totalDepenses: number;
  resteAVivre: number;
  resteAVivreQuotidien: number;
  resteAVivrePct: number;
  categories: { key: string; label: string; montant: number; color: string; pct: number }[];
}

export default function SimulateurBudgetPage() {
  const [revenus, setRevenus] = useState(3500);
  const [depenses, setDepenses] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.key, 0]))
  );
  const [result, setResult] = useState<BudgetResult | null>(null);

  function calculate() {
    const totalDepenses = Object.values(depenses).reduce((a, b) => a + b, 0);
    const resteAVivre = revenus - totalDepenses;
    const resteAVivreQuotidien = resteAVivre / 30;
    const resteAVivrePct = revenus > 0 ? (resteAVivre / revenus) * 100 : 0;

    const categories = CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label,
      montant: depenses[c.key] || 0,
      color: c.color,
      pct: totalDepenses > 0 ? ((depenses[c.key] || 0) / totalDepenses) * 100 : 0,
    })).filter((c) => c.montant > 0);

    setResult({ totalDepenses, resteAVivre, resteAVivreQuotidien, resteAVivrePct, categories });
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-gold/10 text-warm-gold flex items-center justify-center mx-auto">
          <Wallet className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Où passe ta thune de parent ?
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Fais le point sur ton budget famille en 2 minutes.
          Revenus, dépenses, reste à vivre. Zéro jugement.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tes revenus et dépenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="revenus">Revenus nets mensuels du foyer (€)</Label>
              <Input
                id="revenus"
                type="number"
                value={revenus}
                onChange={(e) => setRevenus(Number(e.target.value))}
                placeholder="3500"
              />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Dépenses mensuelles par catégorie</p>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => (
                  <div key={cat.key} className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <Label className="flex-1 text-sm" htmlFor={cat.key}>{cat.label}</Label>
                    <Input
                      id={cat.key}
                      type="number"
                      className="w-28"
                      value={depenses[cat.key] || ""}
                      onChange={(e) =>
                        setDepenses({ ...depenses, [cat.key]: Number(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={calculate} className="w-full" size="lg">
              Calculer mon budget
            </Button>
          </CardContent>
        </Card>

        {result ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="card-playful">
                <CardContent className="pt-5 text-center">
                  <p className="text-2xl font-bold">{formatCurrency(result.totalDepenses)}</p>
                  <p className="text-xs text-muted-foreground">Dépenses / mois</p>
                </CardContent>
              </Card>
              <Card className={`card-playful ${result.resteAVivrePct < 20 ? "border-warm-red/30" : "border-warm-green/30"}`}>
                <CardContent className="pt-5 text-center">
                  <p className={`text-2xl font-bold ${result.resteAVivre < 0 ? "text-warm-red" : "text-warm-green"}`}>
                    {formatCurrency(result.resteAVivre)}
                  </p>
                  <p className="text-xs text-muted-foreground">Reste à vivre / mois</p>
                </CardContent>
              </Card>
            </div>

            {result.resteAVivrePct < 20 && (
              <Card className="border-warm-red/30 bg-warm-red/5">
                <CardContent className="pt-5 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warm-red shrink-0" />
                  <p className="text-sm">
                    Ton reste à vivre est inférieur à 20% de tes revenus.
                    C&apos;est serré. Regarde si tu touches toutes les aides auxquelles t&apos;as droit.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Répartition des dépenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.categories.map((cat) => (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.label}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(cat.montant)}
                        <span className="text-muted-foreground ml-1">({cat.pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="card-playful">
              <CardContent className="pt-5 text-center">
                <p className="text-sm text-muted-foreground">Tu peux dépenser par jour</p>
                <p className="text-3xl font-bold text-warm-gold">
                  {formatCurrency(Math.max(0, result.resteAVivreQuotidien))}
                </p>
                <p className="text-xs text-muted-foreground">reste à vivre quotidien</p>
              </CardContent>
            </Card>

            <Card className="bg-warm-teal/5 border-warm-teal/20">
              <CardContent className="pt-6 text-center space-y-3">
                <p className="font-medium">
                  Connecte ta banque pour un suivi automatique et des alertes budget
                </p>
                <Link href="/register">
                  <Button>
                    Créer mon compte gratuit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex items-center justify-center min-h-[300px]">
            <CardContent className="text-center text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Remplis tes dépenses et clique sur Calculer</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
