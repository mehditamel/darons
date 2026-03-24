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

  test("le calendrier vaccinal public affiche les vaccins obligatoires", async ({ page }) => {
    await page.goto("/outils/calendrier-vaccinal");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should display vaccine names
    await expect(page.getByText(/DTPCa|Diphtérie/i)).toBeVisible();
    await expect(page.getByText(/ROR|Rougeole/i)).toBeVisible();
    await expect(page.getByText(/Hépatite B/i)).toBeVisible();
  });

  test("la courbe de croissance public est fonctionnelle", async ({ page }) => {
    await page.goto("/outils/courbe-croissance");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should have growth-related content
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/poids|taille|croissance|percentile/i);
  });

  test("les examens de santé obligatoires sont listés", async ({ page }) => {
    await page.goto("/outils/examens-sante");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should list the 20 mandatory exams
    const bodyText = await page.textContent("body");
    expect(bodyText).toMatch(/examen|obligatoire/i);
  });

  test("les numéros d'urgence sont affichés", async ({ page }) => {
    await page.goto("/outils/numeros-urgence");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should display emergency numbers
    await expect(page.getByText(/15|SAMU/i)).toBeVisible();
    await expect(page.getByText(/112/)).toBeVisible();
  });
});
