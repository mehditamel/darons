import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { REPRISE_STORAGE_NAME } from "../src/lib/return-to-work/plan";

async function example(page: import("@playwright/test").Page) {
  await page.goto("/outils/reprise-travail");
  await page.getByRole("button", { name: "Essayer avec un exemple" }).click();
  await page
    .getByRole("button", { name: "Voir mon bilan et mon plan" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Ta reprise du/ }),
  ).toBeFocused();
}
test("a parent gets a concrete coverage result, can save progress and prepare a separate work brief", async ({
  page,
}) => {
  await example(page);
  await expect(
    page.getByText("5 journée(s) demandent un ajustement.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("De 17 h 00 à 18 h 00", { exact: true }),
  ).toHaveCount(5);
  expect(
    await page.evaluate(
      (name) => localStorage.getItem(name),
      REPRISE_STORAGE_NAME,
    ),
  ).toBeNull();
  await page
    .getByRole("checkbox", { name: "Résoudre les créneaux non couverts" })
    .check();
  await page
    .getByRole("checkbox", { name: "Enregistrer ce parcours sur cet appareil" })
    .check();
  await page.reload();
  await expect(
    page.getByText("Parcours issu d’un exemple fictif.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Résoudre les créneaux non couverts" }),
  ).toBeChecked();
  await page
    .getByRole("checkbox", {
      name: "Horaires, déplacements et réunions",
      exact: true,
    })
    .uncheck();
  const brief = page.getByLabel("Aperçu du document professionnel");
  await expect(brief).not.toContainText("Horaires, déplacements");
  await expect(brief).not.toContainText("17 h");
  await expect(brief).not.toContainText("Lundi");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Ajouter les étapes à mon agenda" })
    .click();
  const calendar = await readFile((await (await download).path())!, "utf8");
  expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(5);
  expect(calendar).not.toMatch(/ATTENDEE|VALARM/);
});
test("unknown care and invalid hours never look like a confirmed solution", async ({
  page,
}) => {
  await page.goto("/outils/reprise-travail");
  await page
    .getByRole("button", { name: "Voir mon bilan et mon plan" })
    .click();
  await expect(page.locator(".reprise").getByRole("alert")).toContainText(
    "Choisis une date",
  );
  await page.getByRole("button", { name: "Essayer avec un exemple" }).click();
  await page
    .getByLabel("Lundi : fin du travail", { exact: true })
    .fill("02:00");
  await page
    .getByRole("button", { name: "Voir mon bilan et mon plan" })
    .click();
  await expect(page.locator(".reprise").getByRole("alert")).toContainText(
    "une même journée",
  );
  await page
    .getByLabel("Lundi : fin du travail", { exact: true })
    .fill("17:30");
  await page.getByLabel("Lundi : début de garde", { exact: true }).fill("");
  await page.getByLabel("Lundi : fin de garde", { exact: true }).fill("");
  await page
    .getByRole("button", { name: "Appliquer ces horaires aux jours cochés" })
    .click();
  await page.getByLabel("Ta solution de garde").selectOption("searching");
  await page
    .getByRole("button", { name: "Voir mon bilan et mon plan" })
    .click();
  await expect(
    page.getByText("Complète les horaires manquants avant de conclure."),
  ).toBeVisible();
  await expect(
    page.getByText("Horaires de garde à préciser", { exact: true }),
  ).toHaveCount(5);
  await expect(
    page.getByRole("checkbox", { name: "Identifier une solution de garde" }),
  ).toBeVisible();
});
test("backup import requires confirmation and rejects unknown content", async ({
  page,
}) => {
  await example(page);
  const saved = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Sauvegarder mon parcours", exact: true })
    .click();
  const contents = await readFile((await (await saved).path())!);
  const input = page.getByLabel("Sauvegarde de reprise à importer");
  await input.setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1,"url":"javascript:alert(1)"}'),
  });
  await expect(page.locator(".reprise").getByRole("alert")).toContainText(
    "incompatible",
  );
  await expect(
    page.getByRole("heading", { name: /Ta reprise du/ }),
  ).toBeVisible();
  await input.setInputFiles({
    name: "reprise.json",
    mimeType: "application/json",
    buffer: contents,
  });
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Ta reprise du/ }),
  ).toBeVisible();
  await input.setInputFiles({
    name: "reprise.json",
    mimeType: "application/json",
    buffer: contents,
  });
  await page
    .getByRole("button", { name: "Charger le parcours", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Ta reprise du/ }),
  ).toBeFocused();
});
test("clipboard failures provide a file and reset is confirmed and scoped", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("denied")) },
    });
    localStorage.setItem("unrelated-test", "preserve");
  });
  await example(page);
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Copier mon document professionnel" })
    .click();
  expect((await pending).suggestedFilename()).toBe(
    "darons-echange-professionnel.txt",
  );
  await expect(page.locator(".reprise").getByRole("status")).toContainText(
    "Aucun message n’a été envoyé",
  );
  await page
    .getByRole("checkbox", { name: "Enregistrer ce parcours sur cet appareil" })
    .check();
  await page
    .getByRole("button", { name: "Effacer mon parcours", exact: true })
    .click();
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Ta reprise du/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Effacer mon parcours", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Effacer ce parcours", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Voir mon bilan et mon plan" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (name) => localStorage.getItem(name),
      REPRISE_STORAGE_NAME,
    ),
  ).toBeNull();
  expect(
    await page.evaluate(() => localStorage.getItem("unrelated-test")),
  ).toBe("preserve");
});
for (const width of [320, 1440])
  for (const colorScheme of ["light", "dark"] as const) {
    test(`return-to-work is accessible at ${width}px in ${colorScheme}`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width, height: 960 });
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto("/outils/reprise-travail");
      for (const result of [false, true]) {
        if (result) {
          await example(page);
          await page
            .getByRole("button", { name: "Tester un ajustement" })
            .click();
          await page
            .getByLabel("Décaler la journée de travail")
            .selectOption("-30");
          await page.getByLabel("Finir la garde plus tard (min)").fill("30");
          await page
            .getByRole("button", { name: "Comparer avec mon organisation" })
            .click();
          await expect(
            page.getByRole("heading", {
              name: "5 h de moins à organiser sur les jours comparables.",
            }),
          ).toBeFocused();
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        const audit = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(
          audit.violations
            .filter((item) =>
              ["serious", "critical"].includes(item.impact ?? ""),
            )
            .map((item) => ({
              id: item.id,
              nodes: item.nodes.map((node) => node.failureSummary),
            })),
        ).toEqual([]);
        await page.screenshot({
          path: testInfo.outputPath(
            `reprise-${width}-${colorScheme}-${result ? "result" : "form"}.png`,
          ),
          fullPage: false,
        });
      }
      await page.goto("/entreprises");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await expect(
        page.getByText(
          "Ce portail RH et ces indicateurs ne sont pas encore disponibles.",
          { exact: false },
        ),
      ).toBeVisible();
    });
  }
