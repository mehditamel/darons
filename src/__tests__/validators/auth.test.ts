import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, resetPasswordSchema } from "@/lib/validators/auth";

describe("loginSchema", () => {
  it("accepte un email et mot de passe valides", () => {
    const result = loginSchema.safeParse({ email: "test@email.com", password: "12345678" });
    expect(result.success).toBe(true);
  });

  it("refuse un email vide", () => {
    const result = loginSchema.safeParse({ email: "", password: "12345678" });
    expect(result.success).toBe(false);
  });

  it("refuse un email invalide", () => {
    const result = loginSchema.safeParse({ email: "not-email", password: "12345678" });
    expect(result.success).toBe(false);
  });

  it("refuse un mot de passe < 8 caractères", () => {
    const result = loginSchema.safeParse({ email: "test@email.com", password: "1234567" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validData = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean@dupont.fr",
    password: "Azerty123",
    confirmPassword: "Azerty123",
    acceptTerms: true as const,
  };

  it("accepte des données valides", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("refuse un prénom vide", () => {
    const result = registerSchema.safeParse({ ...validData, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("refuse un prénom > 50 caractères", () => {
    const result = registerSchema.safeParse({ ...validData, firstName: "a".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("refuse un mot de passe sans majuscule", () => {
    const result = registerSchema.safeParse({ ...validData, password: "azerty123", confirmPassword: "azerty123" });
    expect(result.success).toBe(false);
  });

  it("refuse un mot de passe sans minuscule", () => {
    const result = registerSchema.safeParse({ ...validData, password: "AZERTY123", confirmPassword: "AZERTY123" });
    expect(result.success).toBe(false);
  });

  it("refuse un mot de passe sans chiffre", () => {
    const result = registerSchema.safeParse({ ...validData, password: "AzertyAbc", confirmPassword: "AzertyAbc" });
    expect(result.success).toBe(false);
  });

  it("refuse si les mots de passe ne correspondent pas", () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
  });

  it("refuse si CGU non acceptées", () => {
    const result = registerSchema.safeParse({ ...validData, acceptTerms: false });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepte un email valide", () => {
    const result = resetPasswordSchema.safeParse({ email: "test@email.com" });
    expect(result.success).toBe(true);
  });

  it("refuse un email invalide", () => {
    const result = resetPasswordSchema.safeParse({ email: "invalid" });
    expect(result.success).toBe(false);
  });
});
