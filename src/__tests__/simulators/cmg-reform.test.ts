import { describe, it, expect } from "vitest";
import { simulateCmgReform, CMG_REFORM } from "@/lib/simulators/cmg-reform";

describe("simulateCmgReform", () => {
  describe("formule (art. D. 531-18)", () => {
    it("calcule le CMG assistante maternelle (couple, 1 enfant)", () => {
      const res = simulateCmgReform({
        mode: "assistante_maternelle",
        monthlyHours: 100,
        hourlyCost: 6,
        monthlyResources: 2333, // ~28 000 €/an
        childCount: 1,
      });
      // coût retenu = 100 × min(6,8) = 600
      // participation = 2333 × 0,000619 / 4,85 = 0,29776
      // CMG = 600 × (1 − 0,29776) ≈ 421,35
      expect(res.retainedMonthlyCost).toBe(600);
      expect(res.cmg).toBeCloseTo(421.35, 1);
    });

    it("calcule le CMG garde à domicile (taux double)", () => {
      const res = simulateCmgReform({
        mode: "garde_domicile",
        monthlyHours: 100,
        hourlyCost: 12,
        monthlyResources: 2333,
        childCount: 1,
      });
      expect(res.retainedMonthlyCost).toBe(1200);
      expect(res.cmg).toBeGreaterThan(0);
      expect(res.cmg).toBeLessThan(res.retainedMonthlyCost);
    });
  });

  describe("écrêtement au plafond horaire", () => {
    it("retient le plafond horaire et laisse l'excédent à charge", () => {
      const res = simulateCmgReform({
        mode: "assistante_maternelle",
        monthlyHours: 100,
        hourlyCost: 10, // > plafond 8 €
        monthlyResources: 2000,
        childCount: 1,
      });
      expect(res.retainedHourlyCost).toBe(8);
      expect(res.retainedMonthlyCost).toBe(800);
      expect(res.capExcess).toBe(200); // (10 − 8) × 100
    });
  });

  describe("bornes de ressources", () => {
    it("plafonne le CMG à 0 pour de hauts revenus", () => {
      const res = simulateCmgReform({
        mode: "assistante_maternelle",
        monthlyHours: 100,
        hourlyCost: 6,
        monthlyResources: 8500, // plafond
        childCount: 1,
      });
      expect(res.cmg).toBe(0);
    });

    it("applique le plancher de ressources pour les très bas revenus", () => {
      const low = simulateCmgReform({
        mode: "assistante_maternelle",
        monthlyHours: 100,
        hourlyCost: 6,
        monthlyResources: 100, // sous le plancher 815
        childCount: 1,
      });
      const atFloor = simulateCmgReform({
        mode: "assistante_maternelle",
        monthlyHours: 100,
        hourlyCost: 6,
        monthlyResources: CMG_REFORM.resourceFloor,
        childCount: 1,
      });
      expect(low.cmg).toBeCloseTo(atFloor.cmg, 2);
    });
  });

  describe("nombre d'enfants et parent isolé", () => {
    it("augmente le CMG quand le nombre d'enfants augmente (taux d'effort plus faible)", () => {
      const base = {
        mode: "assistante_maternelle" as const,
        monthlyHours: 100,
        hourlyCost: 6,
        monthlyResources: 3000,
      };
      const un = simulateCmgReform({ ...base, childCount: 1 });
      const trois = simulateCmgReform({ ...base, childCount: 3 });
      expect(trois.cmg).toBeGreaterThan(un.cmg);
    });

    it("accorde un CMG plus élevé au parent isolé (taux immédiatement inférieur)", () => {
      const base = {
        mode: "assistante_maternelle" as const,
        monthlyHours: 100,
        hourlyCost: 6,
        monthlyResources: 3000,
        childCount: 1,
      };
      const couple = simulateCmgReform(base);
      const isole = simulateCmgReform({ ...base, singleParent: true });
      expect(isole.cmg).toBeGreaterThan(couple.cmg);
    });
  });

  describe("monotonie revenus", () => {
    it("diminue le CMG quand les ressources augmentent", () => {
      const base = {
        mode: "assistante_maternelle" as const,
        monthlyHours: 100,
        hourlyCost: 6,
        childCount: 1,
      };
      const bas = simulateCmgReform({ ...base, monthlyResources: 1500 });
      const haut = simulateCmgReform({ ...base, monthlyResources: 4000 });
      expect(haut.cmg).toBeLessThan(bas.cmg);
    });

    it("ne retourne jamais un CMG négatif ni supérieur au coût retenu", () => {
      const res = simulateCmgReform({
        mode: "garde_domicile",
        monthlyHours: 80,
        hourlyCost: 20,
        monthlyResources: 7000,
        childCount: 1,
      });
      expect(res.cmg).toBeGreaterThanOrEqual(0);
      expect(res.cmg).toBeLessThanOrEqual(res.retainedMonthlyCost);
    });
  });
});
