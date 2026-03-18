import { describe, it, expect } from "vitest";
import { budgetEntrySchema, cafAllocationSchema, savingsGoalSchema } from "@/lib/validators/budget";

describe("budgetEntrySchema", () => {
  const valid = {
    month: "2025-03-01",
    category: "alimentation" as const,
    label: "Courses Leclerc",
    amount: 150,
  };

  it("accepte une entrée valide", () => {
    expect(budgetEntrySchema.safeParse(valid).success).toBe(true);
  });

  it("refuse un montant de 0", () => {
    expect(budgetEntrySchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
  });

  it("refuse un format de date invalide", () => {
    expect(budgetEntrySchema.safeParse({ ...valid, month: "mars 2025" }).success).toBe(false);
  });

  it("refuse une catégorie invalide", () => {
    expect(budgetEntrySchema.safeParse({ ...valid, category: "crypto" }).success).toBe(false);
  });

  it("accepte toutes les catégories valides", () => {
    const cats = ["alimentation", "sante", "garde", "vetements", "loisirs", "scolarite", "transport", "logement", "assurance", "autre"];
    for (const category of cats) {
      expect(budgetEntrySchema.safeParse({ ...valid, category }).success).toBe(true);
    }
  });

  it("accepte un montant négatif (recette)", () => {
    expect(budgetEntrySchema.safeParse({ ...valid, amount: -500 }).success).toBe(true);
  });
});

describe("cafAllocationSchema", () => {
  const valid = {
    allocationType: "PAJE",
    monthlyAmount: 184.81,
    startDate: "2025-03-01",
  };

  it("accepte une allocation valide", () => {
    expect(cafAllocationSchema.safeParse(valid).success).toBe(true);
  });

  it("refuse un montant <= 0", () => {
    expect(cafAllocationSchema.safeParse({ ...valid, monthlyAmount: 0 }).success).toBe(false);
  });

  it("refuse un format de date invalide", () => {
    expect(cafAllocationSchema.safeParse({ ...valid, startDate: "01/03/2025" }).success).toBe(false);
  });
});

describe("savingsGoalSchema", () => {
  it("accepte un objectif valide", () => {
    const result = savingsGoalSchema.safeParse({
      name: "Vacances été 2026",
      targetAmount: 3000,
    });
    expect(result.success).toBe(true);
  });

  it("refuse un objectif < 1 €", () => {
    const result = savingsGoalSchema.safeParse({
      name: "Test",
      targetAmount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("refuse un nom vide", () => {
    const result = savingsGoalSchema.safeParse({
      name: "",
      targetAmount: 1000,
    });
    expect(result.success).toBe(false);
  });
});
