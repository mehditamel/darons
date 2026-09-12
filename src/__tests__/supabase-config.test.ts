// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

const sdk = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient: sdk }));
beforeEach(() => {
  sdk.mockReset();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "legacy-public");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "legacy-private");
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
});
afterEach(() => vi.unstubAllEnvs());

describe("Supabase key migration", () => {
  it("prefers modern public configuration and never includes a private key", () => {
    expect(getSupabasePublicConfig()).toEqual({ url: "https://example.supabase.co", key: "sb_publishable_test" });
  });
  it("supports an existing legacy public configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(getSupabasePublicConfig().key).toBe("legacy-public");
  });
  it("prefers the new server key without persisting a user session", () => {
    createAdminClient();
    expect(sdk).toHaveBeenCalledWith("https://example.supabase.co", "sb_secret_test", { auth: { autoRefreshToken: false, persistSession: false } });
  });
  it("rejects missing server credentials without falling back to a public key", () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(createAdminClient).toThrow("Configuration serveur Supabase manquante");
    expect(sdk).not.toHaveBeenCalled();
  });
});
