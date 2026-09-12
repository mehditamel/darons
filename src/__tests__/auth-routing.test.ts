// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { GET } from "@/app/(auth)/callback/route";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), exchange: vi.fn(), server: vi.fn(), single: vi.fn(), from: vi.fn(),
}));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.server }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { exchangeCodeForSession: mocks.exchange } }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "placeholder");
  mocks.getUser.mockResolvedValue({ data: { user: null } });
  mocks.single.mockResolvedValue({ data: { id: "household" } });
  const query = { select: vi.fn(), eq: vi.fn(), single: mocks.single };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  mocks.from.mockReturnValue(query);
  mocks.server.mockReturnValue({ auth: { getUser: mocks.getUser }, from: mocks.from });
});
afterEach(() => vi.unstubAllEnvs());

describe("authentication callback", () => {
  it("exchanges a recovery code before opening the new password form", async () => {
    mocks.exchange.mockResolvedValue({ error: null });
    const response = await GET(new Request("https://darons.app/callback?code=test&next=/update-password"));
    expect(mocks.exchange).toHaveBeenCalledWith("test");
    expect(response.headers.get("location")).toBe("https://darons.app/update-password");
  });
  it.each(["rejected", "offline"])("offers another link after a %s exchange", async (reason) => {
    if (reason === "offline") mocks.exchange.mockRejectedValue(new Error("offline"));
    else mocks.exchange.mockResolvedValue({ error: { message: "expired" } });
    const response = await GET(new Request("https://darons.app/callback?code=test&next=/update-password"));
    expect(response.headers.get("location")).toBe("https://darons.app/reset-password?error=expired");
  });
  it("does not exchange a missing code", async () => {
    const response = await GET(new Request("https://darons.app/callback?next=//evil.example"));
    expect(mocks.exchange).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://darons.app/login?error=auth");
  });
  it("rejects an external destination even after successful authentication", async () => {
    mocks.exchange.mockResolvedValue({ error: null });
    const response = await GET(new Request("https://darons.app/callback?code=test&next=https://evil.example"));
    expect(response.headers.get("location")).toBe("https://darons.app/dashboard");
  });
});

describe("session redirects", () => {
  it("preserves the requested path and query on the login page", async () => {
    const response = await updateSession(new NextRequest("https://darons.app/documents?member=demo"));
    const url = new URL(response.headers.get("location")!);
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("next")).toBe("/documents?member=demo");
    expect(url.searchParams.has("member")).toBe(false);
  });
  it("protects alerts without matching unrelated path prefixes", async () => {
    expect((await updateSession(new NextRequest("https://darons.app/alertes"))).status).toBe(307);
    expect((await updateSession(new NextRequest("https://darons.app/sante-publique"))).headers.get("location")).toBeNull();
  });
  it("keeps refreshed session cookies when redirecting a signed-in user", async () => {
    mocks.getUser.mockImplementation(async () => {
      const options = mocks.server.mock.calls[0][2];
      options.cookies.setAll([{ name: "sb-session", value: "refreshed", options: { httpOnly: true, path: "/" } }]);
      return { data: { user: { id: "user" } } };
    });
    const response = await updateSession(new NextRequest("https://darons.app/login?next=%2Fsante%3Fmember%3Ddemo"));
    expect(response.headers.get("location")).toBe("https://darons.app/sante?member=demo");
    expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });
  it("does not require an existing household to recover a password", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user" } } });
    const response = await updateSession(new NextRequest("https://darons.app/update-password"));
    expect(response.headers.get("location")).toBeNull();
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
