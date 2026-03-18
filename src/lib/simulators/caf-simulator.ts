/**
 * CAF Simulator — Calcul des droits aux allocations familiales
 * Barèmes 2025
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

// Plafonds de ressources PAJE 2025 (revenus 2023)
const PAJE_PLAFONDS = {
  couple: {
    base: { un_revenu: 35872, deux_revenus: 47348 },
    majore: { un_revenu: 27165, deux_revenus: 35987 },
  },
  isolee: {
    base: { un_revenu: 47348 },
    majore: { un_revenu: 35987 },
  },
  supplement_par_enfant: 5765,
};

// Allocations familiales 2025 — plafonds revenus
const AF_PLAFONDS = {
  tranche1: 74966,
  tranche2: 99922,
  supplement_par_enfant: 5946,
};

// Montants AF 2025
const AF_MONTANTS = {
  base: {
    deux_enfants: 148.52,
    par_enfant_sup: 190.88,
  },
  divise2: {
    deux_enfants: 74.26,
    par_enfant_sup: 95.44,
  },
  divise4: {
    deux_enfants: 37.13,
    par_enfant_sup: 47.72,
  },
};

// CMG 2025 — plafonds et montants (enfant < 6 ans)
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
    const plafondSup = PAJE_PLAFONDS.couple.base.un_revenu +
      (input.nbEnfantsACharge - 1) * PAJE_PLAFONDS.supplement_par_enfant;

    if (input.revenuNetCatAnnuel <= plafondSup) {
      pajeBase = 184.81;
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
    const plafondNaissance = PAJE_PLAFONDS.couple.base.un_revenu +
      (input.nbEnfantsACharge - 1) * PAJE_PLAFONDS.supplement_par_enfant;

    if (input.revenuNetCatAnnuel <= plafondNaissance) {
      pajeNaissance = 1019.40;
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

  // 5. Allocation de rentrée scolaire (enfants 6-18 ans)
  let ars = 0;
  const arsPlafond = 26231 + input.nbEnfantsACharge * 6135;
  if (input.revenuNetCatAnnuel <= arsPlafond) {
    for (const age of input.ageEnfants) {
      if (age >= 6 && age <= 10) ars += 416.40;
      else if (age >= 11 && age <= 14) ars += 439.38;
      else if (age >= 15 && age <= 18) ars += 454.60;
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
