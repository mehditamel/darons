import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("theme toggle follows the system preference and remembers a choice", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page
    .getByRole("button", { name: "Passer au mode clair", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(
    page.getByRole("button", { name: "Passer au mode sombre", exact: true }),
  ).toBeVisible();
});

for (const width of [320, 1440]) {
  for (const theme of ["light", "dark"] as const) {
    test(`family pages remain readable at ${width}px in ${theme} mode`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );

      for (const route of ["/", "/login", "/register", "/outils", "/demo"]) {
        await page.goto(route);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.locator("html")).toHaveClass(new RegExp(theme));
        const images = page.locator(
          'img[src*="family"], img[src*="%2Ffamily%2F"]',
        );
        for (const image of await images.all()) {
          if (await image.isVisible()) {
            await image.scrollIntoViewIfNeeded();
            await expect
              .poll(() =>
                image.evaluate(
                  (node: HTMLImageElement) =>
                    node.complete && node.naturalWidth > 0,
                ),
              )
              .toBe(true);
          }
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
          route,
        ).toBe(true);
        await expect(page.locator("a button, button a")).toHaveCount(0);

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        const violations = results.violations.filter((item) =>
          ["serious", "critical"].includes(item.impact ?? ""),
        );
        expect(
          violations.map((item) => ({
            id: item.id,
            nodes: item.nodes.map((node) => ({
              target: node.target,
              summary: node.failureSummary,
            })),
          })),
          route,
        ).toEqual([]);
        expect(
          await page
            .locator(".family-site, .family-auth, .family-welcome")
            .evaluateAll(
              (roots) =>
                roots
                  .flatMap((root) => root.getAnimations({ subtree: true }))
                  .filter((animation) => animation.playState === "running")
                  .length,
            ),
        ).toBe(0);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: testInfo.outputPath(
            `${route === "/" ? "home" : route.slice(1)}-${width}-${theme}.png`,
          ),
          fullPage: false,
        });
      }
    });
  }
}

test("home remains usable without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 375, height: 900 },
  });
  const page = await context.newPage();
  try {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByTestId("hero").getByRole("link", {
        name: "Créer le carnet de mon enfant",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Santé & vaccins", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  } finally {
    await context.close();
  }
});

for (const width of [320, 1440]) {
  test(`the family tour supports keyboard exploration at ${width}px`, async ({
    page,
    request,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
    await page.goto("/");
    const tour = page.getByRole("region", {
      name: "Trois moments où tu seras content de l’avoir.",
    });
    const health = tour.getByRole("tab", {
      name: "Je passe le relais",
      exact: true,
    });
    await health.focus();
    await expect(health).toHaveAttribute("aria-selected", "true");
    await health.press("ArrowRight");
    const budget = tour.getByRole("tab", {
      name: "Je prépare un RDV",
      exact: true,
    });
    await expect(budget).toBeFocused();
    await expect(budget).toHaveAttribute("aria-selected", "true");
    await expect(
      tour.getByRole("heading", {
        name: "Chez le pédiatre, tu retrouves le fil.",
      }),
    ).toBeVisible();
    await budget.press("End");
    await expect(
      tour.getByRole("tab", { name: "Je retrouve un papier", exact: true }),
    ).toBeFocused();
    await expect(
      tour.getByRole("heading", {
        name: "La crèche demande un papier. Tu sais où il est.",
      }),
    ).toBeVisible();

    for (const name of [
      "Je passe le relais",
      "Je prépare un RDV",
      "Je retrouve un papier",
    ]) {
      await tour.getByRole("tab", { name, exact: true }).click();
      const panel = tour.getByRole("tabpanel");
      await expect(panel).toBeVisible();
      await expect(
        name === "Je passe le relais"
          ? panel.getByText(/Données fictives. Aucun lien créé/)
          : panel.getByText("Aperçu illustratif · données fictives"),
      ).toBeVisible();
      const href = await panel.getByRole("link").getAttribute("href");
      expect((await request.get(href!)).ok()).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const audit = await new AxeBuilder({ page })
        .include(".family-tour")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        audit.violations.filter((v) =>
          ["serious", "critical"].includes(v.impact ?? ""),
        ),
      ).toEqual([]);
    }
    await health.click();
    await tour.screenshot({
      path: testInfo.outputPath(`tour-${width}-light.png`),
    });
  });
}

test("decorative entrance animations settle without looping", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByTestId("hero").getByRole("heading", { level: 1 }),
  ).toBeVisible();
  await expect
    .poll(
      () =>
        page
          .getByTestId("hero")
          .evaluate(
            (root) =>
              root
                .getAnimations({ subtree: true })
                .filter((animation) => animation.playState === "running")
                .length,
          ),
      { timeout: 7000 },
    )
    .toBe(0);
  await expect(
    page
      .getByTestId("hero")
      .getByRole("link", { name: "Essayer un passage de relais", exact: true }),
  ).toBeVisible();
});