test("a visitor without JavaScript sees honest fallback and official sources", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto("/outils/reprise-travail");
  await expect(
    page.getByText("Aucun parcours n’a été créé.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Voir mon bilan et mon plan" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: /Congé de paternité et d’accueil/ }),
  ).toBeVisible();
  await context.close();
});

test("a temporary scenario compares selected days, keeps saved progress and offers a private fallback export", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("denied")) },
    });
  });
  await example(page);
  await page
    .getByRole("checkbox", { name: "Résoudre les créneaux non couverts" })
    .check();
  await page
    .getByRole("checkbox", { name: "Enregistrer ce parcours sur cet appareil" })
    .check();
  const before = await page.evaluate(
    (name) => localStorage.getItem(name),
    REPRISE_STORAGE_NAME,
  );
  await page.getByRole("button", { name: "Tester un ajustement" }).click();
  const simulator = page.getByRole("region", {
    name: "Et si on changeait les horaires ?",
  });
  await simulator
    .getByLabel("Décaler la journée de travail")
    .selectOption("-30");
  await simulator.getByLabel("Finir la garde plus tard (min)").fill("30");
  await simulator
    .getByRole("button", { name: "Comparer avec mon organisation" })
    .click();
  await expect(
    simulator.getByRole("heading", {
      name: "5 h de moins à organiser sur les jours comparables.",
    }),
  ).toBeFocused();
  await expect(
    simulator.getByText("Horaires compatibles, accords à vérifier."),
  ).toHaveCount(5);
  expect(
    await page.evaluate(
      (name) => localStorage.getItem(name),
      REPRISE_STORAGE_NAME,
    ),
  ).toBe(before);
  await expect(
    page.getByLabel("Aperçu du document professionnel"),
  ).not.toContainText("17 h");
  const download = page.waitForEvent("download");
  await simulator
    .getByRole("button", { name: "Copier cette hypothèse" })
    .click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("darons-reprise-hypothese.txt");
  const text = await readFile((await file.path())!, "utf8");
  expect(text).toContain("EXEMPLE FICTIF");
  expect(text).toContain("08 h 30–17 h 00");
  await expect(simulator.getByRole("status")).toContainText(
    "Aucun message n’a été envoyé",
  );
  await simulator.getByLabel("Finir la garde plus tard (min)").fill("0");
  await expect(
    simulator.getByRole("region", { name: "Résultat de la simulation" }),
  ).toHaveCount(0);
  for (const day of ["Mardi", "Mercredi", "Jeudi", "Vendredi"])
    await simulator.getByRole("checkbox", { name: day, exact: true }).uncheck();
  await simulator
    .getByRole("button", { name: "Comparer avec mon organisation" })
    .click();
  await expect(
    simulator.getByRole("heading", {
      name: "30 min de moins à organiser sur les jours comparables.",
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Tester un ajustement" }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Résoudre les créneaux non couverts" }),
  ).toBeChecked();
  expect(
    await page.evaluate(
      (name) => localStorage.getItem(name),
      REPRISE_STORAGE_NAME,
    ),
  ).toBe(before);
});

