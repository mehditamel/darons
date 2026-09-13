// @vitest-environment node
import { expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadTrustCardPayload } from "./data";

it("does not serialize historical notes when routines are excluded", async () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi
      .fn()
      .mockResolvedValue({
        data: {
          first_name: "Lou",
          last_name: "Exemple",
          birth_date: "2025-03-12",
          photo_url: null,
        },
      }),
  };
  const db = { from: vi.fn(() => query) } as unknown as SupabaseClient;
  const base = {
    memberId: "example",
    notes: "Information privée",
    expiresAt: "2026-09-14T12:00:00Z",
  };
  expect(
    (await loadTrustCardPayload(db, { ...base, sections: ["emergency"] }))
      ?.notes,
  ).toBeNull();
  expect(
    (await loadTrustCardPayload(db, { ...base, sections: ["routines"] }))
      ?.notes,
  ).toBe("Information privée");
});
