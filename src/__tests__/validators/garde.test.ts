import { describe, it, expect } from "vitest";
import { childcareSearchSchema, gardeCostSimulationSchema } from "@/lib/validators/garde";

describe("childcareSearchSchema", () => {
  it("accepte une recherche valide", () => {
    const result = childcareSearchSchema.safeParse({ query: "crèche Marseille" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rayonKm).toBe(10); // default
    }
  });

  it("refuse une requête < 2 caractères", () => {
    expect(childcareSearchSchema.safeParse({ query: "a" }).success).toBe(false);
  });

  it("refuse un rayon > 50 km", () => {
    expect(childcareSearchSchema.safeParse({ query: "crèche", rayonKm: 100 }).success).toBe(false);
  });

  it("refuse un rayon < 1 km", () => {
    expect(childcareSearchSchema.safeParse({ query: "crèche", rayonKm: 0 }).success).toBe(false);
  });
});

describe("gardeCostSimulationSchema", () => {
  const valid = {
    modeGarde: "creche" as const,
    coutMensuelBrut: 800,
    revenuAnnuel: 40000,
  };

  it("accepte une simulation valide", () => {
    const result = gardeCostSimulationSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nbEnfantsGardes).toBe(1); // default
    }
  });

  it("refuse un mode de garde invalide", () => {
    expect(gardeCostSimulationSchema.safeParse({ ...valid, modeGarde: "nourrice" }).success).toBe(false);
  });

  it("refuse un coût <= 0", () => {
    expect(gardeCostSimulationSchema.safeParse({ ...valid, coutMensuelBrut: 0 }).success).toBe(false);
  });

  it("refuse un revenu négatif", () => {
    expect(gardeCostSimulationSchema.safeParse({ ...valid, revenuAnnuel: -1 }).success).toBe(false);
  });

  it("refuse 0 enfants", () => {
    expect(gardeCostSimulationSchema.safeParse({ ...valid, nbEnfantsGardes: 0 }).success).toBe(false);
  });

  it("accepte les 3 modes de garde valides", () => {
    for (const mode of ["creche", "assistante_maternelle", "garde_domicile"]) {
      expect(gardeCostSimulationSchema.safeParse({ ...valid, modeGarde: mode }).success).toBe(true);
    }
  });
});
