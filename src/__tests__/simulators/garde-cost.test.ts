import { describe, it, expect } from "vitest";
import { simulateGardeCost } from "@/lib/simulators/garde-cost";
import type { GardeCostSimulationInput } from "@/types/garde";

const baseInput: GardeCostSimulationInput = {
  modeGarde: "creche",
  coutMensuelBrut: 800,
  revenuAnnuel: 30000,
  nbEnfantsGardes: 1,
};

function input(overrides: Partial<GardeCostSimulationInput>): GardeCostSimulationInput {
  return { ...baseInput, ...overrides };
}

describe("simulateGardeCost", () => {
  describe("CMG par mode de garde", () => {
    it("calcule le CMG crèche tranche 1 (revenus < 22 191 €)", () => {
      const result = simulateGardeCost(input({
        modeGarde: "creche",
        coutMensuelBrut: 1200,
        revenuAnnuel: 20000,
      }));
      expect(result.cmg).toBe(925.38);
    });

    it("calcule le CMG crèche tranche 2", () => {
      const result = simulateGardeCost(input({
        modeGarde: "creche",
        coutMensuelBrut: 1200,
        revenuAnnuel: 35000,
      }));
      expect(result.cmg).toBe(793.16);
    });

    it("calcule le CMG crèche tranche 3 (revenus > 49 340 €)", () => {
      const result = simulateGardeCost(input({
        modeGarde: "creche",
        coutMensuelBrut: 1200,
        revenuAnnuel: 60000,
      }));
      expect(result.cmg).toBe(660.93);
    });

    it("calcule le CMG assistante maternelle tranche 1", () => {
      const result = simulateGardeCost(input({
        modeGarde: "assistante_maternelle",
        coutMensuelBrut: 800,
        revenuAnnuel: 20000,
      }));
      expect(result.cmg).toBe(530.72);
    });

    it("calcule le CMG garde à domicile tranche 1", () => {
      const result = simulateGardeCost(input({
        modeGarde: "garde_domicile",
        coutMensuelBrut: 1500,
        revenuAnnuel: 20000,
      }));
      expect(result.cmg).toBe(927.46);
    });
  });

  describe("plafonnement CMG", () => {
    it("plafonne le CMG au coût réel quand coût < barème", () => {
      const result = simulateGardeCost(input({
        modeGarde: "creche",
        coutMensuelBrut: 500,
        revenuAnnuel: 20000,
      }));
      // Barème tranche 1 = 925.38 mais coût = 500
      expect(result.cmg).toBe(500);
    });
  });

  describe("crédit d'impôt", () => {
    it("calcule 50% des dépenses restantes après CMG", () => {
      const result = simulateGardeCost(input({
        modeGarde: "creche",
        coutMensuelBrut: 1200,
        revenuAnnuel: 20000,
        nbEnfantsGardes: 1,
      }));
      // Après CMG: 1200 - 925.38 = 274.62/mois
      // Annuel: 274.62 * 12 = 3295.44
      // 50% = 1647.72 (< plafond 1750)
      expect(result.creditImpotMensuel).toBeGreaterThan(0);
      // Vérifier que le crédit annuel ne dépasse pas 1750/enfant
      expect(result.creditImpotMensuel * 12).toBeLessThanOrEqual(1750);
    });

    it("plafonne le crédit d'impôt à 1 750 €/an/enfant", () => {
      const result = simulateGardeCost(input({
        modeGarde: "assistante_maternelle",
        coutMensuelBrut: 1500,
        revenuAnnuel: 60000,
        nbEnfantsGardes: 1,
      }));
      // Après CMG: 1500 - 367.88 = 1132.12/mois → 13585.44/an
      // Max dépenses éligibles = 3500/enfant
      // 50% de 3500 = 1750
      expect(result.creditImpotMensuel * 12).toBeCloseTo(1750, 0);
    });

    it("double le plafond pour 2 enfants", () => {
      const result = simulateGardeCost(input({
        modeGarde: "assistante_maternelle",
        coutMensuelBrut: 2000,
        revenuAnnuel: 60000,
        nbEnfantsGardes: 2,
      }));
      // Max = 1750 * 2 = 3500/an (tolérance arrondi mensuel)
      expect(result.creditImpotMensuel * 12).toBeLessThanOrEqual(3501);
    });
  });

  describe("reste à charge", () => {
    it("n'est jamais négatif", () => {
      const result = simulateGardeCost(input({
        modeGarde: "creche",
        coutMensuelBrut: 100,
        revenuAnnuel: 20000,
      }));
      expect(result.resteACharge).toBeGreaterThanOrEqual(0);
    });

    it("est cohérent avec coût brut - CMG - crédit impôt", () => {
      const result = simulateGardeCost(input({
        modeGarde: "creche",
        coutMensuelBrut: 1000,
        revenuAnnuel: 35000,
      }));
      const expectedResteACharge = Math.max(0, result.coutBrut - result.cmg - result.creditImpotMensuel);
      expect(result.resteACharge).toBeCloseTo(expectedResteACharge, 1);
    });
  });

  describe("détails", () => {
    it("retourne 4 lignes de détail", () => {
      const result = simulateGardeCost(input({}));
      expect(result.details).toHaveLength(4);
      expect(result.details[0].label).toContain("Coût mensuel");
      expect(result.details[1].label).toContain("CMG");
      expect(result.details[2].label).toContain("Crédit d'impôt");
      expect(result.details[3].label).toContain("Reste à charge");
    });

    it("les montants aides sont négatifs dans les détails", () => {
      const result = simulateGardeCost(input({ coutMensuelBrut: 1000, revenuAnnuel: 30000 }));
      expect(result.details[1].montant).toBeLessThan(0); // CMG
      expect(result.details[2].montant).toBeLessThan(0); // Crédit impôt
    });
  });
});
