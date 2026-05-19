import { describe, it, expect } from "vitest";
import {
  quarterBoundsForDate,
  yearBoundsForDate,
} from "@/lib/capsule/aggregator";
import { periodLabel } from "@/types/capsule";

describe("capsule/aggregator", () => {
  describe("quarterBoundsForDate", () => {
    it("retourne Q1 pour janvier", () => {
      expect(quarterBoundsForDate(new Date("2026-01-15"))).toEqual({
        start: "2026-01-01",
        end: "2026-03-31",
      });
    });

    it("retourne Q2 pour mai", () => {
      expect(quarterBoundsForDate(new Date("2026-05-19"))).toEqual({
        start: "2026-04-01",
        end: "2026-06-30",
      });
    });

    it("retourne Q3 pour août", () => {
      expect(quarterBoundsForDate(new Date("2026-08-01"))).toEqual({
        start: "2026-07-01",
        end: "2026-09-30",
      });
    });

    it("retourne Q4 pour décembre", () => {
      expect(quarterBoundsForDate(new Date("2026-12-31"))).toEqual({
        start: "2026-10-01",
        end: "2026-12-31",
      });
    });
  });

  describe("yearBoundsForDate", () => {
    it("retourne l'année complète", () => {
      expect(yearBoundsForDate(new Date("2026-07-15"))).toEqual({
        start: "2026-01-01",
        end: "2026-12-31",
      });
    });
  });
});

describe("capsule/periodLabel", () => {
  it("formatte une année", () => {
    expect(periodLabel("year", "2026-01-01")).toBe("Année 2026");
  });

  it("formatte un trimestre en saison", () => {
    expect(periodLabel("quarter", "2026-01-01")).toBe("Hiver 2026");
    expect(periodLabel("quarter", "2026-04-01")).toBe("Printemps 2026");
    expect(periodLabel("quarter", "2026-07-01")).toBe("Été 2026");
    expect(periodLabel("quarter", "2026-10-01")).toBe("Automne 2026");
  });
});
