"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CONGE_PARENTAL_RATES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface FormValues {
  salaireBrutMensuel: number;
  nbEnfants: number;
  tempsPartiel: "plein" | "mi_temps" | "80";
}

interface CongeResult {
  prepare: number;
  perteSalaire: number;
  revenuPendantConge: number;
  dureeMaxMois: number;
  comparaisons: { label: string; prepare: number; salaire: number; total: number }[];
}

export default function CongeParentalPage() {
  const [result, setResult] = useState<CongeResult | null>(null);

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      salaireBrutMensuel: 2500,
      nbEnfants: 1,
      tempsPartiel: "plein",
    },
  });

  function onSubmit(data: FormValues) {
    const salaireNet = data.salaireBrutMensuel * 0.78;

    const prepareMap = {
      plein: CONGE_PARENTAL_RATES.taux_plein,
      mi_temps: CONGE_PARENTAL_RATES.mi_temps,
      "80": CONGE_PARENTAL_RATES.temps_partiel_80,
    };

    const salaireMap = {
      plein: 0,
      mi_temps: salaireNet * 0.5,
      "80": salaireNet * 0.8,
    };

    const prepare = prepareMap[data.tempsPartiel];
    const salaireMaintenu = salaireMap[data.tempsPartiel];
    const dureeMax = data.nbEnfants >= 2
      ? CONGE_PARENTAL_RATES.duree_2plus_enfant_mois
      : CONGE_PARENTAL_RATES.duree_1er_enfant_mois;

    const comparaisons = [
      {
        label: "Congé total (0%)",
        prepare: CONGE_PARENTAL_RATES.taux_plein,
        salaire: 0,
        total: CONGE_PARENTAL_RATES.taux_plein,
      },
      {
        label: "Mi-temps (50%)",
        prepare: CONGE_PARENTAL_RATES.mi_temps,
        salaire: salaireNet * 0.5,
        total: CONGE_PARENTAL_RATES.mi_temps + salaireNet * 0.5,
      },
      {
        label: "Temps partiel (80%)",
        prepare: CONGE_PARENTAL_RATES.temps_partiel_80,
        salaire: salaireNet * 0.8,
        total: CONGE_PARENTAL_RATES.temps_partiel_80 + salaireNet * 0.8,
      },
      {
        label: "Pas de congé (100%)",
        prepare: 0,
        salaire: salaireNet,
        total: salaireNet,
      },
    ];

    setResult({
      prepare,
      perteSalaire: salaireNet - salaireMaintenu,
      revenuPendantConge: prepare + salaireMaintenu,
      dureeMaxMois: dureeMax,
      comparaisons,
    });
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-blue/10 text-warm-blue flex items-center justify-center mx-auto">
          <Home className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Congé parental : combien tu touches ?
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          PreParE taux plein, mi-temps ou 80%. On te calcule tout :
          ce que tu perds, ce que tu gagnes, et la durée max.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ta situation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="salaireBrutMensuel">Salaire brut mensuel (€)</Label>
                <Input id="salaireBrutMensuel" type="number" {...register("salaireBrutMensuel", { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="nbEnfants">Nombre d&apos;enfants (nés ou à naître)</Label>
                <Input id="nbEnfants" type="number" min={1} max={10} {...register("nbEnfants", { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="tempsPartiel">Type de congé</Label>
                <select id="tempsPartiel" {...register("tempsPartiel")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="plein">Congé total (arrêt complet)</option>
                  <option value="mi_temps">Mi-temps (50%)</option>
                  <option value="80">Temps partiel (80%)</option>
                </select>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Calculer mes revenus
              </Button>
            </form>
          </CardContent>
        </Card>

        {result ? (
          <div className="space-y-4">
            <Card className="border-warm-blue/30 bg-warm-blue/5">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Tes revenus pendant le congé</p>
                <p className="text-4xl font-bold text-warm-blue">{formatCurrency(result.revenuPendantConge)}</p>
                <p className="text-sm text-muted-foreground">/mois (PreParE + salaire maintenu)</p>
                <Badge variant="outline" className="mt-2">
                  Durée max : {result.dureeMaxMois} mois
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparaison des options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.comparaisons.map((opt) => (
                  <div key={opt.label} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">
                        PreParE {formatCurrency(opt.prepare)} + Salaire {formatCurrency(opt.salaire)}
                      </p>
                    </div>
                    <p className="font-bold">{formatCurrency(opt.total)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-warm-teal/5 border-warm-teal/20">
              <CardContent className="pt-6 text-center space-y-3">
                <p className="font-medium">
                  Calcule aussi tes allocations CAF pour compléter
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/outils/mes-droits">
                    <Button variant="outline">Mes droits sociaux</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Créer mon compte gratuit <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex items-center justify-center min-h-[300px]">
            <CardContent className="text-center text-muted-foreground">
              <Home className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Remplis le formulaire pour voir tes revenus pendant le congé</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
