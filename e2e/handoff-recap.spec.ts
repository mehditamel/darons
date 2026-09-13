import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [320, 1440])
  for (const colorScheme of ["light", "dark"] as const) {
    test(`two-way handoff at ${width}px in ${colorScheme}`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width, height: 960 });
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.addInitScript(() => {
        const writes: string[] = [];
        Object.defineProperty(window, "__handoffWrites", { value: writes });
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text: string) => {
              writes.push(text);
            },
          },
        });
      });
      await page.goto("/#quotidien");
      const demo = page.locator(".handoff-demo");
      await demo
        .getByText("1. Essayer les consignes du jour", { exact: true })
        .click();
      await demo.getByLabel("Les consignes du jour").fill("Repère fictif");
      await demo.getByRole("button", { name: "+ Retour", exact: true }).click();
      await expect(demo.getByLabel("Les consignes du jour")).toHaveValue(
        /Repère fictif.*\n\nRetour/,
      );
      await expect(
        demo.getByRole("region", { name: "Ce que le proche verrait" }),
      ).toContainText("Repère fictif");
      await demo
        .getByText("2. Essayer le retour de garde", { exact: true })
        .click();
      const recap = demo.locator(".handoff-recap");
      await recap
        .getByRole("button", { name: "Préparer le récapitulatif" })
        .click();
      await expect(recap.getByRole("alert")).toContainText(
        "au moins une information",
      );
      await recap
        .getByLabel("Repas", { exact: true })
        .fill("Goûter pris à 16 h");
      await recap
        .getByLabel("Le petit moment du jour")
        .fill("Un grand sourire au parc");
      await recap
        .getByRole("button", { name: "Préparer le récapitulatif" })
        .click();
      const preview = recap.getByRole("textbox", {
        name: "Récapitulatif à transmettre",
      });
      await expect(preview).toBeFocused();
      await expect(preview).toHaveValue(/EXEMPLE FICTIF/);
      await expect(preview).not.toHaveValue(/Sommeil|Repère fictif|Lou|\/c\//);
      await recap
        .getByRole("button", { name: "Copier le récap", exact: true })
        .click();
      await expect(recap.getByRole("status")).toContainText(
        "Aucun envoi automatique",
      );
      await recap
        .getByRole("button", { name: "Faire découvrir Darons" })
        .click();
      const writes = await page.evaluate(
        () => Reflect.get(window, "__handoffWrites") as string[],
      );
      expect(writes).toHaveLength(2);
      expect(writes[0]).toContain("Goûter pris");
      expect(writes[1]).toContain("https://darons.app/#quotidien");
      expect(writes[1]).not.toMatch(/Goûter|Lou|Repère fictif|\/c\//);
      expect(
        await page.evaluate(() =>
          Object.keys(localStorage).filter((key) => key !== "theme"),
        ),
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const audit = await new AxeBuilder({ page })
        .include(".handoff-demo")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        audit.violations
          .filter((v) => ["critical", "serious"].includes(v.impact ?? ""))
          .map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.failureSummary),
          })),
      ).toEqual([]);
      await recap
        .getByRole("heading", { name: "Et sa journée, alors ?" })
        .scrollIntoViewIfNeeded();
      await page.screenshot({
        path: testInfo.outputPath(`handoff-${width}-${colorScheme}.png`),
      });
      await recap
        .getByLabel("Repas", { exact: true })
        .fill("Correction à relire");
      await expect(preview).toHaveCount(0);
    });
  }
test("sharing cancellation and unavailable clipboard keep a selectable draft", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        Object.defineProperty(window, "__handoffShare", {
          configurable: true,
          value: data,
        });
        throw new DOMException("cancelled", "AbortError");
      },
    });
  });
  await page.goto("/#quotidien");
  await page
    .getByText("2. Essayer le retour de garde", { exact: true })
    .click();
  const recap = page.locator(".handoff-recap");
  await recap.getByLabel("Sommeil", { exact: true }).fill("Réveil à 15 h");
  await recap
    .getByRole("button", { name: "Préparer le récapitulatif" })
    .click();
  await recap.getByRole("button", { name: "Choisir à qui l’envoyer" }).click();
  await expect(recap.getByRole("status")).toContainText("Partage annulé");
  const data = await page.evaluate(
    () => Reflect.get(window, "__handoffShare") as ShareData,
  );
  expect(Object.keys(data).sort()).toEqual(["text", "title"]);
  expect(data.text).not.toMatch(/\/c\/|PIN|Lou/);
  await recap
    .getByRole("button", { name: "Copier le récap", exact: true })
    .click();
  await expect(
    recap.getByRole("textbox", { name: "Récapitulatif à transmettre" }),
  ).toBeFocused();
  await expect(recap.getByRole("status")).toContainText(
    "copie automatique n’est pas disponible",
  );
  await recap.getByRole("button", { name: "Faire découvrir Darons" }).click();
  await expect(
    recap.getByLabel("Message pour faire découvrir Darons"),
  ).toBeFocused();
  await expect(
    recap.getByLabel("Message pour faire découvrir Darons"),
  ).not.toHaveValue(/Réveil/);
});
