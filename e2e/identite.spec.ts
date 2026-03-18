import { test, expect } from "@playwright/test";

test.describe("Module Identité & Documents", () => {
  test("la page identité redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/identite");

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("la page documents redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/documents");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });
});
