"use client";

import { useState } from "react";
import { Calculator, Gift, CalendarDays } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimulationForm } from "./simulation-form";
import { SimulationResults } from "./simulation-results";
import { TaxCreditsDetail } from "./tax-credits-detail";
import { FiscalComparator } from "./fiscal-comparator";
import { FiscalSchedule } from "./fiscal-schedule";
import type { TaxSimulationResult, TaxSimulationInput } from "@/types/fiscal";
import type { FiscalYear } from "@/types/fiscal";
import type { TaxSimulationFormData } from "@/lib/validators/fiscal";
import { trackEvent } from "@/lib/analytics";

interface FiscalTabsProps {
  defaultNbParts: number;
  defaultNumChildren: number;
  savedFiscalYears: FiscalYear[];
}

export function FiscalTabs({
  defaultNbParts,
  defaultNumChildren,
  savedFiscalYears,
}: FiscalTabsProps) {
  const [simulationResult, setSimulationResult] = useState<TaxSimulationResult | null>(null);
  const [simulationInput, setSimulationInput] = useState<TaxSimulationInput | null>(null);

  const savedYear = savedFiscalYears.find((fy) => fy.year === 2025);

  const defaultFormValues: Partial<TaxSimulationFormData> | undefined = savedYear
    ? {
        revenuNetImposable: savedYear.revenuNetImposable ?? 0,
        nbParts: savedYear.nbParts,
        numChildren: defaultNumChildren,
        gardeEnfantExpenses: savedYear.creditsImpot.gardeEnfant
          ? (savedYear.creditsImpot.gardeEnfant / 0.5)
          : 0,
        emploiDomicileExpenses: savedYear.creditsImpot.emploiDomicile
          ? (savedYear.creditsImpot.emploiDomicile / 0.5)
          : 0,
        donsOrganismes: savedYear.creditsImpot.dons
          ? (savedYear.creditsImpot.dons / 0.66)
          : 0,
        donsAidePersonnes: savedYear.creditsImpot.donsAide
          ? (savedYear.creditsImpot.donsAide / 0.75)
          : 0,
      }
    : undefined;

  const handleResult = (result: TaxSimulationResult, input: TaxSimulationFormData) => {
    setSimulationResult(result);
    trackEvent("fiscal_simulation_run");
    setSimulationInput(input);
  };

  return (
    <Tabs defaultValue="simulation" className="space-y-4">
      <TabsList>
        <TabsTrigger value="simulation" className="gap-1.5">
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline">Simulation IR</span>
          <span className="sm:hidden">IR</span>
        </TabsTrigger>
        <TabsTrigger value="credits" className="gap-1.5">
          <Gift className="h-4 w-4" />
          <span className="hidden sm:inline">Crédits d'impôt</span>
          <span className="sm:hidden">Crédits</span>
        </TabsTrigger>
        <TabsTrigger value="echeancier" className="gap-1.5">
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Échéancier</span>
          <span className="sm:hidden">Dates</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="simulation" className="space-y-6">
        <SimulationForm
          defaultNbParts={defaultNbParts}
          defaultNumChildren={defaultNumChildren}
          defaultValues={defaultFormValues}
          onResult={handleResult}
        />

        {simulationResult && simulationInput && (
          <>
            <SimulationResults result={simulationResult} input={simulationInput} />
            <FiscalComparator baseResult={simulationResult} baseInput={simulationInput} />
          </>
        )}
      </TabsContent>

      <TabsContent value="credits">
        <TaxCreditsDetail result={simulationResult} />
      </TabsContent>

      <TabsContent value="echeancier">
        <FiscalSchedule />
      </TabsContent>
    </Tabs>
  );
}
