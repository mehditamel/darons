import { describe, it, expect } from "vitest";
import { simulateCaf, type CafSimulationInput } from "@/lib/simulators/caf-simulator";

const baseInput: CafSimulationInput = {
  revenuNetCatAnnuel: 30000,
  nbEnfantsACharge: 1,
  ageEnfants: [1],
  situationFamiliale: "couple",
  modeGarde: "aucun",
  coutGardeMensuel: 0,
};

function input(overrides: Partial<CafSimulationInput>): CafSimulationInput {
  return { ...baseInput, ...overrides };
}

describe("simulateCaf", () => {
  describe("allocations familiales", () => {
    it("retourne 0 AF pour 1 enfant", () => {
      const result = simulateCaf(input({ nbEnfantsACharge: 1, ageEnfants: [5] }));
      expect(result.allocationsFamiliales).toBe(0);
    });

    it("retourne 148.52 € AF pour 2 enfants (revenus tranche 1)", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 2,
        ageEnfants: [5, 8],
        revenuNetCatAnnuel: 50000,
      }));
      expect(result.allocationsFamiliales).toBe(148.52);
    });

    it("retourne AF divisées par 2 pour revenus tranche 2", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 2,
        ageEnfants: [5, 8],
        revenuNetCatAnnuel: 85000,
      }));
      expect(result.allocationsFamiliales).toBe(74.26);
    });

    it("retourne AF divisées par 4 pour revenus très élevés", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 2,
        ageEnfants: [5, 8],
        revenuNetCatAnnuel: 120000,
      }));
      expect(result.allocationsFamiliales).toBe(37.13);
    });

    it("ajoute le supplément par enfant à partir du 3e", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 3,
        ageEnfants: [5, 8, 10],
        revenuNetCatAnnuel: 50000,
      }));
      // 148.52 + 190.88 = 339.40
      expect(result.allocationsFamiliales).toBeCloseTo(148.52 + 190.88, 1);
    });
  });

  describe("PAJE — allocation de base", () => {
    it("accorde 196.60 €/mois si enfant < 3 ans et revenus sous plafond", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [1],
        revenuNetCatAnnuel: 30000,
      }));
      expect(result.pajeAllocationBase).toBe(196.60);
    });

    it("refuse si aucun enfant < 3 ans", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [5],
        revenuNetCatAnnuel: 30000,
      }));
      expect(result.pajeAllocationBase).toBe(0);
    });

    it("refuse si revenus au-dessus du plafond", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [1],
        revenuNetCatAnnuel: 100000,
      }));
      expect(result.pajeAllocationBase).toBe(0);
    });
  });

  describe("PAJE — prime naissance", () => {
    it("accorde 1 084.43 € pour enfant < 1 an sous plafond", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [0],
        revenuNetCatAnnuel: 30000,
      }));
      expect(result.pajeNaissance).toBe(1084.43);
    });

    it("refuse pour enfant >= 1 an", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [1],
        revenuNetCatAnnuel: 30000,
      }));
      expect(result.pajeNaissance).toBe(0);
    });
  });

  describe("CMG", () => {
    it("calcule le CMG crèche tranche 1", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [2],
        revenuNetCatAnnuel: 20000,
        modeGarde: "creche",
        coutGardeMensuel: 1000,
      }));
      // Tranche 1 (< 22191) → 925.38 €
      expect(result.cmg).toBe(925.38);
    });

    it("plafonne le CMG au coût réel", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [2],
        revenuNetCatAnnuel: 20000,
        modeGarde: "creche",
        coutGardeMensuel: 500,
      }));
      // CMG plafonné au coût: 500 < 925.38
      expect(result.cmg).toBe(500);
    });

    it("calcule le CMG assistante maternelle tranche 2", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [2],
        revenuNetCatAnnuel: 35000,
        modeGarde: "assistante_maternelle",
        coutGardeMensuel: 600,
      }));
      // Tranche 2 (22191 < 35000 < 49340) → 449.30 €
      expect(result.cmg).toBe(449.30);
    });

    it("retourne 0 CMG sans mode de garde", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [2],
        modeGarde: "aucun",
      }));
      expect(result.cmg).toBe(0);
    });

    it("retourne 0 CMG si aucun enfant < 6 ans", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [7],
        modeGarde: "creche",
        coutGardeMensuel: 800,
      }));
      expect(result.cmg).toBe(0);
    });
  });

  describe("allocation de rentrée scolaire", () => {
    it("accorde 426.87 € pour enfant 6-10 ans sous plafond", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [7],
        revenuNetCatAnnuel: 25000,
      }));
      expect(result.allocationRentree).toBe(426.87);
    });

    it("accorde 450.41 € pour enfant 11-14 ans", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [12],
        revenuNetCatAnnuel: 25000,
      }));
      expect(result.allocationRentree).toBe(450.41);
    });

    it("accorde 466.02 € pour enfant 15-18 ans", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [16],
        revenuNetCatAnnuel: 25000,
      }));
      expect(result.allocationRentree).toBe(466.02);
    });

    it("retourne 0 ARS pour enfant < 6 ans", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [3],
        revenuNetCatAnnuel: 25000,
      }));
      expect(result.allocationRentree).toBe(0);
    });

    it("cumule l'ARS pour plusieurs enfants", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 2,
        ageEnfants: [7, 12],
        revenuNetCatAnnuel: 25000,
      }));
      expect(result.allocationRentree).toBeCloseTo(426.87 + 450.41, 1);
    });
  });

  describe("cas limites", () => {
    it("gère un revenu de 0 sans erreur", () => {
      const result = simulateCaf(input({
        revenuNetCatAnnuel: 0,
        nbEnfantsACharge: 1,
        ageEnfants: [1],
      }));
      expect(result.totalMensuel).toBeGreaterThanOrEqual(0);
      expect(result.pajeAllocationBase).toBe(196.60);
    });

    it("gère un revenu négatif comme 0", () => {
      const result = simulateCaf(input({
        revenuNetCatAnnuel: -5000,
        nbEnfantsACharge: 1,
        ageEnfants: [1],
      }));
      expect(result.totalMensuel).toBeGreaterThanOrEqual(0);
    });

    it("retourne 0 pour toutes les allocations enfant avec 0 enfants", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 0,
        ageEnfants: [],
      }));
      expect(result.allocationsFamiliales).toBe(0);
      expect(result.pajeAllocationBase).toBe(0);
      expect(result.pajeNaissance).toBe(0);
      expect(result.cmg).toBe(0);
      expect(result.allocationRentree).toBe(0);
    });

    it("gère un enfant exactement à 6 ans pour l'ARS", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [6],
        revenuNetCatAnnuel: 25000,
      }));
      expect(result.allocationRentree).toBe(426.87);
    });

    it("gère un enfant exactement à 3 ans pour la PAJE", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [3],
        revenuNetCatAnnuel: 30000,
      }));
      // Age 3 = not < 3, so no PAJE base
      expect(result.pajeAllocationBase).toBe(0);
    });
  });

  describe("totaux", () => {
    it("calcule le total mensuel correctement", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 2,
        ageEnfants: [1, 7],
        revenuNetCatAnnuel: 30000,
        modeGarde: "creche",
        coutGardeMensuel: 1000,
      }));
      // Total mensuel = AF + PAJE base + CMG
      expect(result.totalMensuel).toBe(
        result.allocationsFamiliales + result.pajeAllocationBase + result.cmg
      );
    });

    it("calcule le total annuel correctement", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 2,
        ageEnfants: [0, 7],
        revenuNetCatAnnuel: 30000,
        modeGarde: "creche",
        coutGardeMensuel: 1000,
      }));
      // Total annuel = mensuel * 12 + prime naissance + ARS
      expect(result.totalAnnuel).toBeCloseTo(
        result.totalMensuel * 12 + result.pajeNaissance + result.allocationRentree,
        1
      );
    });

    it("retourne des détails pour chaque allocation", () => {
      const result = simulateCaf(input({
        nbEnfantsACharge: 1,
        ageEnfants: [1],
        revenuNetCatAnnuel: 30000,
      }));
      expect(result.details.length).toBeGreaterThan(0);
      expect(result.details[0]).toHaveProperty("label");
      expect(result.details[0]).toHaveProperty("montant");
      expect(result.details[0]).toHaveProperty("periodicite");
      expect(result.details[0]).toHaveProperty("eligible");
    });
  });
});
