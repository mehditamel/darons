/**
 * CMG « rémunération » réformé — réforme du 01/09/2025.
 * Décret n° 2025-515 du 30/05/2025, art. D. 531-18 du code de la sécurité sociale.
 *
 * Le CMG emploi direct (assistante maternelle, garde à domicile) est désormais
 * calculé heure par heure, sur le modèle des crèches (PSU) :
 *
 *   CMG = coûtMensuelRetenu × (1 − (revenuMensuel × tauxEffort / coûtHoraireRéférence))
 *
 * borné entre 0 et le coût mensuel retenu, où :
 *  - coûtMensuelRetenu = heures × min(coûtHoraireRéel, plafondHoraire)
 *    (l'écrêtement au plafond horaire reste à la charge de la famille) ;
 *  - revenuMensuel est borné entre un plancher et un plafond ;
 *  - le parent isolé bénéficie du taux d'effort immédiatement inférieur.
 *
 * Sources : Légifrance JORFTEXT000051714530, service-public.gouv.fr (A18360),
 * caf.fr. Ne couvre pas le CMG « structure » (micro-crèche), calculé autrement.
 */

export type CmgEmploiMode = "assistante_maternelle" | "garde_domicile";

export const CMG_REFORM = {
  // Ressources mensuelles encadrées (mêmes bornes que les EAJE), 2025.
  resourceFloor: 815,
  resourceCeiling: 8500,
  // Prise en charge des cotisations sociales (inchangée par la réforme) :
  // assistante maternelle 100 %, garde à domicile 50 % plafonné selon l'âge.
  contribCapUnder3: 496, // plafond mensuel garde à domicile, enfant < 3 ans
  contribCap3to6: 249, // plafond mensuel garde à domicile, enfant 3-6 ans
  assistante_maternelle: {
    hourlyCap: 8, // plafond horaire retenu (€)
    refHourlyCost: 4.85, // coût horaire de référence (€)
    // Taux d'effort horaire selon le nombre d'enfants à charge (1, 2, 3, 4-7, 8+).
    effortRates: { 1: 0.000619, 2: 0.000516, 3: 0.000413, 4: 0.00031, 8: 0.000206 },
  },
  garde_domicile: {
    hourlyCap: 15,
    refHourlyCost: 10.38,
    effortRates: { 1: 0.001238, 2: 0.001032, 3: 0.000826, 4: 0.00062, 8: 0.000412 },
  },
} as const;

export interface CmgReformInput {
  mode: CmgEmploiMode;
  monthlyHours: number; // heures de garde déclarées dans le mois
  hourlyCost: number; // coût horaire réel (salaire + cotisations + indemnités)
  monthlyResources: number; // revenu net catégoriel mensualisé
  childCount: number; // enfants à charge
  singleParent?: boolean;
}

export interface CmgReformResult {
  cmg: number; // CMG rémunération mensuel
  retainedHourlyCost: number; // coût horaire après écrêtement au plafond
  retainedMonthlyCost: number;
  participationRate: number; // part à la charge de la famille (0..1)
  capExcess: number; // reste à charge mensuel dû à l'écrêtement horaire
}

function effortRate(mode: CmgEmploiMode, childCount: number): number {
  const rates = CMG_REFORM[mode].effortRates;
  if (childCount <= 1) return rates[1];
  if (childCount === 2) return rates[2];
  if (childCount === 3) return rates[3];
  if (childCount <= 7) return rates[4];
  return rates[8];
}

export function simulateCmgReform(input: CmgReformInput): CmgReformResult {
  const params = CMG_REFORM[input.mode];
  const monthlyHours = Math.max(0, input.monthlyHours);
  const hourlyCost = Math.max(0, input.hourlyCost);

  const retainedHourlyCost = Math.min(hourlyCost, params.hourlyCap);
  const retainedMonthlyCost = retainedHourlyCost * monthlyHours;

  const boundedResources = Math.min(
    Math.max(input.monthlyResources, CMG_REFORM.resourceFloor),
    CMG_REFORM.resourceCeiling
  );

  // Parent isolé : taux d'effort immédiatement inférieur ≈ palier d'un enfant de plus.
  const effectiveChildCount =
    Math.max(1, input.childCount) + (input.singleParent ? 1 : 0);
  const taux = effortRate(input.mode, effectiveChildCount);

  const participationRate = (boundedResources * taux) / params.refHourlyCost;
  const rawCmg = retainedMonthlyCost * (1 - participationRate);
  const cmg = Math.max(0, Math.min(rawCmg, retainedMonthlyCost));

  const capExcess = Math.max(0, (hourlyCost - retainedHourlyCost) * monthlyHours);

  return {
    cmg: Math.round(cmg * 100) / 100,
    retainedHourlyCost,
    retainedMonthlyCost: Math.round(retainedMonthlyCost * 100) / 100,
    participationRate: Math.min(1, Math.max(0, participationRate)),
    capExcess: Math.round(capExcess * 100) / 100,
  };
}

/**
 * Prise en charge des cotisations sociales par le CMG (composante distincte du
 * CMG rémunération, inchangée par la réforme) :
 *  - assistante maternelle : 100 % ;
 *  - garde à domicile : 50 %, plafonné à 496 €/mois (< 3 ans) ou 249 € (3-6 ans).
 */
export function cmgCotisations(input: {
  mode: CmgEmploiMode;
  childUnder3: boolean;
  monthlyContributions: number;
}): number {
  const contributions = Math.max(0, input.monthlyContributions);
  if (input.mode === "assistante_maternelle") {
    return Math.round(contributions * 100) / 100; // 100 % pris en charge
  }
  const cap = input.childUnder3
    ? CMG_REFORM.contribCapUnder3
    : CMG_REFORM.contribCap3to6;
  return Math.round(Math.min(contributions * 0.5, cap) * 100) / 100;
}
