import { test, expect } from "@playwright/test";

const token = "a".repeat(64);
for (const action of ["confirm", "unsubscribe"] as const) {
  test(`newsletter ${action} requires an explicit action`, async ({ page }) => {
    let submissions = 0;
    await page.route("**/api/newsletter/manage", async (route) => {
      submissions++;
      expect(route.request().method()).toBe("POST");
      expect(route.request().postDataJSON()).toEqual({ token, action });
      await route.fulfill({ json: { success: true } });
    });
    await page.goto(`/newsletter/${action === "confirm" ? "confirmer" : "desinscription"}?token=${token}`);
    const submit = page.getByRole("button", { name: action === "confirm" ? "Confirmer mon inscription" : "Me désinscrire", exact: true });
    await expect(submit).toBeVisible();
    expect(submissions).toBe(0);
    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content", "no-referrer");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await submit.click();
    await expect(page.getByRole("status").filter({ hasText: action === "confirm" ? "Ton inscription est confirmée" : "Tu es désinscrit" })).toBeVisible();
    expect(submissions).toBe(1);
    await expect(submit).toHaveCount(0);
  });
}

test("newsletter confirmation shows expiry without claiming success", async ({ page }) => {
  await page.route("**/api/newsletter/manage", route => route.fulfill({ status: 400, json: { error: "Ce lien a expiré. Demande un nouveau lien." } }));
  await page.goto(`/newsletter/confirmer?token=${token}`);
  await page.getByRole("button", { name: "Confirmer mon inscription", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Ce lien a expiré" })).toBeVisible();
  await expect(page.getByText("Ton inscription est confirmée", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Revenir aux articles" })).toHaveAttribute("href", "/blog");
});

test("newsletter missing token offers recovery without a submit button", async ({ page }) => {
  await page.goto("/newsletter/desinscription");
  await expect(page.getByRole("alert").filter({ hasText: "Ce lien est incomplet ou invalide" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Me désinscrire", exact: true })).toHaveCount(0);
});
