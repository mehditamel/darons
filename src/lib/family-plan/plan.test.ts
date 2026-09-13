import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  FOCUSES,
  getMission,
  MISSIONS,
  selectMissions,
  STAGES,
} from "./catalog";
import {
  addCalendarDays,
  createFamilyPlan,
  exportPlanCalendar,
  foldCalendarLine,
  localCalendarDate,
  MAX_PLAN_BYTES,
  parseFamilyPlan,
  planHandoff,
} from "./plan";
import {
  calendarDateSchema,
  familyPlanSchema,
  familyProfileSchema,
} from "@/lib/validators/family-plan";

const ID = "a7165cb0-3729-4a4c-af55-e4580a763bf0";
const NOW = new Date("2026-09-12T12:00:00Z");
const profile = {
  stages: ["expecting" as const],
  focus: "rest" as const,
  minutes: 20 as const,
};
const create = () => createFamilyPlan(profile, ID, NOW);

describe("family plan prioritization", () => {
  it("respects stage eligibility, time and task caps for every supported combination", () => {
    for (let mask = 1; mask < 16; mask++) {
      const stages = STAGES.filter((_, index) => mask & (1 << index));
      for (const focus of FOCUSES)
        for (const minutes of [10, 20, 40] as const) {
          const input = { stages, focus, minutes };
          const selected = selectMissions(input);
          expect(selected.length).toBeGreaterThan(0);
          expect(selected.length).toBeLessThanOrEqual(3);
          expect(
            selected.reduce((total, item) => total + item.minutes, 0),
          ).toBeLessThanOrEqual(minutes);
          expect(new Set(selected.map((item) => item.id)).size).toBe(
            selected.length,
          );
          expect(
            selected.every((item) =>
              item.stages.some((stage) => stages.includes(stage)),
            ),
          ).toBe(true);
          expect(selected.every((item) => item.focus === focus)).toBe(true);
          expect(selectMissions(input)).toEqual(selected);
          expect(
            familyPlanSchema.safeParse(createFamilyPlan(input, ID, NOW))
              .success,
          ).toBe(true);
        }
    }
  });
  it("gives future parents a birth action and older babies a transition action", () => {
    expect(
      selectMissions({ ...profile, focus: "arrival", minutes: 10 })[0].id,
    ).toBe("arrival-paperwork");
    expect(
      selectMissions({
        ...profile,
        stages: ["toddler"],
        focus: "arrival",
        minutes: 10,
      })[0].id,
    ).toBe("growing-next-step");
  });
  it("has unique missions with three steps and only existing public tool links", () => {
    expect(new Set(MISSIONS.map((item) => item.id)).size).toBe(MISSIONS.length);
    for (const mission of MISSIONS) {
      expect(mission.steps).toHaveLength(3);
      if (mission.href) {
        expect(mission.href).toMatch(/^\/outils\/[a-z-]+$/);
        expect(
          existsSync(
            path.join(
              process.cwd(),
              "src/app/(marketing)",
              mission.href,
              "page.tsx",
            ),
          ),
        ).toBe(true);
        expect(mission.linkLabel).toBeTruthy();
      }
    }
    expect(() => getMission("unknown")).toThrow("Action inconnue");
  });
  it("requires valid, unique family stages and a supported time budget", () => {
    for (const invalid of [
      { ...profile, stages: [] },
      { ...profile, stages: ["expecting", "expecting"] },
      { ...profile, focus: "unknown" },
      { ...profile, minutes: 100 },
      { ...profile, childName: "Extra data" },
    ]) {
      expect(familyProfileSchema.safeParse(invalid).success).toBe(false);
    }
  });
});

