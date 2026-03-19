"use client";

import { useState } from "react";
import Link from "next/link";
import { Baby, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { simulateGardeCost } from "@/lib/simulators/garde-cost";
import type { GardeCostSimulationResult } from "@/types/garde";
import { formatCurrency } from "@/lib/utils";

type ModeGarde = "creche" | "assistante_maternelle" | "garde_domicile";

interface FormValues {
  modeGarde: ModeGarde;
  coutMensuelBrut: number;
  revenuAnnuel: number;
  nbEnfantsGardes: number;
}

export default function SimulateurGardePage() {
  const [result, setResult] = useState<GardeCostSimulationResult | null>(null);

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      modeGarde: "assistante_maternelle",
      coutMensuelBrut: 800,
      revenuAnnuel: 40000,
      nbEnfantsGardes: 1,
    },
  });

  function onSubmit(data: FormValues) {
    const simulation = simulateGardeCost({
      modeGarde: data.modeGarde,
      coutMensuelBrut: data.coutMensuelBrut,
      revenuAnnuel: data.revenuAnnuel,
      nbEnfantsGardes: data.nbEnfantsGardes,
    });
    setResult(simulation);
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-teal/10 text-warm-teal flex items-center justify-center mx-auto">
          <Baby className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Crèche ou nounou ? Le vrai prix.
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Calcule ton reste à charge réel après CMG et crédit d&apos;impôt.
          Tu vas voir, c&apos;est souvent moins cher que tu crois.
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
                <Label htmlFor="modeGarde">Mode de garde</Label>
                <select
                  id="modeGarde"
                  {...register("modeGarde")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="creche">Crèche / Micro-crèche</option>
                  <option value="assistante_maternelle">Assistante maternelle</option>
                  <option value="garde_domicile">Garde à domicile</option>
                </select>
              </div>

              <div>
                <Label htmlFor="coutMensuelBrut">Coût mensuel brut (€)</Label>
                <Input
                  id="coutMensuelBrut"
                  type="number"
                  {...register("coutMensuelBrut", { valueAsNumber: true })}
                  placeholder="800"
                />
              </div>

              <div>
                <Label htmlFor="revenuAnnuel">Revenus annuels du foyer (€)</Label>
                <Input
                  id="revenuAnnuel"
                  type="number"
                  {...register("revenuAnnuel", { valueAsNumber: true })}
                  placeholder="40000"
                />
              </div>

              <div>
                <Label htmlFor="nbEnfantsGardes">Nombre d&apos;enfants gardés</Label>
                <Input
                  id="nbEnfantsGardes"
                  type="number"
                  min={1}
                  max={5}
                  {...register("nbEnfantsGardes", { valueAsNumber: true })}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Calculer mon reste à charge
              </Button>
            </form>
          </CardContent>
        </Card>

        {result ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Ton vrai coût
                  <Badge variant="outline">Barèmes 2025</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.details.map((detail, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{detail.label}</p>
                      <p className="text-xs text-muted-foreground">{detail.description}</p>
                    </div>
                    <p className={`font-semibold ${detail.montant < 0 ? "text-warm-green" : ""}`}>
                      {detail.montant < 0 ? "- " : ""}
                      {formatCurrency(Math.abs(detail.montant))}
                    </p>
                  </div>
                ))}

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold">Reste à charge / mois</span>
                  <span className="text-2xl font-bold text-warm-orange">
                    {formatCurrency(result.resteACharge)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  soit {formatCurrency(result.resteACharge * 12)} / an
                </p>
              </CardContent>
            </Card>

            <Card className="bg-warm-teal/5 border-warm-teal/20">
              <CardContent className="pt-6 text-center space-y-3">
                <p className="font-medium">
                  Sauvegarde ces calculs et reçois des alertes quand tes droits changent
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
              <Baby className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Remplis le formulaire pour voir ton vrai coût de garde</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
