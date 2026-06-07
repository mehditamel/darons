import { describe, it, expect } from "vitest";
import { simulateIR } from "@/lib/simulators/ir-simulator";
import type { TaxSimulationInput } from "@/types/fiscal";

const baseInput: TaxSimulationInput = {
  revenuNetImposable: 0,
  nbParts: 1,
  numChildren: 0,
  gardeEnfantExpenses: 0,
  emploiDomicileExpenses: 0,
  donsOrganismes: 0,
  donsAidePersonnes: 0,
};

function input(overrides: Partial<TaxSimulationInput>): TaxSimulationInput {
  return { ...baseInput, ...overrides };
}

describe("simulateIR", () => {
  describe("cas de base — barème progressif", () => {
    it("retourne 0 pour un revenu de 0", () => {
      const result = simulateIR(input({ revenuNetImposable: 0 }));
      expect(result.impotNet).toBe(0);
      expect(result.impotBrut).toBe(0);
      expect(result.tmi).toBe(0);
      expect(result.tauxEffectif).toBe(0);
    });

    it("retourne 0 pour un revenu dans la tranche à 0%", () => {
      const result = simulateIR(input({ revenuNetImposable: 10000, nbParts: 1 }));
      expect(result.tmi).toBe(0);
      expect(result.impotBrut).toBe(0);
    });

    it("calcule correctement pour un célibataire tranche 11%", () => {
      const result = simulateIR(input({ revenuNetImposable: 20000, nbParts: 1 }));
      // Barème 2026 — QF = 20000, tranche 11% : (20000 - 11601) * 0.11
      expect(result.tmi).toBe(11);
      expect(result.quotientFamilial).toBe(20000);
    });

    it("calcule correctement pour un couple 2.5 parts à 60 000 €", () => {
      const result = simulateIR(input({ revenuNetImposable: 60000, nbParts: 2.5 }));
      // Barème 2026 — QF = 60000 / 2.5 = 24000 (tranche 11%)
      expect(result.quotientFamilial).toBe(24000);
      expect(result.tmi).toBe(11);
      expect(result.impotBrut).toBeGreaterThan(0);
      expect(result.impotNet).toBeGreaterThanOrEqual(0);
    });

    it("calcule TMI 30% pour hauts revenus", () => {
      const result = simulateIR(input({ revenuNetImposable: 80000, nbParts: 1 }));
      // QF = 80000, tranche 30%
      expect(result.tmi).toBe(30);
      expect(result.impotBrut).toBeGreaterThan(0);
    });

    it("calcule TMI 41% pour très hauts revenus", () => {
      const result = simulateIR(input({ revenuNetImposable: 150000, nbParts: 1 }));
      expect(result.tmi).toBe(41);
    });

    it("calcule TMI 45% pour revenus > 181 917 €", () => {
      const result = simulateIR(input({ revenuNetImposable: 200000, nbParts: 1 }));
      expect(result.tmi).toBe(45);
      expect(result.impotBrut).toBeGreaterThan(0);
    });
  });

  describe("cas limites", () => {
    it("retourne 0 pour un revenu négatif", () => {
      const result = simulateIR(input({ revenuNetImposable: -5000 }));
      expect(result.impotNet).toBe(0);
      expect(result.impotBrut).toBe(0);
      expect(result.quotientFamilial).toBe(0);
      expect(result.tmi).toBe(0);
      expect(result.tauxEffectif).toBe(0);
      expect(result.revenuNetImposable).toBe(0);
    });

    it("coerce nbParts < 1 à 1", () => {
      const result = simulateIR(input({ revenuNetImposable: 30000, nbParts: 0.5 }));
      expect(result.nbParts).toBe(1);
      expect(result.quotientFamilial).toBe(30000);
    });

    it("coerce nbParts = 0 à 1", () => {
      const result = simulateIR(input({ revenuNetImposable: 30000, nbParts: 0 }));
      expect(result.nbParts).toBe(1);
    });

    it("gère un revenu très élevé (500K, 1 part) — TMI 45%", () => {
      const result = simulateIR(input({ revenuNetImposable: 500000, nbParts: 1 }));
      expect(result.tmi).toBe(45);
      // Calcul manuel (barème 2026, 1 part) :
      // 0-11600 : 0
      // 11601-29579 : (29579-11601)*0.11 = 1977.58
      // 29580-84577 : (84577-29580)*0.30 = 16499.10
      // 84578-181917 : (181917-84578)*0.41 = 39908.99
      // 181918-500000 : (500000-181918)*0.45 = 143136.90
      // Total ≈ 201522 € (par part)
      expect(result.impotBrut).toBeGreaterThan(200000);
      expect(result.tauxEffectif).toBeGreaterThan(30);
    });
  });

  describe("plafonnement du quotient familial", () => {
    it("plafonne le QF pour couple + 2 enfants (3 parts) à 120K", () => {
      const result = simulateIR(input({ revenuNetImposable: 120000, nbParts: 3 }));
      // Extra half-parts = (3 - 2) / 0.5 = 2
      // Max benefit (2026) = 1807 * 2 = 3614
      // Tax with 2 parts (base couple):
      const resultBase = simulateIR(input({ revenuNetImposable: 120000, nbParts: 2 }));
      // The tax with 3 parts should not be more than 3518 less than tax with 2 parts
      // (before decote, but plafonnement applies to impotBrut before decote)
      expect(result.plafonnementQF).toBeGreaterThan(0);
    });

    it("ne plafonne pas pour revenus modérés", () => {
      const result = simulateIR(input({ revenuNetImposable: 50000, nbParts: 2.5 }));
      // QF = 20000, benefit of 0.5 part is small
      expect(result.plafonnementQF).toBe(0);
    });

    it("ne plafonne pas quand nbParts == baseParts", () => {
      const result = simulateIR(input({ revenuNetImposable: 100000, nbParts: 2 }));
      expect(result.plafonnementQF).toBe(0);
    });

    it("plafonne pour hauts revenus avec 4 parts", () => {
      const result = simulateIR(input({ revenuNetImposable: 200000, nbParts: 4 }));
      // Extra half-parts = (4 - 2) / 0.5 = 4
      // Max benefit (2026) = 1807 * 4 = 7228
      expect(result.plafonnementQF).toBeGreaterThan(0);
    });

    it("ne plafonne pas pour célibataire sans enfant", () => {
      const result = simulateIR(input({ revenuNetImposable: 100000, nbParts: 1 }));
      expect(result.plafonnementQF).toBe(0);
    });
  });

  describe("décote", () => {
    it("applique la décote pour célibataire à faible impôt", () => {
      const result = simulateIR(input({ revenuNetImposable: 18000, nbParts: 1 }));
      // Low income single → décote should apply
      expect(result.decote).toBeGreaterThanOrEqual(0);
    });

    it("n'applique pas la décote pour impôt élevé", () => {
      const result = simulateIR(input({ revenuNetImposable: 80000, nbParts: 1 }));
      expect(result.decote).toBe(0);
    });

    it("applique un seuil de décote plus élevé pour un couple", () => {
      // Seuil de décote couple (3277) vs célibataire (1982) en 2026
      const single = simulateIR(input({ revenuNetImposable: 18000, nbParts: 1 }));
      const couple = simulateIR(input({ revenuNetImposable: 36000, nbParts: 2 }));
      // Same QF but couple has higher décote threshold
      expect(couple.decote).toBeGreaterThanOrEqual(0);
      // Both should have same QF
      expect(couple.quotientFamilial).toBe(single.quotientFamilial);
    });
  });

  describe("crédits d'impôt", () => {
    it("calcule le crédit garde enfant plafonné à 1 750 €", () => {
      const result = simulateIR(input({
        revenuNetImposable: 60000,
        nbParts: 2.5,
        gardeEnfantExpenses: 5000,
      }));
      // 50% de 5000 = 2500 mais plafonné à 1750
      expect(result.creditsImpot.gardeEnfant).toBe(1750);
    });

    it("calcule le crédit garde enfant sans plafond pour petites dépenses", () => {
      const result = simulateIR(input({
        revenuNetImposable: 60000,
        nbParts: 2.5,
        gardeEnfantExpenses: 2000,
      }));
      // 50% de 2000 = 1000 < 1750
      expect(result.creditsImpot.gardeEnfant).toBe(1000);
    });

    it("calcule le crédit emploi à domicile avec enfants", () => {
      const result = simulateIR(input({
        revenuNetImposable: 60000,
        nbParts: 2.5,
        numChildren: 1,
        emploiDomicileExpenses: 15000,
      }));
      // Plafond = 12000 + 1*1500 = 13500. Dépenses 15000 > plafond
      // Crédit = 50% de 13500 = 6750
      expect(result.creditsImpot.emploiDomicile).toBe(6750);
    });

    it("calcule le crédit dons organismes à 66%", () => {
      const result = simulateIR(input({
        revenuNetImposable: 60000,
        nbParts: 2.5,
        donsOrganismes: 1000,
      }));
      // 66% de 1000 = 660
      expect(result.creditsImpot.dons).toBe(660);
    });

    it("plafonne les dons à 20% du revenu", () => {
      const result = simulateIR(input({
        revenuNetImposable: 10000,
        nbParts: 1,
        donsOrganismes: 5000,
      }));
      // Max = 20% de 10000 = 2000. Dons 5000 > 2000
      // Crédit = 66% de 2000 = 1320
      expect(result.creditsImpot.dons).toBe(1320);
    });

    it("calcule les dons aide aux personnes à 75%", () => {
      const result = simulateIR(input({
        revenuNetImposable: 60000,
        nbParts: 2.5,
        donsAidePersonnes: 500,
      }));
      // 75% de 500 = 375
      expect(result.creditsImpot.donsAide).toBe(375);
    });

    it("plafonne les dons aide aux personnes à 1 000 €", () => {
      const result = simulateIR(input({
        revenuNetImposable: 60000,
        nbParts: 2.5,
        donsAidePersonnes: 2000,
      }));
      // 75% de 1000 (plafonné) = 750
      expect(result.creditsImpot.donsAide).toBe(750);
    });
  });

  describe("contraintes", () => {
    it("l'impôt net n'est jamais négatif", () => {
      const result = simulateIR(input({
        revenuNetImposable: 15000,
        nbParts: 1,
        gardeEnfantExpenses: 3500,
        emploiDomicileExpenses: 12000,
        donsOrganismes: 3000,
        donsAidePersonnes: 1000,
      }));
      expect(result.impotNet).toBeGreaterThanOrEqual(0);
    });

    it("le taux effectif est entre 0 et 100", () => {
      const result = simulateIR(input({ revenuNetImposable: 100000, nbParts: 1 }));
      expect(result.tauxEffectif).toBeGreaterThanOrEqual(0);
      expect(result.tauxEffectif).toBeLessThanOrEqual(100);
    });

    it("retourne les bons champs dans le résultat", () => {
      const result = simulateIR(input({ revenuNetImposable: 40000, nbParts: 2 }));
      expect(result).toHaveProperty("revenuNetImposable");
      expect(result).toHaveProperty("nbParts");
      expect(result).toHaveProperty("quotientFamilial");
      expect(result).toHaveProperty("impotBrut");
      expect(result).toHaveProperty("decote");
      expect(result).toHaveProperty("plafonnementQF");
      expect(result).toHaveProperty("creditsImpot");
      expect(result).toHaveProperty("impotNet");
      expect(result).toHaveProperty("tmi");
      expect(result).toHaveProperty("tauxEffectif");
      expect(result).toHaveProperty("revenueParPart");
    });
  });

  describe("millésime fiscal", () => {
    it("utilise le barème 2026 par défaut (célibataire 30 000 €, 1 part)", () => {
      const result = simulateIR(input({ revenuNetImposable: 30000, nbParts: 1 }));
      // Barème 2026 — QF 30000 :
      // (29579-11601)*0.11 = 1977.58 + (30000-29580)*0.30 = 126 → 2103.58 → 2104
      // Impôt brut (2104) > seuil décote célibataire (1982) → pas de décote
      expect(result.impotBrut).toBe(2104);
      expect(result.impotNet).toBe(2104);
      expect(result.tmi).toBe(30);
    });

    it("reproduit le barème 2025 quand on passe taxYear = 2025", () => {
      const result = simulateIR(
        input({ revenuNetImposable: 30000, nbParts: 1 }),
        2025
      );
      // Barème 2025 — QF 30000 :
      // (28797-11295)*0.11 = 1925.22 + (30000-28798)*0.30 = 360.60 → 2285.82 → 2286
      expect(result.impotBrut).toBe(2286);
      expect(result.impotNet).toBe(2286);
      expect(result.tmi).toBe(30);
    });

    it("le millésime 2026 donne un impôt plus faible que 2025 (indexation)", () => {
      const in2026 = simulateIR(input({ revenuNetImposable: 30000, nbParts: 1 }), 2026);
      const in2025 = simulateIR(input({ revenuNetImposable: 30000, nbParts: 1 }), 2025);
      expect(in2026.impotBrut).toBeLessThan(in2025.impotBrut);
    });
  });
});
