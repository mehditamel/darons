import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { upsertMock, sendEmailMock } = vi.hoisted(() => ({
  upsertMock: vi.fn(),
  sendEmailMock: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({ upsert: upsertMock }),
  }),
}));

vi.mock("@/lib/integrations/notifications", () => ({
  sendEmail: sendEmailMock,
}));

import { POST } from "@/app/api/newsletter/subscribe/route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/newsletter/subscribe", () => {
  beforeEach(() => {
    upsertMock.mockReset().mockResolvedValue({ error: null });
    sendEmailMock.mockReset().mockResolvedValue({ success: true });
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejette une adresse email invalide (400)", async () => {
    const res = await POST(makeRequest({ email: "pas-un-email" }));
    expect(res.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("persiste et envoie l'email de bienvenue quand le service role est présent", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    const res = await POST(makeRequest({ email: "parent@example.com" }));
    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledOnce();
    expect(sendEmailMock).toHaveBeenCalledOnce();
  });

  it("réussit en mode dégradé sans service role (best-effort)", async () => {
    const res = await POST(makeRequest({ email: "parent@example.com" }));
    expect(res.status).toBe(200);
    expect(upsertMock).not.toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalledOnce();
  });

  it("retourne 500 si la persistance échoue", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    upsertMock.mockResolvedValue({ error: { message: "db down" } });
    const res = await POST(makeRequest({ email: "parent@example.com" }));
    expect(res.status).toBe(500);
  });
});
