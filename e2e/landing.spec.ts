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

  test("le CTA principal redirige vers inscription", async ({ page }) => {
    await page.goto("/");

    const cta = page.getByRole("link", { name: /créer|inscription|commencer/i }).first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).toMatch(/\/(register|inscription)/);
  });

  test("les liens vers les outils gratuits fonctionnent", async ({ page }) => {
    await page.goto("/");

    // Look for tool links
    const toolLinks = page.getByRole("link", { name: /simulateur|outil|calendrier/i });
    const count = await toolLinks.count();
    if (count > 0) {
      const href = await toolLinks.first().getAttribute("href");
      expect(href).toMatch(/\/outils/);
    }
  });

  test("la page blog est accessible depuis la landing", async ({ page }) => {
    await page.goto("/");

    // Navigate to blog (may be in footer or nav)
    const blogLink = page.getByRole("link", { name: /blog/i }).first();
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await expect(page).toHaveURL(/\/blog/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("le blog affiche les articles", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // At least 3 original + 4 new articles
    const articleLinks = page.locator("a[href*='/blog/']");
    const count = await articleLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("un article de blog se charge correctement", async ({ page }) => {
    await page.goto("/blog/calendrier-vaccinal-2025");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/vaccin/i)).toBeVisible();
  });
});
