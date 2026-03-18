import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("charge et affiche les éléments principaux", async ({ page }) => {
    await page.goto("/");

    // Titre principal
    await expect(page.locator("h1")).toBeVisible();

    // Les 4 piliers sont affichés
    await expect(page.getByText("Santé & vaccins")).toBeVisible();
    await expect(page.getByText("Éducation & développement")).toBeVisible();
    await expect(page.getByText("Foyer fiscal")).toBeVisible();
    await expect(page.getByText("Budget familial")).toBeVisible();

    // CTA inscription visible
    await expect(page.getByRole("link", { name: /créer|inscription|commencer/i })).toBeVisible();
  });

  test("affiche la section pricing", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Gratuit")).toBeVisible();
    await expect(page.getByText("Premium")).toBeVisible();
    await expect(page.getByText("Family Pro")).toBeVisible();
  });
});
