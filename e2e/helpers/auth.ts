import { type Page, expect } from "@playwright/test";

/**
 * Fill the login form and submit.
 * Assumes the page is already on /login.
 */
export async function loginAs(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mot de passe/i).fill(password);
  await page.getByRole("button", { name: /connexion|se connecter/i }).click();
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
}

/**
 * Fill the registration form and submit.
 */
export async function registerUser(
  page: Page,
  data: { firstName: string; lastName: string; email: string; password: string }
): Promise<void> {
  await page.goto("/register");
  await page.getByLabel(/prénom/i).fill(data.firstName);
  await page.getByLabel(/nom/i).fill(data.lastName);
  await page.getByLabel(/email/i).fill(data.email);
  await page.getByLabel(/mot de passe/i).fill(data.password);
  await page.getByRole("button", { name: /créer|inscription|s'inscrire/i }).click();
}

/**
 * Assert the user is on the dashboard.
 */
export async function expectDashboard(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator("nav")).toBeVisible();
}

/**
 * Mock Supabase auth API for offline tests.
 */
export async function mockSupabaseAuth(page: Page): Promise<void> {
  await page.route("**/auth/v1/**", (route) => {
    const url = route.request().url();

    if (url.includes("/token")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-access-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-token",
          user: {
            id: "00000000-0000-0000-0000-000000000001",
            email: "test@test.fr",
            role: "authenticated",
          },
        }),
      });
    }

    if (url.includes("/user")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "00000000-0000-0000-0000-000000000001",
          email: "test@test.fr",
          role: "authenticated",
        }),
      });
    }

    return route.continue();
  });
}
