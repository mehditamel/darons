import { describe, it, expect } from "vitest";
import { householdSchema, familyMemberSchema, identityDocumentSchema } from "@/lib/validators/family";

describe("householdSchema", () => {
  it("accepte un nom valide", () => {
    const result = householdSchema.safeParse({ name: "Foyer Dupont" });
    expect(result.success).toBe(true);
  });

  it("refuse un nom vide", () => {
    const result = householdSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("refuse un nom > 100 caractères", () => {
    const result = householdSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe("familyMemberSchema", () => {
  const valid = {
    firstName: "Matis",
    lastName: "TAMELGHAGHET",
    birthDate: "2025-03-10",
    gender: "M" as const,
    memberType: "child" as const,
  };

  it("accepte un membre valide", () => {
    const result = familyMemberSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("refuse un genre invalide", () => {
    const result = familyMemberSchema.safeParse({ ...valid, gender: "X" });
    expect(result.success).toBe(false);
  });

  it("refuse un type de membre invalide", () => {
    const result = familyMemberSchema.safeParse({ ...valid, memberType: "pet" });
    expect(result.success).toBe(false);
  });

  it("accepte des notes optionnelles", () => {
    const result = familyMemberSchema.safeParse({ ...valid, notes: "Allergique aux arachides" });
    expect(result.success).toBe(true);
  });

  it("refuse des notes > 500 caractères", () => {
    const result = familyMemberSchema.safeParse({ ...valid, notes: "a".repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe("identityDocumentSchema", () => {
  it("accepte un document valide", () => {
    const result = identityDocumentSchema.safeParse({
      memberId: "550e8400-e29b-41d4-a716-446655440000",
      documentType: "cni",
    });
    expect(result.success).toBe(true);
  });

  it("refuse un UUID invalide", () => {
    const result = identityDocumentSchema.safeParse({
      memberId: "not-a-uuid",
      documentType: "cni",
    });
    expect(result.success).toBe(false);
  });

  it("refuse un type de document invalide", () => {
    const result = identityDocumentSchema.safeParse({
      memberId: "550e8400-e29b-41d4-a716-446655440000",
      documentType: "permis_conduire",
    });
    expect(result.success).toBe(false);
  });

  it("accepte tous les types de document valides", () => {
    const types = ["cni", "passeport", "livret_famille", "acte_naissance", "carte_vitale", "autre"];
    for (const type of types) {
      const result = identityDocumentSchema.safeParse({
        memberId: "550e8400-e29b-41d4-a716-446655440000",
        documentType: type,
      });
      expect(result.success).toBe(true);
    }
  });
});
