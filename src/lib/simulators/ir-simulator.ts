import {
  FISCAL_PARAMS_BY_YEAR,
  CURRENT_TAX_YEAR,
  TAX_CREDITS,
  type FiscalYear,
} from "@/lib/constants";
import type { TaxSimulationInput, TaxSimulationResult } from "@/types/fiscal";

type TaxBracket = { readonly min: number; readonly max: number; readonly rate: number };

/**
 * Compute raw tax (before decote and credits) for a given revenu and number of parts.
 * Extracted to allow computing tax with different part counts for QF capping.
 */
function computeRawTax(
  revenuNetImposable: number,
  nbParts: number,
  brackets: readonly TaxBracket[]
): number {
  const quotientFamilial = revenuNetImposable / nbParts;
  let taxPerPart = 0;
  for (const bracket of brackets) {
    if (quotientFamilial <= bracket.min) break;
    const taxableInBracket =
      Math.min(quotientFamilial, bracket.max) - bracket.min;
    taxPerPart += taxableInBracket * bracket.rate;
  }
  return Math.round(taxPerPart * nbParts);
}

export function simulateIR(
  input: TaxSimulationInput,
  taxYear: FiscalYear = CURRENT_TAX_YEAR
): TaxSimulationResult {
  const params = FISCAL_PARAMS_BY_YEAR[taxYear];
  const brackets = params.brackets;
  const revenuNetImposable = Math.max(0, input.revenuNetImposable);
  const nbParts = Math.max(1, input.nbParts);

  // Early return for zero income
  if (revenuNetImposable <= 0) {
    return {
      revenuNetImposable: 0,
      nbParts,
      quotientFamilial: 0,
      impotBrut: 0,
      decote: 0,
      plafonnementQF: 0,
      creditsImpot: {
        gardeEnfant: 0,
        emploiDomicile: 0,
        dons: 0,
        donsAide: 0,
        total: 0,
      },
      impotNet: 0,
      tmi: 0,
      tauxEffectif: 0,
      revenueParPart: 0,
    };
  }

  // Quotient familial
  const quotientFamilial = revenuNetImposable / nbParts;

  // Gross tax with actual parts
  let impotBrut = computeRawTax(revenuNetImposable, nbParts, brackets);

  // Plafonnement du quotient familial
  // Base parts: 2 for couple, 1 for single
  const baseParts = nbParts > 1 ? 2 : 1;
  let plafonnementQF = 0;

  if (nbParts > baseParts) {
    const taxWithBaseParts = computeRawTax(
      revenuNetImposable,
      baseParts,
      brackets
    );
    const benefit = taxWithBaseParts - impotBrut;
    const extraHalfParts = (nbParts - baseParts) / 0.5;
    const maxBenefit = params.qfCapPerHalfPart * extraHalfParts;

    if (benefit > maxBenefit) {
      plafonnementQF = Math.round(benefit - maxBenefit);
      impotBrut = taxWithBaseParts - Math.round(maxBenefit);
    }
  }

  // Decote (for low incomes)
  let decote = 0;
  const { decote: decoteParams } = params;
  const decoteThreshold =
    nbParts > 1 ? decoteParams.thresholdCouple : decoteParams.thresholdSingle;
  if (impotBrut < decoteThreshold) {
    const decoteBase =
      nbParts > 1 ? decoteParams.baseCouple : decoteParams.baseSingle;
    decote = Math.max(0, decoteBase - impotBrut * decoteParams.rate);
    decote = Math.round(Math.min(decote, impotBrut));
  }

  impotBrut = Math.max(0, impotBrut - decote);

  // Tax credits
  const gardeEnfant = Math.min(
    input.gardeEnfantExpenses * TAX_CREDITS.gardeEnfant.rate,
    TAX_CREDITS.gardeEnfant.maxCredit
  );

  const emploiDomicileMaxExpenses =
    TAX_CREDITS.emploiDomicile.maxExpenses +
    (input.numChildren || 0) * TAX_CREDITS.emploiDomicile.extraPerChild;
  const emploiDomicile = Math.min(
    input.emploiDomicileExpenses * TAX_CREDITS.emploiDomicile.rate,
    emploiDomicileMaxExpenses * TAX_CREDITS.emploiDomicile.rate
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
  for (const bracket of brackets) {
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
    plafonnementQF,
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
