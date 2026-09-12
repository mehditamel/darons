// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/payments/checkout/route";

const mocks = vi.hoisted(() => ({ user: vi.fn(), profile: vi.fn(), admin: vi.fn(), save: vi.fn(), update: vi.fn(), customer: vi.fn(), checkout: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth: { getUser: mocks.user }, from: () => ({ select: () => ({ eq: () => ({ single: mocks.profile }) }) }) }) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/stripe/client", () => ({ getStripe: () => ({ customers: { create: mocks.customer }, checkout: { sessions: { create: mocks.checkout } } }) }));
vi.mock("@/lib/stripe/config", () => ({ getStripePlans: () => ({ premium: { priceId: "price_test" } }) }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));

function request(body = JSON.stringify({ plan: "premium" })) {
  return new NextRequest("https://darons.app/api/payments/checkout", { method: "POST", body });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.user.mockResolvedValue({ data: { user: { id: "user-id", email: "verified@example.test" } } });
  mocks.profile.mockResolvedValue({ data: { stripe_customer_id: null, email: "profile@example.test" } });
  const query = { update: mocks.update, eq: vi.fn(), select: vi.fn(), single: mocks.save };
  for (const fn of [query.update, query.eq, query.select]) fn.mockReturnValue(query);
  mocks.admin.mockReturnValue({ from: () => query });
  mocks.save.mockResolvedValue({ data: { id: "user-id" }, error: null });
  mocks.customer.mockResolvedValue({ id: "cus_test" });
  mocks.checkout.mockResolvedValue({ url: "https://checkout.stripe.com/test" });
});

describe("checkout customer ownership", () => {
  it("rejects anonymous requests before creating a customer", async () => {
    mocks.user.mockResolvedValue({ data: { user: null } });
    expect((await POST(request())).status).toBe(401);
    expect(mocks.admin).not.toHaveBeenCalled();
    expect(mocks.customer).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON", async () => {
    expect((await POST(request("{"))).status).toBe(400);
    expect(mocks.customer).not.toHaveBeenCalled();
  });
  it("saves the authenticated customer's ID through the trusted client", async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mocks.customer).toHaveBeenCalledWith({ email: "verified@example.test", metadata: { supabase_user_id: "user-id" } }, { idempotencyKey: "customer:user-id" });
    expect(mocks.update).toHaveBeenCalledWith({ stripe_customer_id: "cus_test" });
    expect(mocks.checkout).toHaveBeenCalledWith(expect.objectContaining({ customer: "cus_test", client_reference_id: "user-id" }));
  });
  it("does not create an external customer when the trusted client is unavailable", async () => {
    mocks.admin.mockImplementation(() => { throw new Error("not configured"); });
    expect((await POST(request())).status).toBe(500);
    expect(mocks.customer).not.toHaveBeenCalled();
  });
  it("does not proceed to checkout if the customer ID could not be stored", async () => {
    mocks.save.mockResolvedValue({ data: null, error: { message: "db unavailable" } });
    expect((await POST(request())).status).toBe(500);
    expect(mocks.checkout).not.toHaveBeenCalled();
  });
  it("reuses an existing customer without creating or modifying one", async () => {
    mocks.profile.mockResolvedValue({ data: { stripe_customer_id: "cus_existing" } });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.admin).not.toHaveBeenCalled();
    expect(mocks.customer).not.toHaveBeenCalled();
  });
});