describe("portable plan validation", () => {
  it("round trips owners, dates and partial completion", () => {
    const plan = create();
    plan.missions[0].owner = "support";
    plan.missions[0].completed[1] = true;
    plan.missions[0].date = "";
    expect(parseFamilyPlan(JSON.stringify(plan))).toEqual(plan);
  });
  it.each([
    [
      "unknown version",
      (plan: ReturnType<typeof create>) => ({ ...plan, version: 2 }),
    ],
    [
      "duplicate mission",
      (plan: ReturnType<typeof create>) => ({
        ...plan,
        missions: [plan.missions[0], plan.missions[0]],
      }),
    ],
    [
      "unknown mission",
      (plan: ReturnType<typeof create>) => ({
        ...plan,
        missions: [{ ...plan.missions[0], id: "untrusted" }],
      }),
    ],
    [
      "ineligible stage",
      (plan: ReturnType<typeof create>) => ({
        ...plan,
        profile: { ...plan.profile, stages: ["toddler"] },
      }),
    ],
    [
      "over time budget",
      (plan: ReturnType<typeof create>) => ({
        ...plan,
        profile: { ...plan.profile, minutes: 10 },
      }),
    ],
    [
      "injected URL",
      (plan: ReturnType<typeof create>) => ({
        ...plan,
        missions: [{ ...plan.missions[0], href: "https://invalid.example" }],
      }),
    ],
    [
      "bad date",
      (plan: ReturnType<typeof create>) => ({
        ...plan,
        missions: [{ ...plan.missions[0], date: "2026-02-30" }],
      }),
    ],
    [
      "bad owner",
      (plan: ReturnType<typeof create>) => ({
        ...plan,
        missions: [{ ...plan.missions[0], owner: "attacker\nBEGIN:VEVENT" }],
      }),
    ],
    [
      "missing completion",
      (plan: ReturnType<typeof create>) => ({
        ...plan,
        missions: [{ ...plan.missions[0], completed: [] }],
      }),
    ],
    ["missing ID", (plan: ReturnType<typeof create>) => ({ ...plan, id: "" })],
  ])("rejects %s", (_, transform) => {
    expect(() => parseFamilyPlan(JSON.stringify(transform(create())))).toThrow(
      "incompatible",
    );
  });
  it("rejects oversized UTF-8 files and invalid JSON", () => {
    expect(() => parseFamilyPlan("é".repeat(MAX_PLAN_BYTES / 2 + 1))).toThrow(
      "volumineuse",
    );
    expect(() => parseFamilyPlan("{bad")).toThrow("illisible");
  });
});

describe("calendar and relay exports", () => {
  it("handles leap years and month/year boundaries as calendar dates", () => {
    expect(addCalendarDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addCalendarDays("2026-03-29", 1)).toBe("2026-03-30");
    expect(calendarDateSchema.safeParse("2026-02-29").success).toBe(false);
    expect(calendarDateSchema.safeParse("2028-02-29").success).toBe(true);
    expect(calendarDateSchema.safeParse("2026-13-01").success).toBe(false);
    expect(calendarDateSchema.safeParse("2100-01-01").success).toBe(false);
    const local = new Date(2026, 8, 12, 23, 30);
    expect(localCalendarDate(local)).toBe("2026-09-12");
  });
  it("exports only pending, dated actions with stable UIDs and exclusive end dates", () => {
    const plan = create();
    plan.missions[0].date = "2028-02-29";
    plan.missions.slice(1).forEach((state) => {
      state.completed = [true, true, true];
    });
    const calendar = exportPlanCalendar(plan, NOW).replace(/\r\n /g, "");
    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(calendar).toContain(`UID:${ID}-${plan.missions[0].id}@darons.app`);
    expect(calendar).toContain(
      "DTSTART;VALUE=DATE:20280229\r\nDTEND;VALUE=DATE:20280301",
    );
    expect(calendar).toContain("DTSTAMP:20260912T120000Z");
    expect(calendar).not.toMatch(/VALARM|ATTENDEE|ORGANIZER/);
    plan.missions[0].date = "";
    expect(exportPlanCalendar(plan, NOW)).not.toContain("BEGIN:VEVENT");
  });
  it("folds UTF-8 safely at 75 octets and preserves the original content", () => {
    const original =
      "DESCRIPTION:" +
      "Bébé 👶 : à préparer, agir ; suivi \\ bientôt. ".repeat(8);
    const folded = foldCalendarLine(original);
    expect(folded.replace(/\r\n /g, "")).toBe(original);
    for (const line of folded.split("\r\n"))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    const calendar = exportPlanCalendar(create(), NOW);
    for (const line of calendar.split("\r\n"))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(calendar.replace(/\r\n/g, "")).not.toContain("\n");
    expect(calendar).toContain("\\n");
    expect(calendar.replace(/\r\n /g, "")).toContain("\\,");
  });
  it("includes handoff ownership and remaining steps, excluding finished actions", () => {
    const plan = create();
    plan.missions[0].owner = "support";
    plan.missions[0].completed[0] = true;
    plan.missions[0].date = "";
    plan.missions[1].completed = [true, true, true];
    const text = planHandoff(plan);
    expect(text).toContain("Responsable proposé : Mon relais");
    expect(text).toContain("Jour choisi : à choisir");
    expect(text).toContain("[fait]");
    expect(text).toContain("[à faire]");
    expect(text).not.toContain(getMission(plan.missions[1].id).title);
    expect(
      planHandoff(createFamilyPlan({ ...profile, focus: "money" }, ID, NOW)),
    ).toContain("https://darons.app/outils/simulateur-budget");
  });
});
