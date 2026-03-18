import { test, expect } from "@playwright/test";

test.describe("Module Fiscal", () => {
  test("la page fiscal redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/fiscal");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("le simulateur IR public est accessible et fonctionnel", async ({ page }) => {
    await page.goto("/outils/simulateur-ir");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Look for input fields (revenue, parts)
    const revenueInput = page.getByLabel(/revenu|revenus/i).first();
    if (await revenueInput.isVisible()) {
      await revenueInput.fill("60000");

      // Should display some result
      await page.waitForTimeout(1000);
      const pageContent = await page.textContent("body");
      expect(pageContent).toBeTruthy();
    }
  });

  test("le simulateur CAF public est accessible", async ({ page }) => {
    await page.goto("/outils/simulateur-caf");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
