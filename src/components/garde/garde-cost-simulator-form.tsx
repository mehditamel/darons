"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, TrendingDown, ArrowRight } from "lucide-react";
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
import {
  gardeCostSimulationSchema,
  type GardeCostSimulationFormData,
} from "@/lib/validators/garde";
import { simulateGardeCost } from "@/lib/simulators/garde-cost";
import type { GardeCostSimulationResult } from "@/types/garde";
import { MODE_GARDE_OPTIONS } from "@/types/garde";

export function GardeCostSimulatorForm() {
  const [result, setResult] = useState<GardeCostSimulationResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GardeCostSimulationFormData>({
    resolver: zodResolver(gardeCostSimulationSchema),
    defaultValues: {
      modeGarde: "creche",
      coutMensuelBrut: 0,
      revenuAnnuel: 0,
      nbEnfantsGardes: 1,
      parentIsole: false,
    },
  });

  const currentMode = watch("modeGarde");
  const isEmploiDirect =
    currentMode === "assistante_maternelle" || currentMode === "garde_domicile";

  const onSubmit = (data: GardeCostSimulationFormData) => {
    // Emploi direct : le coût mensuel brut découle des heures × coût horaire.
    const coutMensuelBrut =
      isEmploiDirect && data.heuresMensuelles && data.coutHoraireReel
        ? data.heuresMensuelles * data.coutHoraireReel
        : data.coutMensuelBrut;
    const simResult = simulateGardeCost({ ...data, coutMensuelBrut });
    setResult(simResult);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulateur de coût de garde
          </CardTitle>
          <CardDescription>
            Estimez votre reste à charge après CMG et crédit
            d'impôt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Mode de garde</Label>
                <Select
                  value={currentMode}
                  onValueChange={(val) =>
                    setValue(
                      "modeGarde",
                      val as GardeCostSimulationFormData["modeGarde"],
                      { shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODE_GARDE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!isEmploiDirect && (
                <div className="space-y-2">
                  <Label htmlFor="coutMensuelBrut">
                    Coût mensuel brut (€)
                  </Label>
                  <Input
                    id="coutMensuelBrut"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={10}
                    placeholder="800"
                    {...register("coutMensuelBrut", { valueAsNumber: true })}
                  />
                  {errors.coutMensuelBrut && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.coutMensuelBrut.message}
                    </p>
                  )}
                </div>
              )}

              {isEmploiDirect && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="heuresMensuelles">Heures de garde / mois</Label>
                    <Input
                      id="heuresMensuelles"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="120"
                      {...register("heuresMensuelles", {
                        setValueAs: (v) =>
                          v === "" || v == null ? undefined : Number(v),
                      })}
                    />
                    {errors.heuresMensuelles && (
                      <p className="text-xs text-destructive" role="alert">
                        {errors.heuresMensuelles.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coutHoraireReel">Coût horaire (€)</Label>
                    <Input
                      id="coutHoraireReel"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.1}
                      placeholder="6"
                      {...register("coutHoraireReel", {
                        setValueAs: (v) =>
                          v === "" || v == null ? undefined : Number(v),
                      })}
                    />
                    {errors.coutHoraireReel && (
                      <p className="text-xs text-destructive" role="alert">
                        {errors.coutHoraireReel.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="revenuAnnuel">
                  Revenu annuel du foyer (€)
                </Label>
                <Input
                  id="revenuAnnuel"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  placeholder="45 000"
                  {...register("revenuAnnuel", { valueAsNumber: true })}
                />
                {errors.revenuAnnuel && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.revenuAnnuel.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nbEnfantsGardes">
                  Nombre d'enfants gardés
                </Label>
                <Input
                  id="nbEnfantsGardes"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  {...register("nbEnfantsGardes", { valueAsNumber: true })}
                />
              </div>
            </div>

            {isEmploiDirect && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    {...register("parentIsole")}
                  />
                  Je suis parent isolé
                </label>
                <p className="text-xs text-muted-foreground">
                  Calcul précis du CMG selon la réforme du 1ᵉʳ septembre 2025
                  (heure par heure). Plafond horaire retenu :{" "}
                  {currentMode === "assistante_maternelle" ? "8 €" : "15 €"}.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full sm:w-auto">
              <Calculator className="mr-2 h-4 w-4" />
              Calculer le reste à charge
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5 text-green-600" />
              Résultat de la simulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.details.map((detail, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{detail.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {detail.description}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      detail.montant < 0
                        ? "text-green-600"
                        : i === result.details.length - 1
                          ? "text-lg"
                          : ""
                    }`}
                  >
                    {detail.montant < 0 ? "" : ""}
                    {detail.montant.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €/mois
                  </p>
                </div>
              ))}

              <div className="rounded-lg bg-white p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Économie totale
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl text-muted-foreground line-through">
                    {result.coutBrut.toLocaleString("fr-FR")} €
                  </span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold text-green-600">
                    {result.resteACharge.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €/mois
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Soit{" "}
                  {(result.resteACharge * 12).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €/an au lieu de{" "}
                  {(result.coutBrut * 12).toLocaleString("fr-FR")} €/an
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
