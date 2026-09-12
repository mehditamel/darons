import { describe, expect, it } from "vitest";
import { format } from "date-fns";
import { publicVaccinationDates } from "@/lib/public-vaccination";

const today = new Date(2026, 8, 12);
describe("public infant vaccination dates", () => {
  it("includes the current ACWY and B schedule without substituting the historical C schedule", () => {
    const { dates } = publicVaccinationDates("2025-01-15", today);
    expect(dates?.filter((d) => d.vaccineCode === "MenACWY").map((d) => format(d.scheduledDate, "yyyy-MM-dd"))).toEqual(["2025-07-15", "2026-01-15"]);
    expect(dates?.filter((d) => d.vaccineCode === "MenB").map((d) => format(d.scheduledDate, "yyyy-MM-dd"))).toEqual(["2025-04-15", "2025-06-15", "2026-01-15"]);
    expect(dates?.some((d) => d.vaccineCode === "MenC")).toBe(false);
  });
  it.each(["2025-02-30", "invalid", "2027-01-01", "2020-01-01"])("does not fabricate a calendar for %s", (birth) => {
    const result = publicVaccinationDates(birth, today);
    expect(result.dates).toBeNull();
    expect(result.error).toBeTruthy();
  });
  it("handles short months in local calendar dates", () => {
    const { dates } = publicVaccinationDates("2025-11-30", today);
    expect(format(dates!.find((d) => d.vaccineCode === "MenB")!.scheduledDate, "yyyy-MM-dd")).toBe("2026-02-28");
  });
  it("preserves the ROR age range instead of presenting a single mandatory day", () => {
    const { dates } = publicVaccinationDates("2025-01-15", today);
    expect(dates?.find((d) => d.vaccineCode === "ROR" && d.doseNumber === 2)?.label).toBe("16-18 mois");
  });
});