test("a scenario keeps unknown care unknown and focuses actionable validation errors", async ({
  page,
}) => {
  await page.goto("/outils/reprise-travail");
  await page.getByRole("button", { name: "Essayer avec un exemple" }).click();
  await page.getByLabel("Lundi : début de garde", { exact: true }).fill("");
  await page.getByLabel("Lundi : fin de garde", { exact: true }).fill("");
  await page
    .getByRole("button", { name: "Appliquer ces horaires aux jours cochés" })
    .click();
  await page
    .getByRole("button", { name: "Voir mon bilan et mon plan" })
    .click();
  await page.getByRole("button", { name: "Tester un ajustement" }).click();
  const simulator = page.getByRole("region", {
    name: "Et si on changeait les horaires ?",
  });
  await simulator.getByLabel("Finir la garde plus tard (min)").fill("60");
  await simulator
    .getByRole("button", { name: "Comparer avec mon organisation" })
    .click();
  await expect(
    simulator.getByRole("heading", {
      name: "Horaires de garde inconnus : impossible de mesurer l’effet.",
    }),
  ).toBeVisible();
  await expect(
    simulator.getByText("Horaires compatibles, accords à vérifier."),
  ).toHaveCount(0);
  await simulator.getByLabel("Trajet aller envisagé (min)").fill("-1");
  await simulator
    .getByRole("button", { name: "Comparer avec mon organisation" })
    .click();
  await expect(simulator.getByRole("alert")).toBeFocused();
  await expect(simulator.getByRole("alert")).toContainText("durées entières");
  await expect(
    simulator.getByRole("button", { name: "Copier cette hypothèse" }),
  ).toHaveCount(0);
});

test("a parent who does not work Mondays can copy Tuesday hours and undo the replacement", async ({
  page,
}) => {
  await page.goto("/outils/reprise-travail");
  await page
    .getByRole("button", { name: "Voir mon bilan et mon plan" })
    .click();
  await expect(page.locator(".reprise").getByRole("alert")).toBeFocused();
  await page.getByRole("button", { name: "Essayer avec un exemple" }).click();
  await page
    .getByRole("checkbox", { name: "Lundi travaillé", exact: true })
    .uncheck();
  await page
    .locator("summary")
    .filter({ hasText: "Horaires du mardi" })
    .click();
  await page
    .getByLabel("Mardi : fin du travail", { exact: true })
    .fill("16:00");
  await page
    .getByRole("button", { name: "Appliquer ces horaires aux jours cochés" })
    .click();
  await expect(
    page.getByText("Horaires du mardi copiés sur les 3 autres jours cochés.", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .locator("summary")
    .filter({ hasText: "Horaires du mercredi" })
    .click();
  await expect(
    page.getByLabel("Mercredi : fin du travail", { exact: true }),
  ).toHaveValue("16:00");
  await page
    .getByRole("button", { name: "Annuler la copie des horaires" })
    .click();
  await expect(
    page.getByLabel("Mercredi : fin du travail", { exact: true }),
  ).toHaveValue("17:30");
  await expect(
    page.getByLabel("Mardi : fin du travail", { exact: true }),
  ).toHaveValue("16:00");
  await page
    .getByRole("button", { name: "Voir mon bilan et mon plan" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Ta reprise du/ }),
  ).toBeVisible();
});
