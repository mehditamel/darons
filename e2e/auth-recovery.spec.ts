import { test, expect } from "@playwright/test";

test("an account service outage leaves public tools reachable", async ({ page }) => {
  await page.goto("/login?error=unavailable&next=%2Fdocuments");
  await expect(page.getByRole("alert").filter({ hasText: "temporairement indisponible" })).toBeVisible();
  await page.getByRole("link", { name: "Accéder aux outils gratuits" }).click();
  await expect(page).toHaveURL(/\/outils$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("an expired recovery link returns to a useful recovery form", async ({ page }) => {
  await page.goto("/callback?next=/update-password");
  await expect(page).toHaveURL(/\/reset-password\?error=expired$/);
  await expect(page.getByRole("alert").filter({ hasText: "Ce lien a expiré" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Envoyer le lien", exact: true })).toBeVisible();
});

test("the password change form requires a valid session", async ({ page }) => {
  await page.goto("/update-password");
  await expect(page).toHaveURL(/\/reset-password\?error=expired$/);
  await expect(page.getByLabel("Adresse email")).toBeVisible();
});

test("private links preserve their destination through login", async ({ page }) => {
  await page.goto("/documents?category=identity");
  await expect(page).toHaveURL(/\/login\?next=/);
  expect(new URL(page.url()).searchParams.get("next")).toBe("/documents?category=identity");
});

test("invalid authentication links explain how to try again", async ({ page }) => {
  await page.goto("/callback?next=https://evil.example");
  await expect(page).toHaveURL(/\/login\?error=auth$/);
  await expect(page.getByRole("alert").filter({ hasText: "Ce lien de connexion est invalide" })).toBeVisible();
});
