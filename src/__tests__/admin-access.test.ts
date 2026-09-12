// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminContext } from "@/lib/auth/admin";

const mocks = vi.hoisted(() => ({ session: vi.fn(), admin: vi.fn(), single: vi.fn(), eq: vi.fn() }));
vi.mock("@/lib/actions/safe-action", () => ({ getAuthenticatedUser: mocks.session }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.admin }));

beforeEach(() => {
  vi.resetAllMocks();
  const query = { select: vi.fn(), eq: mocks.eq, single: mocks.single };
  query.select.mockReturnValue(query);
  mocks.eq.mockReturnValue(query);
  mocks.session.mockResolvedValue({ user: { id: "verified-user" }, supabase: { from: () => query } });
});

describe("administrator authorization", () => {
  it("never creates a privileged client for an anonymous request", async () => {
    mocks.session.mockResolvedValue({ user: null });
    expect(await getAdminContext()).toEqual({ success: false, error: "Non authentifié" });
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it.each([null, { is_admin: false }, { is_admin: "true" }])("rejects absent or invalid admin flags", async (data) => {
    mocks.single.mockResolvedValue({ data, error: null });
    expect((await getAdminContext()).success).toBe(false);
    expect(mocks.admin).not.toHaveBeenCalled();
    expect(mocks.eq).toHaveBeenCalledWith("id", "verified-user");
  });
  it("rejects a database error even if a flag is returned", async () => {
    mocks.single.mockResolvedValue({ data: { is_admin: true }, error: { message: "failed" } });
    expect((await getAdminContext()).success).toBe(false);
    expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("uses the privileged client only after a verified admin flag", async () => {
    mocks.single.mockResolvedValue({ data: { is_admin: true }, error: null });
    const admin = { from: vi.fn() };
    mocks.admin.mockReturnValue(admin);
    expect(await getAdminContext()).toEqual({ success: true, user: { id: "verified-user" }, supabase: admin });
  });
  it("reports unavailable administration when the server credential is missing", async () => {
    mocks.single.mockResolvedValue({ data: { is_admin: true }, error: null });
    mocks.admin.mockImplementation(() => { throw new Error("missing credential"); });
    expect((await getAdminContext()).success).toBe(false);
  });
});
