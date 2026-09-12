// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createHmac } from "node:crypto";
const mocks = vi.hoisted(() => ({ admin: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: () => null }));
beforeEach(() => { vi.resetModules(); mocks.admin.mockReset().mockReturnValue({}); });
afterEach(() => vi.unstubAllEnvs());
function request(signature = "", body = '{"type":"test.event"}') {
  return new NextRequest("https://darons.app/api/webhooks/bridge", { method: "POST", body, headers: { "bridge-signature": signature } });
}
describe("bank webhook authentication", () => {
  it("refuses all events when its signature secret is absent", async () => {
    vi.stubEnv("BRIDGE_WEBHOOK_SECRET", "");
    const { POST } = await import("@/app/api/webhooks/bridge/route");
    expect((await POST(request())).status).toBe(503);
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it.each(["", "short", "0".repeat(64)])("refuses an invalid signature before accessing banking data", async (signature) => {
    vi.stubEnv("BRIDGE_WEBHOOK_SECRET", "test-webhook-secret");
    const { POST } = await import("@/app/api/webhooks/bridge/route");
    expect((await POST(request(signature))).status).toBe(401);
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("accepts a properly authenticated event", async () => {
    vi.stubEnv("BRIDGE_WEBHOOK_SECRET", "test-webhook-secret");
    const { POST } = await import("@/app/api/webhooks/bridge/route");
    const body = '{"type":"test.event"}';
    const signature = createHmac("sha256", "test-webhook-secret").update(body).digest("hex");
    expect((await POST(request(signature, body))).status).toBe(200);
    expect(mocks.admin).toHaveBeenCalledOnce();
  });
});
