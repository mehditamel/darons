import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility smoke test (WCAG 2.1 AA).
 *
 * Scans a representative subset of *public* routes with axe-core and fails on
 * any violation of `serious` or `critical` impact. These pages exercise the
 * shared design primitives touched by the design pass — Card, Button, Badge,
 * PageHeader, EmptyState — plus the global colour tokens and contrast.
 *
 * Dashboard routes (sante, budget, identite…) require authentication and
 * redirect unauthenticated visitors to /login, so they cannot be scanned
 * headlessly here; their primitives are nonetheless covered through these
 * public pages, which consume the exact same tokens and components.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const BLOCKING_IMPACTS = ["serious", "critical"];

const PUBLIC_ROUTES = [
  { path: "/", name: "landing" },
  { path: "/login", name: "login" },
  { path: "/register", name: "register" },
  { path: "/outils", name: "outils-hub" },
  { path: "/outils/calendrier-vaccinal", name: "outils-calendrier-vaccinal" },
  { path: "/outils/simulateur-ir", name: "outils-simulateur-ir" },
  { path: "/outils/courbe-croissance", name: "outils-courbe-croissance" },
  { path: "/outils/numeros-urgence", name: "outils-numeros-urgence" },
  { path: "/mentions-legales", name: "mentions-legales" },
] as const;

test.describe("Accessibilité (axe smoke)", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} — aucune violation serious/critical`, async ({ page }) => {
      // Render entrance animations at their final state so axe never samples a
      // mid-fade (transient low-opacity) frame — deterministic contrast checks.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(300);

      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact && BLOCKING_IMPACTS.includes(v.impact)
      );

      if (blocking.length > 0) {
        // Surface a readable summary in the test output.
        const summary = blocking
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))\n    ${v.nodes
                .map((n) => n.target.join(" "))
                .slice(0, 5)
                .join("\n    ")}`
          )
          .join("\n");
        console.error(`Violations a11y sur ${route.path}:\n${summary}`);
      }

      expect(blocking, `Violations a11y serious/critical sur ${route.path}`).toEqual([]);
    });
  }
});
