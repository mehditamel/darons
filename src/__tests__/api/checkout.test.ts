// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/payments/checkout/route";

const services = vi.hoisted(() => ({ stripe: vi.fn(), database: vi.fn() }));
vi.mock("@/lib/stripe/client", () => ({ getStripe: services.stripe }));
vi.mock("@/lib/supabase/server", () => ({ createClient: services.database }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: services.database,
}));
beforeEach(() => vi.resetAllMocks());

describe("retired parent subscriptions", () => {
  it("returns a free-access explanation without a payment redirect", async () => {
    const response = await POST();
    expect(response.status).toBe(410);
    expect(await response.json()).toEqual({
      error:
        "Darons est gratuit pour les familles. Aucun abonnement payant n’est proposé.",
    });
    expect(response.headers.get("location")).toBeNull();
  });
  it("never contacts billing or changes customer records, even if services fail", async () => {
    services.stripe.mockImplementation(() => {
      throw new Error("must not be called");
    });
    services.database.mockImplementation(() => {
      throw new Error("must not be called");
    });
    expect((await POST()).status).toBe(410);
    expect(services.stripe).not.toHaveBeenCalled();
    expect(services.database).not.toHaveBeenCalled();
  });
});
