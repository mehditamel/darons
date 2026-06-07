/**
 * CAF Simulator — Calcul des droits aux allocations familiales
 *
 * Millésime 2026 (revenus 2024) : montants et plafonds de ressources à jour —
 * allocation de base PAJE (taux plein/partiel), prime de naissance, allocations
 * familiales, ARS. Sources : service-public.gouv.fr F2552/F13213/A16342, caf.fr.
 *
 * NB — deux dispositifs suivent des réformes structurelles non modélisées ici :
 *  - CMG : réforme du 01/09/2025 (calcul continu). Le calcul réformé exact vit
 *    dans cmg-reform.ts / garde-cost.ts ; les tranches ci-dessous restent une
 *    estimation indicative (micro-crèche / fallback).
 *  - Majoration des allocations familiales : âge ouvrant droit porté de 14 à
 *    18 ans (01/03/2026) — non pris en compte dans AF_MONTANTS.
 */

export interface CafSimulationInput {
  revenuNetCatAnnuel: number;
  nbEnfantsACharge: number;
  ageEnfants: number[];
  situationFamiliale: "couple" | "isolee";
  modeGarde?: "creche" | "assistante_maternelle" | "garde_domicile" | "aucun";
  coutGardeMensuel?: number;
}

export interface CafSimulationResult {
  allocationsFamiliales: number;
  pajeAllocationBase: number;
  pajeNaissance: number;
  cmg: number;
  allocationRentree: number;
  totalMensuel: number;
  totalAnnuel: number;
  details: CafDetail[];
}

export interface CafDetail {
  label: string;
  montant: number;
  periodicite: "mensuel" | "annuel" | "unique";
  eligible: boolean;
  raison?: string;
}

// Plafonds de ressources PAJE 2026 (revenus 2024) — service-public.gouv.fr (F2552).
// Simplification assumée : couple = 2 revenus (mêmes seuils que parent isolé),
// l'input ne distinguant pas le nombre de revenus.
const PAJE_PLAFONDS = {
  // Seuil taux plein (au-dessous) et taux partiel (entre plein et partiel) selon
  // le nombre d'enfants ; au-delà de 3 enfants : +8 908 € par enfant.
  plein: { 1: 41055, 2: 47268, 3: 54724 } as Record<number, number>,
  partiel: { 1: 49054, 2: 56478, 3: 65386 } as Record<number, number>,
  supplementAuDela3: 8908,
};

// PAJE — allocation de base mensuelle 2026 (revalorisation 01/04/2026, BMAF 478,16).
const PAJE_ALLOCATION_BASE = { plein: 198.16, partiel: 99.08 };

function pajePlafond(nbEnfants: number, kind: "plein" | "partiel"): number {
  const table = PAJE_PLAFONDS[kind];
  const n = Math.max(1, nbEnfants);
  if (n <= 3) return table[n];
  return table[3] + (n - 3) * PAJE_PLAFONDS.supplementAuDela3;
}

// Allocations familiales 2026 — plafonds revenus (revenus 2024).
const AF_PLAFONDS = {
  tranche1: 79980,
  tranche2: 106604,
  supplement_par_enfant: 6664,
};

// Montants AF 2026 (base, modèle pré-réforme — majoration 18 ans non modélisée).
const AF_MONTANTS = {
  base: {
    deux_enfants: 152.25,
    par_enfant_sup: 195.07,
  },
  divise2: {
    deux_enfants: 76.13,
    par_enfant_sup: 97.53,
  },
  divise4: {
    deux_enfants: 38.07,
    par_enfant_sup: 48.77,
  },
};

// CMG — montants maximaux par tranche (modèle pré-réforme 01/09/2025, indicatif)
const CMG_PLAFONDS = {
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
};

