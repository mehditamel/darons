// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/newsletter/subscribe/route";
import { POST as manage } from "@/app/api/newsletter/manage/route";
import { createHash } from "node:crypto";

const mocks = vi.hoisted(() => ({ admin: vi.fn(), rpc: vi.fn(), send: vi.fn(), limit: vi.fn(), update: vi.fn(), eq: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/integrations/notifications", () => ({ sendEmail: mocks.send }));
vi.mock("@/lib/rate-limit", () => ({ rateLimitAsync: mocks.limit }));
function request(body: unknown) {
  return new NextRequest("https://darons.app/api/newsletter/subscribe", { method: "POST", body: JSON.stringify(body) });
}
beforeEach(() => {
  vi.resetAllMocks();
  const query = { update: mocks.update, eq: mocks.eq, then: (resolve: (x: unknown) => void) => resolve({ error: null }) };
  mocks.update.mockReturnValue(query);
  mocks.eq.mockReturnValue(query);
  mocks.admin.mockReturnValue({ rpc: mocks.rpc, from: () => query });
  mocks.rpc.mockResolvedValue({ data: true, error: null });
  mocks.send.mockResolvedValue({ success: true });
  mocks.limit.mockResolvedValue(false);
});
afterEach(() => vi.unstubAllEnvs());

describe("newsletter confirmation requests", () => {
  it("rejects invalid email before contacting the database", async () => {
    expect((await POST(request({ email: "invalid" }))).status).toBe(400);
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("reports unavailable configuration without claiming success or sending email", async () => {
    mocks.admin.mockImplementation(() => { throw new Error("missing key"); });
    expect((await POST(request({ email: "parent@example.test" }))).status).toBe(503);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("normalizes the address and stores a hash rather than the email link token", async () => {
    const response = await POST(request({ email: " Parent@Example.Test " }));
    expect(response.status).toBe(200);
    const args = mocks.rpc.mock.calls[0][1];
    expect(args.email_address).toBe("parent@example.test");
    const html = mocks.send.mock.calls[0][2] as string;
    const token = html.match(/confirmer\?token=([a-f0-9]{64})/)![1];
    expect(args.token_hash).toBe(createHash("sha256").update(token).digest("hex"));
    expect(args.token_hash).not.toBe(token);
    expect(html).toContain("/newsletter/desinscription?token=");
    expect(mocks.send.mock.calls[0][0]).toBe("parent@example.test");
  });
  it("does not resend to a confirmed address or during the database cooldown", async () => {
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    expect((await POST(request({ email: "parent@example.test" }))).status).toBe(200);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("does not send when persistence fails", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "database details" } });
    const response = await POST(request({ email: "parent@example.test" }));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("database details");
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("releases the failed challenge and reports an email provider refusal", async () => {
    mocks.send.mockResolvedValue({ success: false });
    expect((await POST(request({ email: "parent@example.test" }))).status).toBe(503);
    expect(mocks.update).toHaveBeenCalledWith({ confirmation_sent_at: null });
    expect(mocks.eq).toHaveBeenCalledWith("manage_token_hash", mocks.rpc.mock.calls[0][1].token_hash);
  });
  it("limits abusive requests before storing or sending anything", async () => {
    mocks.limit.mockResolvedValue(true);
    expect((await POST(request({ email: "parent@example.test" }))).status).toBe(429);
    expect(mocks.admin).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });
});

describe("newsletter preferences", () => {
  it("rejects a malformed management link", async () => {
    expect((await manage(request({ token: "bad", action: "confirm" }))).status).toBe(400);
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("reports an expired confirmation rather than confirming it", async () => {
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    expect((await manage(request({ token: "a".repeat(64), action: "confirm" }))).status).toBe(400);
  });
  it("confirms through the database with the token hash", async () => {
    expect((await manage(request({ token: "a".repeat(64), action: "confirm" }))).status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("confirm_newsletter_subscription", { token_hash: expect.any(String) });
  });
  it("unsubscribes and invalidates the link without deleting the account", async () => {
    expect((await manage(request({ token: "a".repeat(64), action: "unsubscribe" }))).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ confirmed: false, manage_token_hash: null }));
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
