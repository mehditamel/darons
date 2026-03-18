import { test, expect } from "@playwright/test";

test.describe("Module Santé", () => {
  test("la page santé redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/sante");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("la page santé enrichie redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/sante-enrichie");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("l'outil calendrier vaccinal public est accessible", async ({ page }) => {
    await page.goto("/outils/calendrier-vaccinal");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Should display vaccine information
    await expect(page.getByText(/vaccin/i)).toBeVisible();
  });
});
