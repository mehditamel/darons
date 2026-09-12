// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const send = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
import { sendEmail } from "@/lib/integrations/notifications";
beforeEach(() => { send.mockReset(); vi.stubEnv("RESEND_API_KEY", "test-key"); });
afterEach(() => vi.unstubAllEnvs());
describe("email delivery results", () => {
  it("reports a provider rejection even when the SDK resolves normally", async () => {
    send.mockResolvedValue({ data: null, error: { message: "unverified domain" } });
    expect((await sendEmail("test@example.test", "Test", "Test")).success).toBe(false);
  });
  it("reports acceptance only when the provider returns no error", async () => {
    send.mockResolvedValue({ data: { id: "message-test" }, error: null });
    expect((await sendEmail("test@example.test", "Test", "Test")).success).toBe(true);
  });
});
