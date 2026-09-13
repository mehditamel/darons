import { test, expect } from "@playwright/test";

test.describe("Onboarding", () => {
  test("la page d'onboarding est accessible", async ({ page }) => {
    await page.goto("/onboarding");

    // Should either show onboarding or redirect to login
    await page.waitForURL(/\/(onboarding|login)/, { timeout: 10000 });
  });

  test("la page register contient un lien vers les CGU", async ({ page }) => {
    await page.goto("/register");

    const cguLink = page.getByRole("link", { name: /conditions|cgu/i });
    await expect(cguLink).toHaveAttribute("href", /\/cgu/);
  });

  test("le formulaire d'inscription valide les champs requis", async ({ page }) => {
    await page.goto("/register");

    // Try submitting empty form
    await page.getByRole("button", { name: "Créer mon compte gratuit", exact: true }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();

    // Form should not navigate away (validation errors)
    await expect(page).toHaveURL(/\/register/);
  });
});
