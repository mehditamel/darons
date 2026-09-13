// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  appendHandoffPrompt,
  buildHandoffRecap,
  DISCOVER_DARONS_MESSAGE,
  handoffInvitation,
  recapSchema,
} from "./handoff";
import { createTrustCardSchema } from "@/lib/validators/trust-card";

const draft = {
  date: "2026-09-13",
  meal: "",
  rest: "",
  moment: "",
  note: "Doudou dans le sac",
};
describe("daily handoff", () => {
  it("preserves existing consignes and refuses to truncate at the limit", () => {
    expect(appendHandoffPrompt("Repère déjà écrit", "Retour : ")).toBe(
      "Repère déjà écrit\n\nRetour : ",
    );
    expect(appendHandoffPrompt("x".repeat(999), "Retour : ")).toBeNull();
    expect(appendHandoffPrompt("", "x".repeat(1000))).toHaveLength(1000);
  });
  it("does not invent a meal, sleep or identity when the recipient leaves them blank", () => {
    const text = buildHandoffRecap(draft);
    expect(text).toContain("13/09/2026");
    expect(text).toContain("Doudou dans le sac");
    expect(text).not.toMatch(/Repas|Sommeil|Lou|PIN|https?:|\/c\//);
    expect(buildHandoffRecap(draft, true)).toMatch(/^EXEMPLE FICTIF/);
  });
  it.each([
    { ...draft, note: " " },
    { ...draft, date: "2026-02-30" },
    { ...draft, date: "" },
    { ...draft, meal: "x".repeat(241) },
    { ...draft, token: "private-card-token" },
  ])("rejects empty, invalid or unexpected recap content", (value) => {
    expect(recapSchema.safeParse(value).success).toBe(false);
  });
  it("only recommends the public app, and separates invitations from the PIN", () => {
    expect(DISCOVER_DARONS_MESSAGE).toContain("https://darons.app/#quotidien");
    expect(DISCOVER_DARONS_MESSAGE).not.toContain("/c/");
    const message = handoffInvitation("https://darons.app/c/example-token");
    expect(message).toContain("https://darons.app/c/example-token");
    expect(message).toContain("séparément");
    expect(() => handoffInvitation("javascript:alert(1)")).toThrow();
    expect(() =>
      handoffInvitation("https://darons.app/c/example?pin=1234"),
    ).toThrow();
  });
  it("accepts an optional empty label while retaining limits and section requirements", () => {
    const card = {
      memberId: "11111111-1111-4111-8111-111111111111",
      label: "",
      durationHours: 6,
      sections: ["routines"],
      notes: "Doudou",
    };
    expect(createTrustCardSchema.safeParse(card).success).toBe(true);
    expect(
      createTrustCardSchema.safeParse({ ...card, label: "x" }).success,
    ).toBe(false);
    expect(
      createTrustCardSchema.safeParse({ ...card, notes: "x".repeat(1001) })
        .success,
    ).toBe(false);
    expect(
      createTrustCardSchema.safeParse({ ...card, sections: [] }).success,
    ).toBe(false);
  });
});
