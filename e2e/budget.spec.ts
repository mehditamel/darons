import { test, expect } from "@playwright/test";

test.describe("Module Budget", () => {
  test("la page budget redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/budget");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("la page dépenses partagées redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/depenses-partagees");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("le simulateur budget public est accessible et fonctionnel", async ({ page }) => {
    await page.goto("/outils/simulateur-budget");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should have budget-related content
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/budget|dépense|revenu/i);
  });

  test("l'outil combien coûte un enfant est fonctionnel", async ({ page }) => {
    await page.goto("/outils/combien-coute-enfant");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should display cost categories
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/coût|alimentation|garde|santé/i);
  });
});
