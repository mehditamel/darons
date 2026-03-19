"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, ArrowRight, Check, X } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { simulateCaf, type CafSimulationResult } from "@/lib/simulators/caf-simulator";
import { SOCIAL_RIGHTS_THRESHOLDS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface FormValues {
  revenuAnnuel: number;
  revenuMensuelNet: number;
  situation: "couple" | "isolee";
  enfants: { age: number }[];
  modeGarde: "creche" | "assistante_maternelle" | "garde_domicile" | "aucun";
  coutGardeMensuel: number;
  locataire: boolean;
}

interface ExtraRight {
  label: string;
  montant: number;
  periodicite: string;
  eligible: boolean;
  raison?: string;
}

export default function MesDroitsPage() {
  const [cafResult, setCafResult] = useState<CafSimulationResult | null>(null);
  const [extraRights, setExtraRights] = useState<ExtraRight[]>([]);

  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      revenuAnnuel: 40000,
      revenuMensuelNet: 2500,
      situation: "couple",
      enfants: [{ age: 1 }],
      modeGarde: "aucun",
      coutGardeMensuel: 0,
      locataire: true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "enfants" });

  function onSubmit(data: FormValues) {
    const caf = simulateCaf({
      revenuNetCatAnnuel: data.revenuAnnuel,
      nbEnfantsACharge: data.enfants.length,
      ageEnfants: data.enfants.map((e) => e.age),
      situationFamiliale: data.situation,
      modeGarde: data.modeGarde,
      coutGardeMensuel: data.coutGardeMensuel,
    });
    setCafResult(caf);

    const extras: ExtraRight[] = [];

    // Prime d'activité
    const seuil = data.situation === "couple"
      ? SOCIAL_RIGHTS_THRESHOLDS.primeActivite.plafond_couple_1enfant
      : SOCIAL_RIGHTS_THRESHOLDS.primeActivite.plafond_solo_sans_enfant;

    if (data.revenuMensuelNet > 0 && data.revenuMensuelNet <= seuil) {
      const estimee = Math.max(0, SOCIAL_RIGHTS_THRESHOLDS.primeActivite.montant_forfaitaire - data.revenuMensuelNet * 0.38);
      extras.push({
        label: "Prime d'activité",
        montant: Math.round(estimee),
        periodicite: "mensuel",
        eligible: true,
      });
    } else {
      extras.push({
        label: "Prime d'activité",
        montant: 0,
        periodicite: "mensuel",
        eligible: false,
        raison: data.revenuMensuelNet <= 0 ? "Nécessite un revenu d'activité" : "Revenus supérieurs au plafond estimé",
      });
    }

    // RSA
    const seuilRsa = data.situation === "couple"
      ? SOCIAL_RIGHTS_THRESHOLDS.rsa.couple + data.enfants.length * SOCIAL_RIGHTS_THRESHOLDS.rsa.supplement_par_enfant
      : SOCIAL_RIGHTS_THRESHOLDS.rsa.personne_seule + data.enfants.length * SOCIAL_RIGHTS_THRESHOLDS.rsa.supplement_par_enfant;

    if (data.revenuMensuelNet < seuilRsa) {
      extras.push({
        label: "RSA (estimation)",
        montant: Math.round(seuilRsa - data.revenuMensuelNet),
        periodicite: "mensuel",
        eligible: true,
      });
    } else {
      extras.push({
        label: "RSA",
        montant: 0,
        periodicite: "mensuel",
        eligible: false,
        raison: "Revenus supérieurs au plafond RSA",
      });
    }

    setExtraRights(extras);
  }

  const totalMensuel = (cafResult?.totalMensuel ?? 0) + extraRights.filter((r) => r.eligible && r.periodicite === "mensuel").reduce((a, r) => a + r.montant, 0);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-green/10 text-warm-green flex items-center justify-center mx-auto">
          <Scale className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          À quoi t&apos;as droit ? Tout, en 2 minutes.
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Allocations familiales, PAJE, CMG, prime d&apos;activité, RSA...
          On calcule tout. Tu serais surpris de ce que tu rates.
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
                <Label htmlFor="revenuAnnuel">Revenus annuels nets du foyer (€)</Label>
                <Input id="revenuAnnuel" type="number" {...register("revenuAnnuel", { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="revenuMensuelNet">Revenu mensuel net d&apos;activité (€)</Label>
                <Input id="revenuMensuelNet" type="number" {...register("revenuMensuelNet", { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="situation">Situation familiale</Label>
                <select id="situation" {...register("situation")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="couple">Couple</option>
                  <option value="isolee">Parent isolé</option>
                </select>
              </div>
              <div>
                <Label>Enfants</Label>
                <div className="space-y-2 mt-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input type="number" {...register(`enfants.${index}.age`, { valueAsNumber: true })} placeholder="Âge" className="w-24" />
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
                <select id="modeGarde" {...register("modeGarde")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="aucun">Aucun / Non concerné</option>
                  <option value="creche">Crèche</option>
                  <option value="assistante_maternelle">Assistante maternelle</option>
                  <option value="garde_domicile">Garde à domicile</option>
                </select>
              </div>
              <div>
                <Label htmlFor="coutGardeMensuel">Coût mensuel de garde (€)</Label>
                <Input id="coutGardeMensuel" type="number" {...register("coutGardeMensuel", { valueAsNumber: true })} />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Calculer tous mes droits
              </Button>
            </form>
          </CardContent>
        </Card>

        {cafResult ? (
          <div className="space-y-4">
            <Card className="border-warm-green/30 bg-warm-green/5">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Total estimé des aides</p>
                <p className="text-4xl font-bold text-warm-green">{formatCurrency(totalMensuel)}</p>
                <p className="text-sm text-muted-foreground">par mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Tes droits détaillés
                  <Badge variant="outline">Barèmes 2025</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cafResult.details.map((detail, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      {detail.eligible ? <Check className="w-4 h-4 text-warm-green" /> : <X className="w-4 h-4 text-muted-foreground" />}
                      <div>
                        <p className={`text-sm ${detail.eligible ? "font-medium" : "text-muted-foreground"}`}>{detail.label}</p>
                        {!detail.eligible && detail.raison && <p className="text-xs text-muted-foreground">{detail.raison}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${detail.eligible ? "" : "text-muted-foreground"}`}>{formatCurrency(detail.montant)}</p>
                      <p className="text-xs text-muted-foreground">/{detail.periodicite === "mensuel" ? "mois" : detail.periodicite === "annuel" ? "an" : "unique"}</p>
                    </div>
                  </div>
                ))}

                {extraRights.map((right, i) => (
                  <div key={`extra-${i}`} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      {right.eligible ? <Check className="w-4 h-4 text-warm-green" /> : <X className="w-4 h-4 text-muted-foreground" />}
                      <div>
                        <p className={`text-sm ${right.eligible ? "font-medium" : "text-muted-foreground"}`}>{right.label}</p>
                        {!right.eligible && right.raison && <p className="text-xs text-muted-foreground">{right.raison}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${right.eligible ? "" : "text-muted-foreground"}`}>{formatCurrency(right.montant)}</p>
                      <p className="text-xs text-muted-foreground">/mois</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-warm-teal/5 border-warm-teal/20">
              <CardContent className="pt-6 text-center space-y-3">
                <p className="font-medium">Reçois des alertes quand tes droits changent</p>
                <Link href="/register">
                  <Button>Créer mon compte gratuit <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex items-center justify-center min-h-[300px]">
            <CardContent className="text-center text-muted-foreground">
              <Scale className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Remplis le formulaire pour découvrir tes droits</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
