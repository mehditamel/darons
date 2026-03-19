import { describe, it, expect } from "vitest";
import { rateLimit, rateLimitByUser } from "@/lib/utils/rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const key = `test-${Date.now()}`;
    const result = rateLimit(key, 5, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over limit", () => {
    const key = `test-over-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 60_000);
    }
    const result = rateLimit(key, 3, 60_000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks remaining correctly", () => {
    const key = `test-remaining-${Date.now()}`;
    expect(rateLimit(key, 3, 60_000).remaining).toBe(2);
    expect(rateLimit(key, 3, 60_000).remaining).toBe(1);
    expect(rateLimit(key, 3, 60_000).remaining).toBe(0);
  });
});

describe("rateLimitByUser", () => {
  it("applies rate limit by user id", () => {
    const userId = `user-${Date.now()}`;
    const result = rateLimitByUser(userId, 10, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
  });
});
