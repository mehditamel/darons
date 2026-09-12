// @vitest-environment node
import { describe, expect, it } from "vitest";
import { csvCell } from "@/lib/csv";

describe("spreadsheet export cells", () => {
  it("quotes punctuation, quotes and line breaks", () => {
    expect(csvCell('Élodie, "Parent"\nDeuxième ligne')).toBe('"Élodie, ""Parent""\nDeuxième ligne"');
  });
  it.each(["=1+1", "+SUM(A1)", "-1+2", "@SUM(A1)", " \t=1+1"])("neutralizes a formula-like text value", (value) => {
    expect(csvCell(value)).toBe(`"'${value}"`);
  });
  it("preserves numeric negatives and empty values", () => {
    expect(csvCell(-12.5)).toBe('"-12.5"');
    expect(csvCell(null)).toBe('""');
  });
});