export function simulateCaf(input: CafSimulationInput): CafSimulationResult {
  const details: CafDetail[] = [];

  // 1. Allocations familiales (à partir de 2 enfants)
  let af = 0;
  if (input.nbEnfantsACharge >= 2) {
    const plafond1 = AF_PLAFONDS.tranche1 + (input.nbEnfantsACharge - 2) * AF_PLAFONDS.supplement_par_enfant;
    const plafond2 = AF_PLAFONDS.tranche2 + (input.nbEnfantsACharge - 2) * AF_PLAFONDS.supplement_par_enfant;

    let montants = AF_MONTANTS.base;
    if (input.revenuNetCatAnnuel > plafond2) {
      montants = AF_MONTANTS.divise4;
    } else if (input.revenuNetCatAnnuel > plafond1) {
      montants = AF_MONTANTS.divise2;
    }

    af = montants.deux_enfants;
    if (input.nbEnfantsACharge > 2) {
      af += (input.nbEnfantsACharge - 2) * montants.par_enfant_sup;
    }

    details.push({
      label: "Allocations familiales",
      montant: af,
      periodicite: "mensuel",
      eligible: true,
    });
  } else {
    details.push({
      label: "Allocations familiales",
      montant: 0,
      periodicite: "mensuel",
      eligible: false,
      raison: "Nécessite au moins 2 enfants à charge",
    });
  }

  // 2. PAJE — Allocation de base (enfant < 3 ans)
  let pajeBase = 0;
  const hasChildUnder3 = input.ageEnfants.some((age) => age < 3);
  if (hasChildUnder3) {
    const plafondPlein = pajePlafond(input.nbEnfantsACharge, "plein");
    const plafondPartiel = pajePlafond(input.nbEnfantsACharge, "partiel");

    if (input.revenuNetCatAnnuel <= plafondPlein) {
      pajeBase = PAJE_ALLOCATION_BASE.plein; // taux plein (01/04/2026)
    } else if (input.revenuNetCatAnnuel <= plafondPartiel) {
      pajeBase = PAJE_ALLOCATION_BASE.partiel; // taux partiel
    }

    if (pajeBase > 0) {
      details.push({
        label: "PAJE — Allocation de base",
        montant: pajeBase,
        periodicite: "mensuel",
        eligible: true,
      });
    } else {
      details.push({
        label: "PAJE — Allocation de base",
        montant: 0,
        periodicite: "mensuel",
        eligible: false,
        raison: "Revenus supérieurs au plafond",
      });
    }
  } else {
    details.push({
      label: "PAJE — Allocation de base",
      montant: 0,
      periodicite: "mensuel",
      eligible: false,
      raison: "Aucun enfant de moins de 3 ans",
    });
  }

  // 3. PAJE — Prime naissance (unique, lors de la naissance)
  let pajeNaissance = 0;
  const hasNewborn = input.ageEnfants.some((age) => age < 1);
  if (hasNewborn) {
    // Prime de naissance : sous le plafond « taux partiel » de l'allocation de base.
    const plafondNaissance = pajePlafond(input.nbEnfantsACharge, "partiel");

    if (input.revenuNetCatAnnuel <= plafondNaissance) {
      pajeNaissance = 1084.43; // Prime de naissance PAJE (01/04/2026)
      details.push({
        label: "PAJE — Prime de naissance",
        montant: pajeNaissance,
        periodicite: "unique",
        eligible: true,
      });
    }
  }

  // 4. CMG (Complément mode de garde) — enfant < 6 ans
  let cmg = 0;
  const hasChildUnder6 = input.ageEnfants.some((age) => age < 6);
  if (hasChildUnder6 && input.modeGarde && input.modeGarde !== "aucun") {
    const baremes = CMG_PLAFONDS[input.modeGarde];
    if (baremes) {
      let tranche: { plafond: number; montant: number } | undefined;
      if (input.revenuNetCatAnnuel <= baremes.tranche1.plafond) {
        tranche = baremes.tranche1;
      } else if (input.revenuNetCatAnnuel <= baremes.tranche2.plafond) {
        tranche = baremes.tranche2;
      } else {
        tranche = baremes.tranche3;
      }

      cmg = Math.min(tranche.montant, input.coutGardeMensuel ?? tranche.montant);

      details.push({
        label: `CMG — ${modeGardeLabel(input.modeGarde)}`,
        montant: cmg,
        periodicite: "mensuel",
        eligible: true,
      });
    }
  } else if (!hasChildUnder6) {
    details.push({
      label: "CMG (Complément mode de garde)",
      montant: 0,
      periodicite: "mensuel",
      eligible: false,
      raison: "Aucun enfant de moins de 6 ans",
    });
  }

  // 5. Allocation de rentrée scolaire (enfants 6-18 ans) — plafond 2026
  let ars = 0;
  const arsPlafond = 22274 + input.nbEnfantsACharge * 6682;
  if (input.revenuNetCatAnnuel <= arsPlafond) {
    for (const age of input.ageEnfants) {
      // Allocation de rentrée scolaire — montants rentrée 2026
      if (age >= 6 && age <= 10) ars += 426.87;
      else if (age >= 11 && age <= 14) ars += 450.41;
      else if (age >= 15 && age <= 18) ars += 466.02;
    }
  }

  if (ars > 0) {
    details.push({
      label: "Allocation de rentrée scolaire",
      montant: ars,
      periodicite: "annuel",
      eligible: true,
    });
  } else if (input.ageEnfants.some((a) => a >= 6)) {
    details.push({
      label: "Allocation de rentrée scolaire",
      montant: 0,
      periodicite: "annuel",
      eligible: false,
      raison: input.revenuNetCatAnnuel > arsPlafond ? "Revenus supérieurs au plafond" : "Enfants hors tranche d'âge",
    });
  }

  const totalMensuel = af + pajeBase + cmg;
  const totalAnnuel = totalMensuel * 12 + pajeNaissance + ars;

  return {
    allocationsFamiliales: af,
    pajeAllocationBase: pajeBase,
    pajeNaissance,
    cmg,
    allocationRentree: ars,
    totalMensuel,
    totalAnnuel,
    details,
  };
}

function modeGardeLabel(mode: string): string {
  switch (mode) {
    case "creche": return "Crèche";
    case "assistante_maternelle": return "Assistante maternelle";
    case "garde_domicile": return "Garde à domicile";
    default: return mode;
  }
}
