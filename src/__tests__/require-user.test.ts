// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuthenticatedUser } from "@/lib/auth/require-user";

const mocks = vi.hoisted(() => ({ session: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/actions/safe-action", () => ({ getAuthenticatedUser: mocks.session }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.redirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });
});

describe("private layout authentication", () => {
  it.each([null, { from: vi.fn() }])("stops rendering when the session is absent", async (supabase) => {
    mocks.session.mockResolvedValue({ user: null, supabase });
    await expect(requireAuthenticatedUser()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/login?next=%2Fdashboard");
    if (supabase) expect(supabase.from).not.toHaveBeenCalled();
  });
  it("returns only the verified user context", async () => {
    const session = { user: { id: "verified-user" }, supabase: { from: vi.fn() } };
    mocks.session.mockResolvedValue(session);
    expect(await requireAuthenticatedUser()).toEqual(session);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
