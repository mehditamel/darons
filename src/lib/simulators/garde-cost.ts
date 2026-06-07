/**
 * Garde Cost Simulator — Calcul du reste à charge après aides.
 * CMG : formule réformée (01/09/2025) pour l'emploi direct si heures + coût
 * horaire fournis (voir cmg-reform.ts), sinon estimation par tranches.
 * + crédit d'impôt garde enfant.
 */

import type {
  GardeCostSimulationInput,
  GardeCostSimulationResult,
  GardeCostDetail,
} from "@/types/garde";
import { simulateCmgReform } from "@/lib/simulators/cmg-reform";

// CMG 2025 — plafonds et montants mensuels (enfant < 6 ans)
const CMG_BAREMES = {
  creche: {
    tranche1: { plafond: 22191, montant: 925.38 },
    tranche2: { plafond: 49340, montant: 793.16 },
    tranche3: { plafond: Infinity, montant: 660.93 },
  },
  assistante_maternelle: {
    tranche1: { plafond: 22191, montant: 530.72 },
    tranche2: { plafond: 49340, montant: 449.30 },
    tranche3: { plafond: Infinity, montant: 367.88 },
  },
  garde_domicile: {
    tranche1: { plafond: 22191, montant: 927.46 },
    tranche2: { plafond: 49340, montant: 795.24 },
    tranche3: { plafond: Infinity, montant: 663.01 },
  },
} as const;

// Crédit d'impôt garde enfant < 6 ans
const CREDIT_IMPOT_GARDE = {
  rate: 0.50,
  maxExpensesAnnuel: 3500,
  maxCreditAnnuel: 1750,
};

function getModeGardeLabel(mode: GardeCostSimulationInput["modeGarde"]): string {
  switch (mode) {
    case "creche": return "Crèche / Micro-crèche";
    case "assistante_maternelle": return "Assistante maternelle";
    case "garde_domicile": return "Garde à domicile";
  }
}

function calculateCmg(input: GardeCostSimulationInput): number {
  const { modeGarde, revenuAnnuel, coutMensuelBrut } = input;

  // Calcul précis (réforme 2025) si l'emploi direct + heures + coût horaire.
  if (
    (modeGarde === "assistante_maternelle" || modeGarde === "garde_domicile") &&
    input.heuresMensuelles &&
    input.coutHoraireReel
  ) {
    const { cmg } = simulateCmgReform({
      mode: modeGarde,
      monthlyHours: input.heuresMensuelles,
      hourlyCost: input.coutHoraireReel,
      monthlyResources: revenuAnnuel / 12,
      childCount: input.nbEnfantsGardes,
      singleParent: input.parentIsole,
    });
    return Math.min(cmg, coutMensuelBrut);
  }

  // Fallback : estimation par tranches (modèle pré-réforme / micro-crèche).
  const baremes = CMG_BAREMES[modeGarde];

  let tranche: { plafond: number; montant: number };
  if (revenuAnnuel <= baremes.tranche1.plafond) {
    tranche = baremes.tranche1;
  } else if (revenuAnnuel <= baremes.tranche2.plafond) {
    tranche = baremes.tranche2;
  } else {
    tranche = baremes.tranche3;
  }

  // CMG cannot exceed actual cost
  return Math.min(tranche.montant, coutMensuelBrut);
}

export function simulateGardeCost(
  input: GardeCostSimulationInput
): GardeCostSimulationResult {
  const details: GardeCostDetail[] = [];

  // 1. Coût brut
  details.push({
    label: `Coût mensuel ${getModeGardeLabel(input.modeGarde)}`,
    montant: input.coutMensuelBrut,
    description: "Coût brut avant déduction des aides",
  });

  // 2. CMG
  const cmg = calculateCmg(input);
  details.push({
    label: "CMG (Complément mode de garde)",
    montant: -cmg,
    description: `Aide CAF selon vos revenus (${input.revenuAnnuel.toLocaleString("fr-FR")} €/an)`,
  });

  // 3. Crédit d'impôt (calculé au prorata mensuel)
  const coutApresAides = input.coutMensuelBrut - cmg;
  const depensesAnnuellesEligibles = Math.min(
    coutApresAides * 12,
    CREDIT_IMPOT_GARDE.maxExpensesAnnuel * input.nbEnfantsGardes
  );
  const creditImpotAnnuel = Math.min(
    depensesAnnuellesEligibles * CREDIT_IMPOT_GARDE.rate,
    CREDIT_IMPOT_GARDE.maxCreditAnnuel * input.nbEnfantsGardes
  );
  const creditImpotMensuel = Math.round((creditImpotAnnuel / 12) * 100) / 100;

  details.push({
    label: "Crédit d'impôt garde enfant",
    montant: -creditImpotMensuel,
    description: `50% des dépenses restantes, max ${(CREDIT_IMPOT_GARDE.maxCreditAnnuel * input.nbEnfantsGardes).toLocaleString("fr-FR")} €/an`,
  });

  // 4. Reste à charge
  const resteACharge = Math.max(0, input.coutMensuelBrut - cmg - creditImpotMensuel);
  details.push({
    label: "Reste à charge mensuel",
    montant: resteACharge,
    description: "Coût réel après déduction de toutes les aides",
  });

  return {
    coutBrut: input.coutMensuelBrut,
    cmg,
    creditImpotMensuel,
    resteACharge: Math.round(resteACharge * 100) / 100,
    details,
  };
}
