// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  ACTION_IDS,
  MAX_REPRISE_BYTES,
  coverage,
  createWorkPlan,
  employerBrief,
  exampleProfile,
  exportWorkCalendar,
  parseWorkPlan,
  profileSchema,
  workPlanSchema,
} from "./plan";

const now = new Date("2026-09-13T12:00:00Z");
const id = "919fe7db-23e4-4b5d-a969-3389b7080cd5";
function profile() {
  const value = exampleProfile(now);
  value.days = value.days.map((row) => ({ ...row, active: row.day === 0 }));
  return value;
}
describe("return-to-work coverage", () => {
  it("includes both commutes and reports the actual uncovered interval", () => {
    const result = coverage(profile());
    expect(result).toEqual([
      {
        day: 0,
        start: 510,
        end: 1080,
        missing: 60,
        gaps: [{ start: 1020, end: 1080 }],
      },
    ]);
  });
  it("counts independent morning and evening gaps", () => {
    const value = profile();
    value.days[0] = { ...value.days[0], careStart: "09:00", careEnd: "17:00" };
    expect(coverage(value)[0].missing).toBe(90);
    expect(coverage(value)[0].gaps).toHaveLength(2);
  });
  it("does not double count an entirely disjoint care interval", () => {
    const value = profile();
    value.days[0] = { ...value.days[0], careStart: "06:00", careEnd: "07:00" };
    expect(coverage(value)[0].missing).toBe(570);
    value.days[0] = { ...value.days[0], careStart: "19:00", careEnd: "22:00" };
    expect(coverage(value)[0].missing).toBe(570);
  });
  it("accepts exact boundary coverage with no commute", () => {
    const value = profile();
    value.days[0] = {
      ...value.days[0],
      travel: 0,
      careStart: "09:00",
      careEnd: "17:30",
    };
    expect(coverage(value)[0].missing).toBe(0);
  });
  it("keeps unknown childcare distinct from zero uncovered minutes", () => {
    const value = profile();
    value.days[0] = { ...value.days[0], careStart: "", careEnd: "" };
    expect(coverage(value)[0].missing).toBeNull();
  });
  it("supports weekend work without including unchecked days", () => {
    const value = profile();
    value.days[0].active = false;
    value.days[6].active = true;
    expect(coverage(value).map((row) => row.day)).toEqual([6]);
  });
  it("rejects partial times, overnight shifts, impossible dates and empty weeks", () => {
    const partial = profile();
    partial.days[0].careStart = "";
    expect(profileSchema.safeParse(partial).success).toBe(false);
    const night = profile();
    night.days[0].workEnd = "02:00";
    expect(profileSchema.safeParse(night).success).toBe(false);
    const crossing = profile();
    crossing.days[0].workStart = "00:10";
    expect(profileSchema.safeParse(crossing).success).toBe(false);
    expect(
      profileSchema.safeParse({ ...profile(), returnDate: "2026-02-30" })
        .success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({
        ...profile(),
        days: profile().days.map((row) => ({ ...row, active: false })),
      }).success,
    ).toBe(false);
  });
});
describe("return-to-work plan and exports", () => {
  it("keeps fictional examples identified after saving and exporting", () => {
    const plan = createWorkPlan(profile(), id, now, true);
    expect(parseWorkPlan(JSON.stringify(plan)).fromExample).toBe(true);
    expect(employerBrief(plan, ["hours"])).toContain("EXEMPLE À ADAPTER");
    expect(exportWorkCalendar(plan, now)).toContain("SUMMARY:[Exemple]");
  });
  it("uses calendar days across a month and clamps past suggestions to today", () => {
    const plan = createWorkPlan(
      { ...profile(), returnDate: "2026-09-14" },
      id,
      now,
    );
    expect(plan.actions.map((action) => action.date)).toEqual([
      "2026-09-13",
      "2026-09-13",
      "2026-09-13",
      "2026-09-13",
      "2026-09-21",
      "2026-10-14",
    ]);
    expect(plan.actions.map((action) => action.id)).toEqual(ACTION_IDS);
  });
  it("handles leap day with calendar arithmetic", () => {
    const plan = createWorkPlan(
      { ...profile(), returnDate: "2028-03-07" },
      id,
      new Date("2028-02-01T12:00:00Z"),
    );
    expect(plan.actions.find((action) => action.id === "backup")?.date).toBe(
      "2028-02-29",
    );
  });
  it("limits the professional brief to explicitly selected topics and the date", () => {
    const plan = createWorkPlan(profile(), id, now);
    plan.actions[0].done = true;
    const brief = employerBrief(plan, ["training"]);
    expect(brief).toContain("11/10/2026");
    expect(brief).toContain("formation");
    for (const privateValue of [
      "17:30",
      "17 h",
      "30 minutes",
      "Lundi",
      "relai",
      "[fait]",
      "prime",
      "dispositifs",
      "Horaires, déplacements",
    ])
      expect(brief).not.toContain(privateValue);
  });
  it("exports only unfinished actions with stable UIDs, all-day ends and UTF-8 folding", () => {
    const plan = createWorkPlan(profile(), id, now);
    plan.actions[0].done = true;
    const calendar = exportWorkCalendar(plan, now);
    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(5);
    expect(calendar).not.toContain(`${id}-care@`);
    expect(calendar).toContain(`${id}-meeting@darons.app`);
    expect(calendar).toContain(
      "DTSTART;VALUE=DATE:20260927\r\nDTEND;VALUE=DATE:20260928",
    );
    expect(calendar).not.toMatch(/ATTENDEE|VALARM|METHOD:REQUEST/);
    for (const line of calendar.split("\r\n"))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(calendar).not.toContain("17:30");
  });
  it("round trips a valid plan and rejects oversized or injected backups", () => {
    const plan = createWorkPlan(profile(), id, now);
    expect(parseWorkPlan(JSON.stringify(plan))).toEqual(plan);
    expect(() => parseWorkPlan(" ".repeat(MAX_REPRISE_BYTES + 1))).toThrow(
      "24 Ko",
    );
    expect(() => parseWorkPlan("not JSON")).toThrow("incompatible");
    expect(() =>
      parseWorkPlan(
        JSON.stringify({ ...plan, employerUrl: "javascript:alert(1)" }),
      ),
    ).toThrow();
    expect(() =>
      parseWorkPlan(
        JSON.stringify({
          ...plan,
          actions: plan.actions.map(() => plan.actions[0]),
        }),
      ),
    ).toThrow();
    const duplicated = profile();
    duplicated.days[1].day = 0;
    expect(profileSchema.safeParse(duplicated).success).toBe(false);
    expect(
      workPlanSchema.safeParse({
        ...plan,
        profile: { ...plan.profile, topics: ["hours", "hours"] },
      }).success,
    ).toBe(false);
  });
});
