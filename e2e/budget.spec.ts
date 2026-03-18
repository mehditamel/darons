import { test, expect } from "@playwright/test";

test.describe("Module Budget", () => {
  test("la page budget redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/budget");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("la page dépenses partagées redirige les non-authentifiés", async ({ page }) => {
    await page.goto("/depenses-partagees");

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });
});
