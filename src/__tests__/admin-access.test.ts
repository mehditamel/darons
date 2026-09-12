// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminContext } from "@/lib/auth/admin";

const mocks = vi.hoisted(() => ({ session: vi.fn(), admin: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/actions/safe-action", () => ({ getAuthenticatedUser: mocks.session }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.admin }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.session.mockResolvedValue({ user: { id: "verified-user" }, supabase: { rpc: mocks.rpc } });
});

describe("administrator authorization", () => {
  it("never creates a privileged client for an anonymous request", async () => {
    mocks.session.mockResolvedValue({ user: null });
    expect(await getAdminContext()).toEqual({ success: false, error: "Non authentifié" });
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it.each([null, false, "true"])("rejects absent or invalid authorization", async (data) => {
    mocks.rpc.mockResolvedValue({ data, error: null });
    expect((await getAdminContext()).success).toBe(false);
    expect(mocks.admin).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenCalledWith("is_current_user_admin");
  });
  it("rejects a database error even if a flag is returned", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: { message: "failed" } });
    expect((await getAdminContext()).success).toBe(false);
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("denies an unmigrated database even when a legacy profile claims admin", async () => {
    mocks.session.mockResolvedValue({ user: { id: "verified-user" }, supabase: {
      rpc: mocks.rpc, from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { is_admin: true } }) }) }) }),
    } });
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "PGRST202", message: "function not found" } });
    expect(await getAdminContext()).toEqual({ success: false, error: "Accès refusé" });
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("denies a failed authorization request", async () => {
    mocks.rpc.mockRejectedValue(new Error("network unavailable"));
    expect((await getAdminContext()).success).toBe(false);
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("uses the privileged client only after migrated database authorization", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    const admin = { from: vi.fn() };
    mocks.admin.mockReturnValue(admin);
    expect(await getAdminContext()).toEqual({ success: true, user: { id: "verified-user" }, supabase: admin });
  });
  it("reports unavailable administration when the server credential is missing", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    mocks.admin.mockImplementation(() => { throw new Error("missing credential"); });
    expect((await getAdminContext()).success).toBe(false);
  });
});
