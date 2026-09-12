// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { acceptInvitation, cancelInvitation, updateMemberRole } from "@/lib/actions/sharing";
import { invitationSchema } from "@/lib/validators/sharing";

const mocks = vi.hoisted(() => ({ session: vi.fn(), rpc: vi.fn(), from: vi.fn(), single: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/actions/safe-action", () => ({ getAuthenticatedUser: mocks.session, getUserHouseholdId: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
const id = "aaaaaaaa-1111-4111-8111-111111111111";
beforeEach(() => {
  vi.resetAllMocks();
  const query = { update: vi.fn(), eq: vi.fn(), select: vi.fn(), maybeSingle: mocks.single };
  for (const fn of [query.update, query.eq, query.select]) fn.mockReturnValue(query);
  mocks.from.mockReturnValue(query);
  mocks.session.mockResolvedValue({ user: { id: "user" }, supabase: { rpc: mocks.rpc, from: mocks.from } });
});

describe("invitation acceptance", () => {
  it("normalizes the invited email", () => {
    expect(invitationSchema.parse({ email: " Parent@Example.Test ", role: "viewer" }).email).toBe("parent@example.test");
  });
  it("rejects malformed tokens before contacting the database", async () => {
    expect((await acceptInvitation("bad-token")).success).toBe(false);
    expect(mocks.session).not.toHaveBeenCalled();
  });
  it("requires authentication", async () => {
    mocks.session.mockResolvedValue({ user: null });
    expect((await acceptInvitation("a".repeat(64))).success).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("uses the atomic database operation without direct membership writes", async () => {
    mocks.rpc.mockResolvedValue({ data: id, error: null });
    expect((await acceptInvitation("a".repeat(64))).success).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith("accept_household_invitation", { invitation_token: "a".repeat(64) });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.revalidate).toHaveBeenCalledWith("/partage");
  });
  it("does not report success or refresh after an unauthorized or expired invitation", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "private database detail" } });
    const result = await acceptInvitation("a".repeat(64));
    expect(result.success).toBe(false);
    expect(result.error).not.toContain("private database detail");
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
  it("does not report success when cancellation matched no authorized invitation", async () => {
    mocks.single.mockResolvedValue({ data: null, error: null });
    expect((await cancelInvitation(id)).success).toBe(false);
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
  it("rejects privileged role values supplied outside the typed interface", async () => {
    expect((await updateMemberRole(id, "owner" as "partner")).success).toBe(false);
    expect(mocks.session).not.toHaveBeenCalled();
  });
  it("does not report a role change that the database did not authorize", async () => {
    mocks.single.mockResolvedValue({ data: null, error: null });
    expect((await updateMemberRole(id, "partner")).success).toBe(false);
  });
});
