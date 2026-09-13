import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const theme of ["light", "dark"] as const) {
  test(`a parent can try a handoff and reach registration in ${theme} mode`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/outils");
    await page
      .getByRole("link", { name: "Essayer un passage de relais", exact: true })
      .click();
    await expect(page).toHaveURL(/\/#quotidien$/);
    const demo = page.locator(".handoff-demo");
    const preview = demo.getByRole("region", {
      name: "Ce que le proche verrait",
    });
    await expect(
      preview.getByRole("heading", { name: "Notes & routines" }),
    ).toBeVisible();
    const routines = demo.getByRole("checkbox", {
      name: "Notes & routines",
      exact: true,
    });
    const identity = demo.getByRole("checkbox", {
      name: "Identité complète",
      exact: true,
    });
    await routines.focus();
    await routines.press("Space");
    await expect(routines).not.toBeChecked();
    await expect(
      preview.getByRole("heading", { name: "Notes & routines" }),
    ).toHaveCount(0);
    await expect(identity).toBeDisabled();
    await expect(
      preview.getByText("Lou · née le 12 mars 2025", { exact: true }),
    ).toBeVisible();
    await routines.press("Space");
    await expect(identity).toBeEnabled();
    await identity.uncheck();
    await expect(
      preview.getByRole("heading", { name: "Identité", exact: true }),
    ).toHaveCount(0);
    await expect(routines).toBeDisabled();
    await demo
      .getByLabel("Durée d’accès dans cet exemple")
      .selectOption("24 heures");
    await expect(preview.getByText("24 heures", { exact: true })).toBeVisible();
    await expect(demo.getByRole("status")).toHaveText(
      "1 rubrique visible · durée choisie : 24 heures",
    );
    await expect(demo.getByText(/Aucun lien créé ni envoyé/)).toBeVisible();
    // A public demonstration must not retain family data or create a share.
    expect(
      await page.evaluate(() =>
        Object.keys(localStorage).filter((key) => key !== "theme"),
      ),
    ).toEqual([]);
    const audit = await new AxeBuilder({ page })
      .include(".family-tour")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      audit.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await page
      .getByRole("tabpanel")
      .getByRole("link", { name: "Créer le carnet de mon enfant", exact: true })
      .click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Crée l’espace de ton enfant",
    );
    await expect(
      page.getByText(/Après confirmation de ton email/),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Créer mon compte gratuit",
        exact: true,
      }),
    ).toBeVisible();
  });
}

test("the public example remains honest without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/#quotidien");
    const demo = page.locator(".handoff-demo");
    await expect(
      demo.getByText(/Active JavaScript pour modifier/),
    ).toBeVisible();
    await expect(
      demo.getByRole("checkbox", { name: "Notes & routines", exact: true }),
    ).toBeDisabled();
    await expect(
      demo.getByRole("region", { name: "Ce que le proche verrait" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("tabpanel")
        .getByRole("link", {
          name: "Créer le carnet de mon enfant",
          exact: true,
        }),
    ).toHaveAttribute("href", "/register");
  } finally {
    await context.close();
  }
});
