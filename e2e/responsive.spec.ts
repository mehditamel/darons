import { test, expect } from "@playwright/test";

test.describe("Responsive & mobile", () => {
  test("la landing page s'affiche correctement sur mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.locator("h1")).toBeVisible();
    // CTA should still be visible
    await expect(page.getByRole("link", { name: /créer|inscription|commencer/i })).toBeVisible();
  });

  test("la page login s'affiche correctement sur mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /connexion|se connecter/i })).toBeVisible();
  });

  test("le blog s'affiche correctement sur mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/blog");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Articles should be stacked vertically on mobile
    const cards = page.locator("article, [class*='card'], a[href*='/blog/']");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("les outils gratuits sont accessibles sur mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/outils");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
