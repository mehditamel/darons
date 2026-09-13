// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ocr/route";

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  query: vi.fn(),
  extract: vi.fn(),
  ai: vi.fn(),
  limit: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser: mocks.user }, from: mocks.query }),
}));
vi.mock("@/lib/integrations/ocr", () => ({
  extractTextFromImage: mocks.extract,
}));
vi.mock("@/lib/ai/anthropic", () => ({
  callClaude: mocks.ai,
  parseJsonResponse: JSON.parse,
}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.limit }));

function request(type = "image/png") {
  const data = new FormData();
  data.set("file", new File(["fictional test content"], "example", { type }));
  return new NextRequest("https://darons.app/api/ocr", {
    method: "POST",
    body: data,
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.user.mockResolvedValue({ data: { user: { id: "parent-test" } } });
  mocks.query.mockImplementation(() => {
    throw new Error("subscription lookup must not be needed");
  });
  mocks.limit.mockReturnValue(false);
  mocks.extract.mockResolvedValue("Example");
  mocks.ai.mockResolvedValue('{"medications":[]}');
});
describe("free OCR access", () => {
  it("allows a signed-in parent without a paid-plan lookup", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ text: "Example", medications: [] });
    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.extract).toHaveBeenCalledOnce();
  });
  it("still requires authentication before extracting data", async () => {
    mocks.user.mockResolvedValue({ data: { user: null } });
    expect((await POST(request())).status).toBe(401);
    expect(mocks.extract).not.toHaveBeenCalled();
    expect(mocks.ai).not.toHaveBeenCalled();
  });
  it("retains request limits without offering a paid bypass", async () => {
    mocks.limit.mockReturnValue(true);
    expect((await POST(request())).status).toBe(429);
    expect(mocks.user).not.toHaveBeenCalled();
    expect(mocks.extract).not.toHaveBeenCalled();
  });
  it("retains file validation for free accounts", async () => {
    expect((await POST(request("text/plain"))).status).toBe(400);
    expect(mocks.extract).not.toHaveBeenCalled();
  });
});
