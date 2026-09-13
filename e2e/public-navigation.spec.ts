import { test, expect } from "@playwright/test";
import { TOTAL_TOOLS } from "../src/lib/tools-catalog";

test("mobile menu opens, navigates and closes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  const menu = page.getByRole("navigation", { name: "Navigation mobile" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Outils gratuits" }).click();
  await expect(page).toHaveURL(/\/outils$/);
  await expect(menu).not.toBeVisible();
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Ouvrir le menu" }),
  ).toBeFocused();
});

test("tool search combines filters and recovers from no results", async ({
  page,
}) => {
  await page.goto("/outils");
  const search = page.getByRole("searchbox", { name: "Rechercher un outil" });
  const tools = page.locator("#tool-results a");
  await expect(tools).toHaveCount(TOTAL_TOOLS);
  await expect(page).toHaveTitle(new RegExp(`${TOTAL_TOOLS} outils`));
  await search.fill("COUT creche");
  await expect(tools).toHaveCount(1);
  await expect(tools).toHaveAttribute("href", "/outils/simulateur-garde");
  await page.getByRole("button", { name: "Santé", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Aucun outil trouvé" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Afficher tous les outils" }).click();
  await expect(tools).toHaveCount(TOTAL_TOOLS);
  await expect(search).toHaveValue("");
});

for (const width of [320, 375, 768, 1280]) {
  test(`public pages fit ${width}px without nested controls`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["/", "/outils", "/login", "/register"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        route,
      ).toBe(true);
      await expect(page.locator("a button, button a")).toHaveCount(0);
    }
  });
}

test("free access leads only to registration and no paid plan", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#pricing").getByRole("link")).toHaveCount(1);
  await expect(page.locator("#pricing").getByRole("link")).toHaveAttribute(
    "href",
    "/register",
  );
  await expect(
    page.locator("#pricing").getByText("0 €", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Darons\+|Family Pro/ }),
  ).toHaveCount(0);
});

test("old subscription requests cannot create a paid checkout", async ({
  request,
}) => {
  for (const body of [{ plan: "premium" }, { plan: "family_pro" }, null]) {
    const response = await request.post("/api/payments/checkout", {
      data: body,
    });
    expect(response.status()).toBe(410);
    const result = await response.json();
    expect(result.error).toContain("gratuit pour les familles");
    expect(result).not.toHaveProperty("url");
  }
});
