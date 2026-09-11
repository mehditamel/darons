import { describe, expect, it } from "vitest";
import { filterTools } from "@/lib/tool-search";
import { SECTIONS, TOTAL_TOOLS } from "@/lib/tools-catalog";

describe("public tool discovery", () => {
  it("matches accents, case and words across the title and description", () => {
    expect(filterTools("  COUT   creche ").map((tool) => tool.href)).toContain("/outils/simulateur-garde");
    expect(filterTools("IMPÔT")).toEqual(filterTools("impot"));
  });
  it("combines category and text filters", () => {
    expect(filterTools("budget", "Santé")).toEqual([]);
    expect(filterTools("", "Santé")).toEqual(SECTIONS.find((section) => section.title === "Santé")?.tools);
  });
  it("restores the full catalogue for a blank query", () => {
    expect(filterTools("   ")).toHaveLength(TOTAL_TOOLS);
    expect(new Set(filterTools("").map((tool) => tool.href)).size).toBe(TOTAL_TOOLS);
  });
});
