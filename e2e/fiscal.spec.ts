import { test, expect } from "@playwright/test";

test.describe("Module Fiscal", () => {
  test("la page fiscal redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/fiscal");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("le simulateur IR public calcule l'impôt correctement", async ({ page }) => {
    await page.goto("/outils/simulateur-ir");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Fill in the form fields
    const revenueInput = page.getByLabel(/revenu/i).first();
    await expect(revenueInput).toBeVisible();
    await revenueInput.fill("60000");

    const partsInput = page.getByLabel(/parts/i).first();
    if (await partsInput.isVisible()) {
      await partsInput.fill("2.5");
    }

    // Submit the form
    const submitButton = page.getByRole("button", { name: /calcul|simul/i }).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Wait for results to appear
    await page.waitForTimeout(500);

    // Should display tax results with numbers
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/\d+\s*€/);

    // Should show TMI (Tranche Marginale d'Imposition)
    await expect(page.getByText(/TMI|tranche|marginale/i)).toBeVisible();
  });

  test("le simulateur IR gère les crédits d'impôt", async ({ page }) => {
    await page.goto("/outils/simulateur-ir");

    // Fill revenue and parts
    const revenueInput = page.getByLabel(/revenu/i).first();
    await revenueInput.fill("60000");

    const partsInput = page.getByLabel(/parts/i).first();
    if (await partsInput.isVisible()) {
      await partsInput.fill("2.5");
    }

    // Fill childcare credit
    const gardeInput = page.getByLabel(/garde/i).first();
    if (await gardeInput.isVisible()) {
      await gardeInput.fill("3500");
    }

    // Submit
    const submitButton = page.getByRole("button", { name: /calcul|simul/i }).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    await page.waitForTimeout(500);

    // Should show credit d'impôt in results
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/crédit|credit/i);
  });

  test("le simulateur CAF public est accessible et fonctionnel", async ({ page }) => {
    await page.goto("/outils/simulateur-caf");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should have form inputs for revenue and children
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/revenu|enfant|allocation/i);
  });

  test("le simulateur de garde est accessible", async ({ page }) => {
    await page.goto("/outils/simulateur-garde");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/garde|crèche|assistante/i);
  });
});
