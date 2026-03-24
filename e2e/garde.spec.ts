import { test, expect } from "@playwright/test";

test.describe("Module Garde", () => {
  test("la page garde redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/garde");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("le simulateur de garde est fonctionnel", async ({ page }) => {
    await page.goto("/outils/simulateur-garde");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should display garde options
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/crèche|assistante|maternelle|garde/i);
  });

  test("le guide des droits sociaux est accessible", async ({ page }) => {
    await page.goto("/outils/mes-droits");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should display social rights information
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/droit|allocation|prestation/i);
  });
});
