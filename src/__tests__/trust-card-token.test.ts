import { describe, it, expect } from "vitest";
import { generateToken, generatePin, hashPin, verifyPin } from "@/lib/trust-card/token";

describe("trust-card/token", () => {
  describe("generateToken", () => {
    it("génère un token URL-safe", () => {
      const t = generateToken();
      expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("génère des tokens uniques", () => {
      const tokens = Array.from({ length: 100 }, () => generateToken());
      const unique = new Set(tokens);
      expect(unique.size).toBe(100);
    });

    it("génère un token suffisamment long (>= 16 chars)", () => {
      expect(generateToken().length).toBeGreaterThanOrEqual(16);
    });
  });

  describe("generatePin", () => {
    it("génère un PIN à exactement 4 chiffres", () => {
      const pin = generatePin();
      expect(pin).toMatch(/^\d{4}$/);
    });

    it("varie d'un appel à l'autre", () => {
      const pins = Array.from({ length: 20 }, () => generatePin());
      const unique = new Set(pins);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe("hashPin / verifyPin", () => {
    it("vérifie un PIN correct", async () => {
      const pin = "1234";
      const hash = await hashPin(pin);
      expect(await verifyPin(pin, hash)).toBe(true);
    });

    it("rejette un PIN incorrect", async () => {
      const hash = await hashPin("1234");
      expect(await verifyPin("4321", hash)).toBe(false);
      expect(await verifyPin("0000", hash)).toBe(false);
    });

    it("produit des hashs différents pour le même PIN (salt)", async () => {
      const h1 = await hashPin("1234");
      const h2 = await hashPin("1234");
      expect(h1).not.toBe(h2);
    });

    it("vérifie correctement chacun des deux hashs", async () => {
      const h1 = await hashPin("9876");
      const h2 = await hashPin("9876");
      expect(await verifyPin("9876", h1)).toBe(true);
      expect(await verifyPin("9876", h2)).toBe(true);
    });
  });
});
