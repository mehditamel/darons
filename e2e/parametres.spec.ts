import { test, expect } from "@playwright/test";

test.describe("Paramètres & RGPD", () => {
  test("la page paramètres redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/parametres");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("la politique de confidentialité est accessible", async ({ page }) => {
    await page.goto("/politique-confidentialite");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/données personnelles|RGPD|confidentialité/i)).toBeVisible();
  });

  test("les CGU sont accessibles", async ({ page }) => {
    await page.goto("/cgu");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("les mentions légales sont accessibles", async ({ page }) => {
    await page.goto("/mentions-legales");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
