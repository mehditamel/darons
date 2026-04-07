"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taxSimulationSchema, type TaxSimulationFormData } from "@/lib/validators/fiscal";
import { simulateIR } from "@/lib/simulators/ir-simulator";
import type { TaxSimulationResult } from "@/types/fiscal";

const PARTS_OPTIONS = [
  { value: "1", label: "1 — Célibataire" },
  { value: "1.5", label: "1,5 — Célibataire + 1 enfant" },
  { value: "2", label: "2 — Couple" },
  { value: "2.5", label: "2,5 — Couple + 1 enfant" },
  { value: "3", label: "3 — Couple + 2 enfants" },
  { value: "3.5", label: "3,5 — Couple + 3 enfants" },
  { value: "4", label: "4 — Couple + 4 enfants" },
];

interface SimulationFormProps {
  defaultNbParts?: number;
  defaultNumChildren?: number;
  defaultValues?: Partial<TaxSimulationFormData>;
  onResult: (result: TaxSimulationResult, input: TaxSimulationFormData) => void;
}

export function SimulationForm({
  defaultNbParts = 2.5,
  defaultNumChildren = 1,
  defaultValues,
  onResult,
}: SimulationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaxSimulationFormData>({
    resolver: zodResolver(taxSimulationSchema),
    defaultValues: {
      revenuNetImposable: defaultValues?.revenuNetImposable ?? 0,
      nbParts: defaultValues?.nbParts ?? defaultNbParts,
      numChildren: defaultValues?.numChildren ?? defaultNumChildren,
      gardeEnfantExpenses: defaultValues?.gardeEnfantExpenses ?? 0,
      emploiDomicileExpenses: defaultValues?.emploiDomicileExpenses ?? 0,
      donsOrganismes: defaultValues?.donsOrganismes ?? 0,
      donsAidePersonnes: defaultValues?.donsAidePersonnes ?? 0,
    },
  });

  const currentParts = watch("nbParts");

  const onSubmit = (data: TaxSimulationFormData) => {
    const result = simulateIR(data);
    onResult(result, data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulation impôt sur le revenu 2025
        </CardTitle>
        <CardDescription>
          Barème progressif 2025 (revenus 2024) avec quotient familial et décote
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="revenuNetImposable">Revenu net imposable (€)</Label>
              <Input
                id="revenuNetImposable"
                type="number"
                inputMode="numeric"
                min={0}
                step={100}
                placeholder="60 000"
                {...register("revenuNetImposable", { valueAsNumber: true })}
              />
              {errors.revenuNetImposable && (
                <p className="text-xs text-destructive" role="alert">{errors.revenuNetImposable.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Nombre de parts fiscales</Label>
              <Select
                value={String(currentParts)}
                onValueChange={(val) => setValue("nbParts", parseFloat(val), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Parts fiscales" />
                </SelectTrigger>
                <SelectContent>
                  {PARTS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nbParts && (
                <p className="text-xs text-destructive" role="alert">{errors.nbParts.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numChildren">Nombre d'enfants de moins de 6 ans</Label>
            <Input
              id="numChildren"
              type="number"
              inputMode="numeric"
              min={0}
              max={10}
              {...register("numChildren", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Crédits & réductions d'impôt
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gardeEnfantExpenses">Frais de garde enfant (€/an)</Label>
                <Input
                  id="gardeEnfantExpenses"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  placeholder="3 500"
                  {...register("gardeEnfantExpenses", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">50% remboursé, max 1 750 €</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emploiDomicileExpenses">Emploi à domicile (€/an)</Label>
                <Input
                  id="emploiDomicileExpenses"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  placeholder="12 000"
                  {...register("emploiDomicileExpenses", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">50% remboursé, plafond 12 000 € + 1 500 €/enfant</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="donsOrganismes">Dons aux organismes (€/an)</Label>
                <Input
                  id="donsOrganismes"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  placeholder="500"
                  {...register("donsOrganismes", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">66% déduit, plafond 20% du revenu</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="donsAidePersonnes">Dons aide aux personnes (€/an)</Label>
                <Input
                  id="donsAidePersonnes"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  placeholder="1 000"
                  {...register("donsAidePersonnes", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">75% déduit, plafond 1 000 €</p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            <Calculator className="mr-2 h-4 w-4" />
            Calculer mon impôt
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
