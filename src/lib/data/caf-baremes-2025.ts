/**
 * Barèmes CAF 2025 — données de référence pour les simulateurs
 * Source : data.caf.fr + caf.fr/allocataires
 * Mise à jour : annuelle (janvier)
 */

export const CAF_BAREMES_2025 = {
  // PAJE - Prestation d'accueil du jeune enfant
  paje: {
    primeNaissance: 1019.40,
    primeAdoption: 2038.80,
    allocationBase: {
      tauxPlein: 184.81,
      tauxPartiel: 92.41,
    },
    // Plafonds de ressources (revenus N-2) pour PAJE allocation de base
    plafonds: {
      coupleUnRevenu1Enfant: 37319,
      coupleUnRevenu2Enfants: 44767,
      coupleUnRevenu3Enfants: 52215,
      coupleDeuxRevenus1Enfant: 48994,
      coupleDeuxRevenus2Enfants: 56442,
      coupleDeuxRevenus3Enfants: 63890,
      parEnfantSupplementaire: 7448,
    },
  },

  // CMG - Complément de libre choix du mode de garde
  cmg: {
    // Montants mensuels max selon tranche de revenus et âge enfant
    assistanteMaternelle: {
      moinsde3ans: {
        tranche1: { maxMensuel: 530.72, plafondRevenus: 22104 },
        tranche2: { maxMensuel: 444.73, plafondRevenus: 49143 },
        tranche3: { maxMensuel: 355.78, plafondRevenus: Infinity },
      },
      de3a6ans: {
        tranche1: { maxMensuel: 265.36, plafondRevenus: 22104 },
        tranche2: { maxMensuel: 222.37, plafondRevenus: 49143 },
        tranche3: { maxMensuel: 177.89, plafondRevenus: Infinity },
      },
    },
    gardeDomicile: {
      moinsde3ans: {
        tranche1: { maxMensuel: 920.26, plafondRevenus: 22104 },
        tranche2: { maxMensuel: 788.76, plafondRevenus: 49143 },
        tranche3: { maxMensuel: 657.27, plafondRevenus: Infinity },
      },
      de3a6ans: {
        tranche1: { maxMensuel: 460.13, plafondRevenus: 22104 },
        tranche2: { maxMensuel: 394.38, plafondRevenus: 49143 },
        tranche3: { maxMensuel: 328.64, plafondRevenus: Infinity },
      },
    },
    // Majoration enfant handicapé
    majorationHandicap: 30, // +30%
  },

  // Allocations familiales
  allocationsFamiliales: {
    // À partir de 2 enfants
    montant2Enfants: {
      plafond1: { revenus: 74966, montant: 141.99 },
      plafond2: { revenus: 99922, montant: 71.00 },
      plafondSuperieur: { montant: 35.50 },
    },
    majorationParEnfant: {
      plafond1: { montant: 179.02 },
      plafond2: { montant: 89.51 },
      plafondSuperieur: { montant: 44.76 },
    },
    majorationAge14ans: {
      plafond1: { montant: 71.00 },
      plafond2: { montant: 35.50 },
      plafondSuperieur: { montant: 17.75 },
    },
  },

  // Allocation de rentrée scolaire
  ars: {
    montant6_10ans: 416.40,
    montant11_14ans: 439.38,
    montant15_18ans: 454.60,
    plafondRevenus1Enfant: 27141,
    majorationParEnfant: 6285,
  },

  // APL - Aide personnalisée au logement (simplification)
  apl: {
    zoneGeographique: {
      zone1: "Île-de-France",
      zone2: "Grandes villes",
      zone3: "Reste de la France",
    },
  },

  // Prime d'activité
  primeActivite: {
    montantForfaitaire: 622.63,
    bonification: 181.19,
    seuilRevenus: 1,
  },

  // BMAF (Base mensuelle allocations familiales) — référence 2025
  bmaf: 449.04,
} as const;

export type CafBaremes = typeof CAF_BAREMES_2025;
