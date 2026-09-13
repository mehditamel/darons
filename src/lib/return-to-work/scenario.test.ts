// @vitest-environment node
import { describe, expect, it } from "vitest";
import { exampleProfile } from "./plan";
import {
  compareWorkScenario,
  scenarioOutcome,
  scenarioSummary,
  type WorkAdjustment,
} from "./scenario";

const profile = () => exampleProfile(new Date("2026-09-13T12:00:00Z"));
const change = (patch: Partial<WorkAdjustment> = {}): WorkAdjustment => ({
  days: [0, 1, 2, 3, 4],
  workShift: 0,
  travel: null,
  careEarlier: 0,
  careLater: 0,
  ...patch,
});
describe("reprise scenario", () => {
  it("compares a combined adjustment without changing the original profile or work duration", () => {
    const original = profile(),
      snapshot = structuredClone(original);
    const result = compareWorkScenario(
      original,
      change({ workShift: -30, careLater: 30 }),
    );
    expect(result.beforeMinutes).toBe(300);
    expect(result.afterMinutes).toBe(0);
    expect(result.rows[0].proposed).toMatchObject({
      workStart: "08:30",
      workEnd: "17:00",
      careStart: "08:00",
      careEnd: "17:30",
    });
    expect(original).toEqual(snapshot);
    expect(scenarioOutcome(result)).toContain("5 h de moins");
  });
  it("shows a new morning gap even when the evening gap disappears", () => {
    const result = compareWorkScenario(profile(), change({ workShift: -60 }));
    expect(result.afterMinutes).toBe(150);
    expect(result.rows[0].after.gaps).toEqual([{ start: 450, end: 480 }]);
  });
  it("reports worsening and unchanged hypotheses honestly", () => {
    expect(
      scenarioOutcome(
        compareWorkScenario(profile(), change({ workShift: 30 })),
      ),
    ).toContain("2 h 30 de plus");
    expect(scenarioOutcome(compareWorkScenario(profile(), change()))).toContain(
      "Même durée",
    );
  });
  it("uses each selected day’s own hours and ignores unselected days", () => {
    const original = profile();
    original.days[1].workEnd = "16:30";
    const result = compareWorkScenario(
      original,
      change({ days: [0, 1], careLater: 30 }),
    );
    expect(result.rows).toHaveLength(2);
    expect(result.beforeMinutes).toBe(60);
    expect(result.afterMinutes).toBe(30);
    expect(result.rows[1].proposed.workEnd).toBe("16:30");
  });
  it("supports weekends and distinguishes an unchanged commute from zero", () => {
    const original = profile();
    original.days.forEach((row) => {
      row.active = row.day === 5;
    });
    expect(
      compareWorkScenario(original, change({ days: [5] })).afterMinutes,
    ).toBe(60);
    expect(
      compareWorkScenario(original, change({ days: [5], travel: 0 }))
        .afterMinutes,
    ).toBe(30);
  });
  it("never fills unknown care or counts it as zero missing care", () => {
    const original = profile();
    original.days[0].careStart = "";
    original.days[0].careEnd = "";
    const mixed = compareWorkScenario(
      original,
      change({ careEarlier: 30, careLater: 60 }),
    );
    expect(mixed).toMatchObject({
      knownDays: 4,
      unknownDays: 1,
      beforeMinutes: 240,
      afterMinutes: 0,
    });
    expect(mixed.rows[0].after.missing).toBeNull();
    const unknown = compareWorkScenario(
      original,
      change({ days: [0], careLater: 60 }),
    );
    expect(scenarioOutcome(unknown)).toContain("impossible de mesurer");
  });
  it.each([
    { days: [] },
    { days: [0, 0] },
    { days: [7] },
    { days: [5] },
    { travel: -1 },
    { travel: 181 },
    { travel: 1.5 },
    { workShift: 181 },
    { careEarlier: NaN },
    { careLater: -1 },
  ])("rejects invalid adjustments %j", (patch) => {
    expect(() => compareWorkScenario(profile(), change(patch))).toThrow();
  });
  it("rejects crossing midnight instead of clipping hours and faking a solution", () => {
    const original = profile();
    original.days[0] = {
      ...original.days[0],
      workStart: "00:30",
      workEnd: "08:00",
      travel: 0,
      careStart: "00:00",
      careEnd: "08:00",
    };
    expect(() =>
      compareWorkScenario(original, change({ days: [0], workShift: -60 })),
    ).toThrow("dépasse la journée");
    expect(() =>
      compareWorkScenario(original, change({ days: [0], careEarlier: 15 })),
    ).toThrow("dépasse la journée");
    expect(() =>
      compareWorkScenario(original, change({ days: [0], travel: 60 })),
    ).toThrow("une même journée");
  });
  it("exports exact hypothetical hours, remaining gaps and the example marker", () => {
    const text = scenarioSummary(
      profile(),
      change({ days: [0], workShift: -60 }),
      true,
    );
    expect(text).toContain("EXEMPLE FICTIF");
    expect(text).toContain("09 h 00–17 h 30 → 08 h 00–16 h 30");
    expect(text).toContain("07 h 30–08 h 00");
    expect(text).not.toContain("Mardi");
    expect(text).toContain("Aucun horaire proposé n’est un accord");
    expect(text).toContain("horaires familiaux");
  });
});
