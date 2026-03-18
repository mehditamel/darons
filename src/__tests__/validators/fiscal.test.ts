import { describe, it, expect } from "vitest";
import { taxSimulationSchema, fiscalYearSaveSchema } from "@/lib/validators/fiscal";

describe("taxSimulationSchema", () => {
  it("accepte des données valides avec defaults", () => {
    const result = taxSimulationSchema.safeParse({
      revenuNetImposable: 60000,
      nbParts: 2.5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.numChildren).toBe(0);
      expect(result.data.gardeEnfantExpenses).toBe(0);
    }
  });

  it("refuse un revenu négatif", () => {
    const result = taxSimulationSchema.safeParse({
      revenuNetImposable: -1000,
      nbParts: 1,
    });
    expect(result.success).toBe(false);
  });

  it("refuse des parts < 1", () => {
    const result = taxSimulationSchema.safeParse({
      revenuNetImposable: 50000,
      nbParts: 0.5,
    });
    expect(result.success).toBe(false);
  });

  it("refuse des parts > 20", () => {
    const result = taxSimulationSchema.safeParse({
      revenuNetImposable: 50000,
      nbParts: 21,
    });
    expect(result.success).toBe(false);
  });

  it("accepte toutes les options de crédits d'impôt", () => {
    const result = taxSimulationSchema.safeParse({
      revenuNetImposable: 60000,
      nbParts: 2.5,
      numChildren: 2,
      gardeEnfantExpenses: 3500,
      emploiDomicileExpenses: 12000,
      donsOrganismes: 1000,
      donsAidePersonnes: 500,
    });
    expect(result.success).toBe(true);
  });
});

describe("fiscalYearSaveSchema", () => {
  it("accepte des données fiscales valides", () => {
    const result = fiscalYearSaveSchema.safeParse({
      year: 2025,
      nbParts: 2.5,
      revenuNetImposable: 60000,
      impotBrut: 3500,
      creditsImpot: { gardeEnfant: 1750 },
      impotNet: 1750,
      tmi: 30,
      tauxEffectif: 2.92,
    });
    expect(result.success).toBe(true);
  });

  it("refuse une année < 2020", () => {
    const result = fiscalYearSaveSchema.safeParse({
      year: 2019,
      nbParts: 1,
      revenuNetImposable: 30000,
      impotBrut: 1000,
      creditsImpot: {},
      impotNet: 1000,
      tmi: 11,
      tauxEffectif: 3.33,
    });
    expect(result.success).toBe(false);
  });

  it("refuse un TMI > 45", () => {
    const result = fiscalYearSaveSchema.safeParse({
      year: 2025,
      nbParts: 1,
      revenuNetImposable: 200000,
      impotBrut: 50000,
      creditsImpot: {},
      impotNet: 50000,
      tmi: 50,
      tauxEffectif: 25,
    });
    expect(result.success).toBe(false);
  });
});
