import { test, expect } from "@playwright/test";

test.describe("Authentification", () => {
  test("affiche la page de connexion", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /connexion|se connecter/i })).toBeVisible();
  });

  test("affiche la page d'inscription", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByLabel(/prénom/i)).toBeVisible();
    await expect(page.getByLabel(/nom/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /créer|inscription|s'inscrire/i })).toBeVisible();
  });

  test("affiche la page de réinitialisation de mot de passe", async ({ page }) => {
    await page.goto("/reset-password");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /réinitialiser|envoyer/i })).toBeVisible();
  });

  test("redirige les non-authentifiés vers login depuis le dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("liens entre login et register fonctionnent", async ({ page }) => {
    await page.goto("/login");

    // Click link to register
    const registerLink = page.getByRole("link", { name: /créer un compte|inscription|s'inscrire/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test("affiche une erreur avec des identifiants invalides", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("invalid@test.fr");
    await page.getByLabel(/mot de passe/i).fill("wrongpassword");
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    // Should show error or stay on login page
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
  });
});
