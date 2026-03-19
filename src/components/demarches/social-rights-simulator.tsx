"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, CheckCircle2, XCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  simulateCaf,
  type CafSimulationResult,
} from "@/lib/simulators/caf-simulator";

const socialRightsSchema = z.object({
  revenuAnnuel: z
    .number({ required_error: "Le revenu annuel est requis" })
    .min(0, "Le revenu ne peut pas être négatif"),
  situationFamiliale: z.enum(["couple", "isolee"]),
  nbEnfants: z.number().int().min(1).max(10).default(1),
  ageEnfant1: z.number().int().min(0).max(25).default(1),
  ageEnfant2: z.number().int().min(0).max(25).optional(),
  ageEnfant3: z.number().int().min(0).max(25).optional(),
  modeGarde: z
    .enum(["creche", "assistante_maternelle", "garde_domicile", "aucun"])
    .default("aucun"),
  coutGardeMensuel: z.number().min(0).default(0),
});

type SocialRightsFormData = z.infer<typeof socialRightsSchema>;

export function SocialRightsSimulator() {
  const [result, setResult] = useState<CafSimulationResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SocialRightsFormData>({
    resolver: zodResolver(socialRightsSchema),
    defaultValues: {
      revenuAnnuel: 0,
      situationFamiliale: "couple",
      nbEnfants: 1,
      ageEnfant1: 1,
      modeGarde: "aucun",
      coutGardeMensuel: 0,
    },
  });

  const nbEnfants = watch("nbEnfants");
  const currentSituation = watch("situationFamiliale");
  const currentModeGarde = watch("modeGarde");

  const onSubmit = (data: SocialRightsFormData) => {
    const ageEnfants: number[] = [data.ageEnfant1];
    if (data.nbEnfants >= 2 && data.ageEnfant2 !== undefined)
      ageEnfants.push(data.ageEnfant2);
    if (data.nbEnfants >= 3 && data.ageEnfant3 !== undefined)
      ageEnfants.push(data.ageEnfant3);

    const simResult = simulateCaf({
      revenuNetCatAnnuel: data.revenuAnnuel,
      nbEnfantsACharge: data.nbEnfants,
      ageEnfants,
      situationFamiliale: data.situationFamiliale,
      modeGarde:
        data.modeGarde === "aucun" ? undefined : data.modeGarde,
      coutGardeMensuel:
        data.coutGardeMensuel > 0 ? data.coutGardeMensuel : undefined,
    });

    setResult(simResult);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulateur de droits sociaux
          </CardTitle>
          <CardDescription>
            Estimez vos droits aux allocations CAF : PAJE, allocations
            familiales, CMG, allocation de rentrée scolaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="revenuAnnuel">
                  Revenu net catégoriel annuel (€)
                </Label>
                <Input
                  id="revenuAnnuel"
                  type="number"
                  min={0}
                  step={1000}
                  placeholder="45 000"
                  {...register("revenuAnnuel", { valueAsNumber: true })}
                />
                {errors.revenuAnnuel && (
                  <p className="text-xs text-destructive">
                    {errors.revenuAnnuel.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Situation familiale</Label>
                <Select
                  value={currentSituation}
                  onValueChange={(val) =>
                    setValue(
                      "situationFamiliale",
                      val as "couple" | "isolee",
                      { shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="couple">Couple</SelectItem>
                    <SelectItem value="isolee">Parent isolé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nbEnfants">
                  Nombre d&apos;enfants à charge
                </Label>
                <Input
                  id="nbEnfants"
                  type="number"
                  min={1}
                  max={10}
                  {...register("nbEnfants", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageEnfant1">
                  Âge enfant 1 (années)
                </Label>
                <Input
                  id="ageEnfant1"
                  type="number"
                  min={0}
                  max={25}
                  {...register("ageEnfant1", { valueAsNumber: true })}
                />
              </div>

              {nbEnfants >= 2 && (
                <div className="space-y-2">
                  <Label htmlFor="ageEnfant2">
                    Âge enfant 2 (années)
                  </Label>
                  <Input
                    id="ageEnfant2"
                    type="number"
                    min={0}
                    max={25}
                    {...register("ageEnfant2", { valueAsNumber: true })}
                  />
                </div>
              )}

              {nbEnfants >= 3 && (
                <div className="space-y-2">
                  <Label htmlFor="ageEnfant3">
                    Âge enfant 3 (années)
                  </Label>
                  <Input
                    id="ageEnfant3"
                    type="number"
                    min={0}
                    max={25}
                    {...register("ageEnfant3", { valueAsNumber: true })}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Mode de garde</Label>
                <Select
                  value={currentModeGarde}
                  onValueChange={(val) =>
                    setValue(
                      "modeGarde",
                      val as SocialRightsFormData["modeGarde"],
                      { shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aucun">Aucun / Non concerné</SelectItem>
                    <SelectItem value="creche">Crèche</SelectItem>
                    <SelectItem value="assistante_maternelle">
                      Assistante maternelle
                    </SelectItem>
                    <SelectItem value="garde_domicile">
                      Garde à domicile
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentModeGarde !== "aucun" && (
                <div className="space-y-2">
                  <Label htmlFor="coutGardeMensuel">
                    Coût garde mensuel (€)
                  </Label>
                  <Input
                    id="coutGardeMensuel"
                    type="number"
                    min={0}
                    step={10}
                    placeholder="800"
                    {...register("coutGardeMensuel", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              <Calculator className="mr-2 h-4 w-4" />
              Simuler mes droits
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Résultat de la simulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.details.map((detail, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {detail.eligible ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-300" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{detail.label}</p>
                      {!detail.eligible && detail.raison && (
                        <p className="text-xs text-muted-foreground">
                          {detail.raison}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        detail.eligible && detail.montant > 0
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {detail.montant.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      €
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {detail.periodicite === "mensuel"
                        ? "/mois"
                        : detail.periodicite === "annuel"
                          ? "/an"
                          : "unique"}
                    </p>
                  </div>
                </div>
              ))}

              <div className="mt-4 rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Total mensuel</p>
                    <p className="text-xs text-muted-foreground">
                      Hors primes uniques et allocations annuelles
                    </p>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {result.totalMensuel.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €/mois
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Total annuel estimé
                  </p>
                  <Badge variant="outline">
                    {result.totalAnnuel.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €/an
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
