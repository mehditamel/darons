import { test, expect } from "@playwright/test";

test.describe("Mode démo public", () => {
  test("est accessible sans authentification", async ({ page }) => {
    await page.goto("/demo");

    // Pas de redirection vers /login
    await expect(page).toHaveURL(/\/demo$/);

    // Bandeau démo visible
    await expect(page.getByText(/Mode démo/i)).toBeVisible();

    // Données fictives affichées (le foyer Démo)
    await expect(page.getByText("Matis")).toBeVisible();

    // CTA d'inscription présent
    await expect(
      page.getByRole("link", { name: /inscris|créer mon foyer/i }).first()
    ).toBeVisible();
  });

  test("est accessible depuis la landing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /démo du tableau de bord/i }).click();
    await expect(page).toHaveURL(/\/demo$/);
  });
});
