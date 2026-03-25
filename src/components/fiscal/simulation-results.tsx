"use client";

import { useState } from "react";
import {
  Calculator,
  TrendingDown,
  Percent,
  DivideSquare,
  Save,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/utils";
import { saveFiscalYear } from "@/lib/actions/fiscal";
import type { TaxSimulationResult, TaxSimulationInput } from "@/types/fiscal";

interface SimulationResultsProps {
  result: TaxSimulationResult;
  input: TaxSimulationInput;
}

export function SimulationResults({ result, input }: SimulationResultsProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    const res = await saveFiscalYear({
      year: 2025,
      nbParts: result.nbParts,
      revenuNetImposable: result.revenuNetImposable,
      impotBrut: result.impotBrut,
      creditsImpot: result.creditsImpot,
      impotNet: result.impotNet,
      tmi: result.tmi,
      tauxEffectif: result.tauxEffectif,
    });

    setSaving(false);
    if (res.success) {
      setSaved(true);
    } else {
      setSaveError(res.error ?? "Erreur lors de la sauvegarde");
    }
  };

  const tmiColor = result.tmi <= 11
    ? "bg-warm-green/10 text-warm-green"
    : result.tmi <= 30
      ? "bg-warm-orange/10 text-warm-orange"
      : "bg-warm-red/10 text-warm-red";

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Impôt net"
          value={formatCurrency(result.impotNet)}
          icon={<Calculator className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-gold/10 text-warm-gold"
          gradientClass="card-gradient-gold"
        />
        <StatCard
          label="TMI"
          value={`${result.tmi}%`}
          icon={<TrendingDown className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-orange/10 text-warm-orange"
          gradientClass="card-gradient-orange"
        />
        <StatCard
          label="Taux effectif"
          value={`${result.tauxEffectif}%`}
          icon={<Percent className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Quotient familial"
          value={formatCurrency(result.quotientFamilial)}
          icon={<DivideSquare className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-teal/10 text-warm-teal"
          gradientClass="card-gradient-teal"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Décomposition du calcul</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetail(!showDetail)}
            >
              {showDetail ? (
                <ChevronUp className="mr-1 h-4 w-4" />
              ) : (
                <ChevronDown className="mr-1 h-4 w-4" />
              )}
              {showDetail ? "Masquer" : "Détail"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <FlowRow label="Revenu net imposable" value={formatCurrency(result.revenuNetImposable)} />
            <FlowRow label={`÷ ${result.nbParts} parts`} value={formatCurrency(result.quotientFamilial)} muted />
            <FlowRow label="Impôt brut (avant décote)" value={formatCurrency(result.impotBrut + result.decote)} />
            {result.decote > 0 && (
              <FlowRow label="Décote (bas revenus)" value={`- ${formatCurrency(result.decote)}`} positive />
            )}
            <FlowRow label="Impôt après décote" value={formatCurrency(result.impotBrut)} />
            {result.creditsImpot.total > 0 && (
              <FlowRow
                label="Crédits d'impôt"
                value={`- ${formatCurrency(result.creditsImpot.total)}`}
                positive
              />
            )}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Impôt net à payer</span>
                <span className="font-bold text-xl text-gradient animate-count-up">
                  {formatCurrency(result.impotNet)}
                </span>
              </div>
            </div>
          </div>

          {showDetail && result.creditsImpot.total > 0 && (
            <div className="rounded-xl bg-warm-green/5 border border-warm-green/10 p-4 space-y-2 animate-fade-in-up">
              <p className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-warm-green" />
                Détail des crédits d'impôt
              </p>
              {result.creditsImpot.gardeEnfant > 0 && (
                <FlowRow
                  label="Garde d'enfant"
                  value={formatCurrency(result.creditsImpot.gardeEnfant)}
                  muted
                />
              )}
              {result.creditsImpot.emploiDomicile > 0 && (
                <FlowRow
                  label="Emploi à domicile"
                  value={formatCurrency(result.creditsImpot.emploiDomicile)}
                  muted
                />
              )}
              {result.creditsImpot.dons > 0 && (
                <FlowRow
                  label="Dons organismes"
                  value={formatCurrency(result.creditsImpot.dons)}
                  muted
                />
              )}
              {result.creditsImpot.donsAide > 0 && (
                <FlowRow
                  label="Dons aide personnes"
                  value={formatCurrency(result.creditsImpot.donsAide)}
                  muted
                />
              )}
            </div>
          )}

          {showDetail && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Tranche marginale :</span>
              <Badge className={tmiColor}>{result.tmi}%</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || saved} variant={saved ? "outline" : "default"}>
          {saved ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-warm-green" />
              Sauvegardé
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Sauvegarde..." : "Sauvegarder cette simulation"}
            </>
          )}
        </Button>
        {saveError && <p className="text-sm text-destructive" role="alert">{saveError}</p>}
      </div>
    </div>
  );
}

function FlowRow({
  label,
  value,
  bold,
  muted,
  positive,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-muted-foreground" : bold ? "font-semibold" : ""}>
        {label}
      </span>
      <span
        className={
          positive
            ? "text-warm-green font-medium"
            : bold
              ? "font-bold text-lg"
              : muted
                ? "text-muted-foreground"
                : "font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}
