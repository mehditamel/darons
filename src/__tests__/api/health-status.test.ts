// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/health/status/route";
const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("account service health", () => {
  it("reports a rejected API key as unhealthy", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).services.supabase.status).toBe("error");
  });
  it("uses the publishable key in the API key header without a fabricated JWT", async () => {
    fetchMock.mockResolvedValue(new Response("[]", { status: 200 }));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("limit=0"), expect.objectContaining({ headers: { apikey: "sb_publishable_test" }, cache: "no-store" }));
  });
  it("does not make a request when configuration is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect((await GET()).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
