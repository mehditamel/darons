import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import {
  createFamilyPlan,
  PLAN_STORAGE_NAME,
} from "../src/lib/family-plan/plan";

const ROUTE = "/outils/plan-famille";
const fixture = () =>
  createFamilyPlan(
    { stages: ["expecting"], focus: "rest", minutes: 20 },
    "a7165cb0-3729-4a4c-af55-e4580a763bf0",
    new Date("2026-09-12T12:00:00Z"),
  );

async function createPlan(page: Page, minutes = "20 min") {
  await page.getByRole("checkbox", { name: "Bébé arrive bientôt" }).check();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await page
    .getByRole("radio", { name: "Souffler et passer le relais" })
    .check();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await page.getByRole("radio", { name: new RegExp(`^${minutes}`) }).check();
  await page
    .getByRole("button", { name: "Créer mon plan", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /actions? pour alléger/ }),
  ).toBeVisible();
}

test("plan validates the family stage and preserves progress only after opt-in", async ({
  page,
}) => {
  await page.goto(ROUTE);
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await expect(page.locator(".family-plan").getByRole("alert")).toContainText(
    "Choisis au moins une étape",
  );
  await createPlan(page);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), PLAN_STORAGE_NAME),
  ).toBeNull();
  const mission = page.locator(".plan-mission").first();
  await mission.getByRole("checkbox").first().check();
  await mission.getByLabel("Responsable proposé").selectOption("support");
  await mission.getByLabel("Jour choisi").fill("2028-02-29");
  await page
    .getByRole("checkbox", { name: /Garder mon plan sur cet appareil/ })
    .check();
  await page.reload();
  await expect(mission.getByRole("checkbox").first()).toBeChecked();
  await expect(mission.getByLabel("Responsable proposé")).toHaveValue(
    "support",
  );
  await expect(mission.getByLabel("Jour choisi")).toHaveValue("2028-02-29");
  await page
    .getByRole("checkbox", { name: /Garder mon plan sur cet appareil/ })
    .uncheck();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), PLAN_STORAGE_NAME),
  ).toBeNull();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Où en est ta petite famille ?" }),
  ).toBeVisible();
});

test("calendar and backup downloads preserve dates and permit a confirmed restore", async ({
  page,
}) => {
  await page.goto(ROUTE);
  await createPlan(page, "10 min");
  const mission = page.locator(".plan-mission").first();
  await mission.getByLabel("Jour choisi").fill("2028-02-29");
  await mission.getByLabel("Responsable proposé").selectOption("support");
  const calendarReady = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ajouter à mon calendrier" }).click();
  const calendar = await calendarReady;
  expect(calendar.suggestedFilename()).toBe("mon-plan-darons.ics");
  const contents = await readFile((await calendar.path())!, "utf8");
  expect(contents).toContain("DTSTART;VALUE=DATE:20280229");
  expect(contents).toContain("DTEND;VALUE=DATE:20280301");
  const backupReady = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Télécharger mon plan et son avancement" })
    .click();
  const backup = await backupReady;
  const file = (await backup.path())!;
  await page.reload();
  await page.getByLabel("Fichier de sauvegarde Darons").setInputFiles(file);
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Reprendre ce plan", exact: true })
    .click();
  await expect(mission.getByLabel("Responsable proposé")).toHaveValue(
    "support",
  );
  for (const checkbox of await mission.getByRole("checkbox").all())
    await checkbox.check();
  await expect(
    page.getByRole("heading", {
      name: "C’est fait. Place au reste de la vie.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ajouter à mon calendrier" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Préparer le relais" }),
  ).toBeDisabled();
});

test("malformed, oversized and untrusted backups cannot replace an existing plan", async ({
  page,
}) => {
  await page.goto(ROUTE);
  await createPlan(page, "10 min");
  const original = await page.locator(".plan-mission h3").allTextContents();
  for (const contents of [
    "{broken",
    "é".repeat(40000),
    JSON.stringify({ ...fixture(), unexpected: "https://invalid.example" }),
  ]) {
    await page.getByLabel("Fichier de sauvegarde Darons").setInputFiles({
      name: "test.json",
      mimeType: "application/json",
      buffer: Buffer.from(contents),
    });
    await expect(page.locator(".family-plan").getByRole("alert")).toBeVisible();
    expect(await page.locator(".plan-mission h3").allTextContents()).toEqual(
      original,
    );
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
  }
  await page.getByLabel("Fichier de sauvegarde Darons").setInputFiles({
    name: "valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture())),
  });
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  expect(await page.locator(".plan-mission h3").allTextContents()).toEqual(
    original,
  );
});

test("storage and clipboard failures leave the current plan usable and exportable", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    const originalGet = Storage.prototype.getItem;
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.getItem = function (name) {
      if (name === key) throw new Error("blocked");
      return originalGet.call(this, name);
    };
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new Error("full");
      originalSet.call(this, name, value);
    };
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    });
  }, PLAN_STORAGE_NAME);
  await page.goto(ROUTE);
  await expect(page.locator(".family-plan").getByRole("alert")).toContainText(
    "sauvegarde locale",
  );
  await createPlan(page, "10 min");
  await page
    .getByRole("checkbox", { name: /Garder mon plan sur cet appareil/ })
    .click();
  await expect(page.locator(".family-plan").getByRole("alert")).toContainText(
    "Enregistrement impossible",
  );
  await expect(
    page.getByRole("checkbox", { name: /Garder mon plan sur cet appareil/ }),
  ).not.toBeChecked();
  const relayReady = page.waitForEvent("download");
  await page.getByRole("button", { name: "Préparer le relais" }).click();
  const relay = await relayReady;
  expect(relay.suggestedFilename()).toBe("mon-relais-darons.txt");
  expect(await readFile((await relay.path())!, "utf8")).toContain(
    "Responsable proposé",
  );
});

