import { describe, it, expect } from "vitest";
import { cn, formatCurrency, calculateAge, formatDate } from "@/lib/utils";

describe("cn", () => {
  it("fusionne les classes", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("résout les conflits Tailwind", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("gère les conditionnels", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });
});

describe("formatCurrency", () => {
  it("formate en euros avec locale FR", () => {
    const result = formatCurrency(1234.56);
    // Vérifie que le symbole € est présent et les séparateurs corrects
    expect(result).toContain("€");
    expect(result).toContain("1");
    expect(result).toContain("234");
  });

  it("formate 0 €", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
    expect(result).toContain("€");
  });

  it("formate les montants négatifs", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("500");
    expect(result).toContain("€");
  });
});

describe("formatDate", () => {
  it("formate avec le pattern par défaut dd/MM/yyyy", () => {
    const result = formatDate("2025-03-10");
    expect(result).toBe("10/03/2025");
  });

  it("formate avec un pattern personnalisé", () => {
    const result = formatDate("2025-03-10", "MMMM yyyy");
    expect(result).toContain("mars");
    expect(result).toContain("2025");
  });
});

describe("calculateAge", () => {
  it("retourne l'âge en mois pour un nourrisson", () => {
    // Date ~6 mois avant maintenant
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const result = calculateAge(sixMonthsAgo);
    expect(result.years).toBe(0);
    expect(result.months).toBe(6);
    expect(result.label).toContain("mois");
  });

  it("retourne l'âge en années pour un enfant", () => {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const result = calculateAge(fiveYearsAgo);
    expect(result.years).toBe(5);
    expect(result.label).toContain("5 ans");
  });

  it("gère le pluriel pour 1 an", () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const result = calculateAge(oneYearAgo);
    expect(result.years).toBe(1);
    expect(result.label).toContain("1 an");
    expect(result.label).not.toContain("1 ans");
  });

  it("accepte une chaîne de date", () => {
    const result = calculateAge("2020-01-01");
    expect(result.years).toBeGreaterThan(0);
  });
});
