import { IR_BRACKETS_2025, TAX_CREDITS } from "@/lib/constants";
import type { TaxSimulationInput, TaxSimulationResult } from "@/types/fiscal";

export function simulateIR(input: TaxSimulationInput): TaxSimulationResult {
  const { revenuNetImposable, nbParts } = input;

  // Quotient familial
  const quotientFamilial = revenuNetImposable / nbParts;

  // Calculate tax per part using progressive brackets
  let taxPerPart = 0;
  for (const bracket of IR_BRACKETS_2025) {
    if (quotientFamilial <= bracket.min) break;
    const taxableInBracket =
      Math.min(quotientFamilial, bracket.max) - bracket.min;
    taxPerPart += taxableInBracket * bracket.rate;
  }

  // Gross tax = tax per part * number of parts
  let impotBrut = Math.round(taxPerPart * nbParts);

  // Decote (for low incomes)
  let decote = 0;
  const decoteThreshold = nbParts > 1 ? 2845 : 1929;
  if (impotBrut < decoteThreshold) {
    const decoteBase = nbParts > 1 ? 1870 : 1269;
    decote = Math.max(0, decoteBase - impotBrut * 0.4525);
    decote = Math.round(Math.min(decote, impotBrut));
  }

  impotBrut = Math.max(0, impotBrut - decote);

  // Tax credits
  const gardeEnfant = Math.min(
    input.gardeEnfantExpenses * TAX_CREDITS.gardeEnfant.rate,
    TAX_CREDITS.gardeEnfant.maxCredit
  );

  const emploiDomicile = Math.min(
    input.emploiDomicileExpenses * TAX_CREDITS.emploiDomicile.rate,
    TAX_CREDITS.emploiDomicile.maxExpenses * TAX_CREDITS.emploiDomicile.rate
  );

  const maxDons =
    revenuNetImposable * TAX_CREDITS.donsOrganismes.maxRateOfIncome;
  const dons = Math.min(
    input.donsOrganismes * TAX_CREDITS.donsOrganismes.rate,
    maxDons * TAX_CREDITS.donsOrganismes.rate
  );

  const donsAide = Math.min(
    input.donsAidePersonnes * TAX_CREDITS.donsAidePersonnes.rate,
    TAX_CREDITS.donsAidePersonnes.maxAmount *
      TAX_CREDITS.donsAidePersonnes.rate
  );

  const totalCredits = Math.round(
    gardeEnfant + emploiDomicile + dons + donsAide
  );
  const impotNet = Math.max(0, impotBrut - totalCredits);

  // TMI (Tranche Marginale d'Imposition)
  let tmi = 0;
  for (const bracket of IR_BRACKETS_2025) {
    if (quotientFamilial > bracket.min) {
      tmi = bracket.rate * 100;
    }
  }

  // Effective rate
  const tauxEffectif =
    revenuNetImposable > 0
      ? Math.round((impotNet / revenuNetImposable) * 10000) / 100
      : 0;

  return {
    revenuNetImposable,
    nbParts,
    quotientFamilial: Math.round(quotientFamilial),
    impotBrut,
    decote,
    creditsImpot: {
      gardeEnfant: Math.round(gardeEnfant),
      emploiDomicile: Math.round(emploiDomicile),
      dons: Math.round(dons),
      donsAide: Math.round(donsAide),
      total: totalCredits,
    },
    impotNet,
    tmi,
    tauxEffectif,
    revenueParPart: Math.round(quotientFamilial),
  };
}