test("reset needs confirmation and only removes the plan storage key", async ({
  page,
}) => {
  await page.goto(ROUTE);
  await createPlan(page);
  await page
    .getByRole("checkbox", { name: /Garder mon plan sur cet appareil/ })
    .check();
  await page.evaluate(() =>
    localStorage.setItem("darons-unrelated-preference", "keep"),
  );
  await page.getByRole("button", { name: "Effacer et recommencer" }).click();
  await page
    .getByRole("button", { name: "Garder mon plan", exact: true })
    .click();
  await expect(page.locator(".plan-mission")).toHaveCount(2);
  await page.getByRole("button", { name: "Effacer et recommencer" }).click();
  await page
    .getByRole("button", { name: "Effacer mon plan", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Où en est ta petite famille ?" }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), PLAN_STORAGE_NAME),
  ).toBeNull();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("darons-unrelated-preference"),
    ),
  ).toBe("keep");
});

for (const width of [320, 1440])
  for (const theme of ["light", "dark"] as const) {
    test(`wizard and results are accessible at ${width}px in ${theme}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto(ROUTE);
      await expect(
        page.getByRole("heading", {
          level: 2,
          name: "Où en est ta petite famille ?",
        }),
      ).toBeVisible();
      for (const state of ["wizard", "results"]) {
        if (state === "results") await createPlan(page);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(
          axe.violations.map((item) => ({
            id: item.id,
            nodes: item.nodes.map((node) => ({
              target: node.target,
              summary: node.failureSummary,
            })),
          })),
        ).toEqual([]);
        await page.screenshot({
          path: testInfo.outputPath(`plan-${state}-${width}-${theme}.png`),
          fullPage: true,
        });
      }
    });
  }

test("the three questions can be completed using the keyboard", async ({
  page,
}) => {
  await page.goto(ROUTE);
  const first = page.getByRole("checkbox", { name: "Bébé arrive bientôt" });
  await first.focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Continuer", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Qu’est-ce qui te ferait du bien ?" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: "Continuer", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", {
      name: "Combien de temps as-tu cette semaine ?",
    }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Créer mon plan", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: /actions? pour alléger/ }),
  ).toBeFocused();
});

test("a visitor without JavaScript still gets useful links", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: testInfo.project.use.baseURL,
  });
  const page = await context.newPage();
  await page.goto(ROUTE);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page
      .locator("noscript")
      .getByRole("link", { name: "fiche des démarches de naissance" }),
  ).toBeVisible();
  await context.close();
});
