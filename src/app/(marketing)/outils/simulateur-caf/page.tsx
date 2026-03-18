"use client";

import { useState } from "react";
import Link from "next/link";
import { Baby, ArrowRight, Check, X } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { simulateCaf, type CafSimulationResult } from "@/lib/simulators/caf-simulator";
import { formatCurrency } from "@/lib/utils";

interface FormValues {
  revenuNetCatAnnuel: number;
  situationFamiliale: "couple" | "isolee";
  enfants: { age: number }[];
  modeGarde: "creche" | "assistante_maternelle" | "garde_domicile" | "aucun";
  coutGardeMensuel: number;
}

export default function SimulateurCafPage() {
  const [result, setResult] = useState<CafSimulationResult | null>(null);

  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      revenuNetCatAnnuel: 0,
      situationFamiliale: "couple",
      enfants: [{ age: 1 }],
      modeGarde: "aucun",
      coutGardeMensuel: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "enfants" });

  function onSubmit(data: FormValues) {
    const simulation = simulateCaf({
      revenuNetCatAnnuel: data.revenuNetCatAnnuel,
      nbEnfantsACharge: data.enfants.length,
      ageEnfants: data.enfants.map((e) => e.age),
      situationFamiliale: data.situationFamiliale,
      modeGarde: data.modeGarde,
      coutGardeMensuel: data.coutGardeMensuel,
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
          Simulateur allocations CAF 2025
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Estimez vos droits : allocations familiales, PAJE, CMG, allocation de
          rentrée scolaire. Barèmes 2025 officiels.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Votre situation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="revenuNetCatAnnuel">Revenu net catégoriel annuel (€)</Label>
                <Input
                  id="revenuNetCatAnnuel"
                  type="number"
                  {...register("revenuNetCatAnnuel", { valueAsNumber: true })}
                  placeholder="40000"
                />
              </div>

              <div>
                <Label htmlFor="situationFamiliale">Situation familiale</Label>
                <select
                  id="situationFamiliale"
                  {...register("situationFamiliale")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="couple">Couple</option>
                  <option value="isolee">Parent isolé</option>
                </select>
              </div>

              <div>
                <Label>Enfants à charge</Label>
                <div className="space-y-2 mt-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        type="number"
                        {...register(`enfants.${index}.age`, { valueAsNumber: true })}
                        placeholder="Âge"
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">ans</span>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ age: 0 })}>
                    + Ajouter un enfant
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="modeGarde">Mode de garde</Label>
                <select
                  id="modeGarde"
                  {...register("modeGarde")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="aucun">Aucun / Non concerné</option>
                  <option value="creche">Crèche</option>
                  <option value="assistante_maternelle">Assistante maternelle</option>
                  <option value="garde_domicile">Garde à domicile</option>
                </select>
              </div>

              <div>
                <Label htmlFor="coutGardeMensuel">Coût mensuel de garde (€)</Label>
                <Input
                  id="coutGardeMensuel"
                  type="number"
                  {...register("coutGardeMensuel", { valueAsNumber: true })}
                  placeholder="800"
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Calculer mes droits
              </Button>
            </form>
          </CardContent>
        </Card>

        {result ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Vos allocations estimées
                  <Badge variant="outline">Barèmes 2025</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.details.map((detail, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {detail.eligible ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className={`text-sm ${detail.eligible ? "font-medium" : "text-muted-foreground"}`}>
                          {detail.label}
                        </p>
                        {!detail.eligible && detail.raison && (
                          <p className="text-xs text-muted-foreground">{detail.raison}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${detail.eligible ? "" : "text-muted-foreground"}`}>
                        {formatCurrency(detail.montant)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /{detail.periodicite === "mensuel" ? "mois" : detail.periodicite === "annuel" ? "an" : "unique"}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total mensuel</span>
                    <span className="text-2xl font-bold text-warm-teal">
                      {formatCurrency(result.totalMensuel)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total annuel estimé</span>
                    <span>{formatCurrency(result.totalAnnuel)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-warm-teal/5 border-warm-teal/20">
              <CardContent className="pt-6 text-center space-y-3">
                <p className="font-medium">
                  Suivez vos allocations et gérez votre budget famille
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
              <p>Remplissez le formulaire pour estimer vos droits</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
