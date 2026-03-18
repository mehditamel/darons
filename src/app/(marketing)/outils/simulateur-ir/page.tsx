"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { taxSimulationSchema, type TaxSimulationFormData } from "@/lib/validators/fiscal";
import { simulateIR } from "@/lib/simulators/ir-simulator";
import type { TaxSimulationResult } from "@/types/fiscal";
import { formatCurrency } from "@/lib/utils";

// Static metadata must be in a separate file for client components
// See layout or head.tsx for SEO

export default function SimulateurIRPage() {
  const [result, setResult] = useState<TaxSimulationResult | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<TaxSimulationFormData>({
    resolver: zodResolver(taxSimulationSchema),
    defaultValues: {
      revenuNetImposable: 0,
      nbParts: 1,
      numChildren: 0,
      gardeEnfantExpenses: 0,
      emploiDomicileExpenses: 0,
      donsOrganismes: 0,
      donsAidePersonnes: 0,
    },
  });

  function onSubmit(data: TaxSimulationFormData) {
    const simulation = simulateIR({
      revenuNetImposable: data.revenuNetImposable,
      nbParts: data.nbParts,
      numChildren: data.numChildren ?? 0,
      gardeEnfantExpenses: data.gardeEnfantExpenses ?? 0,
      emploiDomicileExpenses: data.emploiDomicileExpenses ?? 0,
      donsOrganismes: data.donsOrganismes ?? 0,
      donsAidePersonnes: data.donsAidePersonnes ?? 0,
    });
    setResult(simulation);
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-gold/10 text-warm-gold flex items-center justify-center mx-auto">
          <Calculator className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Simulateur impôt sur le revenu 2025
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Calculez votre impôt avec le barème 2025 (revenus 2024). Estimez votre
          TMI, vos crédits d&apos;impôt et votre taux effectif.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vos revenus et situation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="revenuNetImposable">Revenu net imposable (€)</Label>
                <Input
                  id="revenuNetImposable"
                  type="number"
                  {...register("revenuNetImposable", { valueAsNumber: true })}
                  placeholder="60000"
                />
                {errors.revenuNetImposable && (
                  <p className="text-sm text-destructive mt-1">{errors.revenuNetImposable.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nbParts">Nombre de parts fiscales</Label>
                <Input
                  id="nbParts"
                  type="number"
                  step="0.5"
                  {...register("nbParts", { valueAsNumber: true })}
                  placeholder="2.5"
                />
                {errors.nbParts && (
                  <p className="text-sm text-destructive mt-1">{errors.nbParts.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Couple marié/pacsé = 2 parts, +0.5 par enfant (1 à partir du 3e)
                </p>
              </div>

              <div>
                <Label htmlFor="numChildren">Nombre d&apos;enfants</Label>
                <Input
                  id="numChildren"
                  type="number"
                  {...register("numChildren", { valueAsNumber: true })}
                  placeholder="1"
                />
              </div>

              <div>
                <Label htmlFor="gardeEnfantExpenses">Frais de garde enfant &lt; 6 ans (€/an)</Label>
                <Input
                  id="gardeEnfantExpenses"
                  type="number"
                  {...register("gardeEnfantExpenses", { valueAsNumber: true })}
                  placeholder="3500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Crédit 50%, plafond 3 500 € → max 1 750 €
                </p>
              </div>

              <div>
                <Label htmlFor="emploiDomicileExpenses">Emploi à domicile (€/an)</Label>
                <Input
                  id="emploiDomicileExpenses"
                  type="number"
                  {...register("emploiDomicileExpenses", { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="donsOrganismes">Dons organismes (€/an)</Label>
                <Input
                  id="donsOrganismes"
                  type="number"
                  {...register("donsOrganismes", { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="donsAidePersonnes">Dons aide aux personnes (€/an)</Label>
                <Input
                  id="donsAidePersonnes"
                  type="number"
                  {...register("donsAidePersonnes", { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Calculer mon impôt
              </Button>
            </form>
          </CardContent>
        </Card>

        {result ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Résultat de la simulation
                  <Badge variant="outline">Barème 2025</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quotient familial</p>
                    <p className="text-lg font-semibold">{formatCurrency(result.quotientFamilial)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TMI</p>
                    <p className="text-lg font-semibold">{result.tmi}%</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Impôt brut</span>
                    <span className="font-medium">{formatCurrency(result.impotBrut)}</span>
                  </div>
                  {result.decote > 0 && (
                    <div className="flex justify-between text-warm-teal">
                      <span>Décote</span>
                      <span>-{formatCurrency(result.decote)}</span>
                    </div>
                  )}
                  {result.creditsImpot.total > 0 && (
                    <>
                      <div className="text-xs text-muted-foreground mt-2">Crédits d&apos;impôt :</div>
                      {result.creditsImpot.gardeEnfant > 0 && (
                        <div className="flex justify-between text-sm text-warm-teal">
                          <span className="pl-4">Garde enfant</span>
                          <span>-{formatCurrency(result.creditsImpot.gardeEnfant)}</span>
                        </div>
                      )}
                      {result.creditsImpot.emploiDomicile > 0 && (
                        <div className="flex justify-between text-sm text-warm-teal">
                          <span className="pl-4">Emploi à domicile</span>
                          <span>-{formatCurrency(result.creditsImpot.emploiDomicile)}</span>
                        </div>
                      )}
                      {result.creditsImpot.dons > 0 && (
                        <div className="flex justify-between text-sm text-warm-teal">
                          <span className="pl-4">Dons organismes</span>
                          <span>-{formatCurrency(result.creditsImpot.dons)}</span>
                        </div>
                      )}
                      {result.creditsImpot.donsAide > 0 && (
                        <div className="flex justify-between text-sm text-warm-teal">
                          <span className="pl-4">Dons aide personnes</span>
                          <span>-{formatCurrency(result.creditsImpot.donsAide)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold">Impôt net</span>
                  <span className="text-2xl font-bold">{formatCurrency(result.impotNet)}</span>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taux effectif</span>
                  <span>{result.tauxEffectif}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-warm-orange/5 border-warm-orange/20">
              <CardContent className="pt-6 text-center space-y-3">
                <p className="font-medium">
                  Sauvegardez vos simulations et suivez votre fiscalité
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
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Remplissez le formulaire pour voir votre simulation</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
