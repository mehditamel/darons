import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SECTIONS } from "../src/lib/tools-catalog";

const routes = ["/", "/demo", "/login", "/register", "/reset-password", "/reset-password?error=expired", "/outils", "/outils/guide-vaccins-obligatoires", "/blog/calendrier-vaccinal-2025", "/newsletter/confirmer", "/newsletter/desinscription", ...SECTIONS.flatMap((section) => section.tools.map((tool) => tool.href))];

for (const colorScheme of ["light", "dark"] as const) {
  for (const route of routes) {
    test(`${colorScheme}: ${route} remains accessible`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      if (route === "/outils/calendrier-vaccinal") {
        await page.getByLabel("Date de naissance de l'enfant").fill("2025-01-15");
        await expect(page.getByRole("heading", { name: "Calendrier personnalisé" })).toBeVisible();
      }
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const failures = violations.filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => ({ rule: v.id, nodes: v.nodes.map((n) => ({ target: n.target, html: n.html, reason: n.failureSummary })) }));
      expect(failures).toEqual([]);
      await expect(page.locator("a button, button a")).toHaveCount(0);
    });
  }
}

test("public tools remain usable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  for (const route of SECTIONS.flatMap((section) => section.tools.map((tool) => tool.href))) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), route).toBe(true);
  }
});
