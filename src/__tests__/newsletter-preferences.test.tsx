import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NewsletterPreferenceForm } from "@/components/blog/newsletter-preference-form";
const fetchMock = vi.fn();
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("newsletter preference confirmation", () => {
  it("never changes preferences when a mail scanner only opens the page", () => {
    render(<NewsletterPreferenceForm token={"a".repeat(64)} action="unsubscribe" />);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Me désinscrire" })).toBeTruthy();
  });
  it("does not offer submission for a malformed token", () => {
    render(<NewsletterPreferenceForm token="bad" action="confirm" />);
    expect(screen.getByRole("alert").textContent).toContain("invalide");
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("reports an expired token without claiming confirmation", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Ce lien a expiré" }) });
    render(<NewsletterPreferenceForm token={"a".repeat(64)} action="confirm" />);
    fireEvent.click(screen.getByRole("button", { name: "Confirmer mon inscription" }));
    expect((await screen.findByRole("alert")).textContent).toContain("expiré");
    expect(screen.queryByRole("status")).toBeNull();
  });
  it("shows unsubscription only after explicit submission succeeds", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    render(<NewsletterPreferenceForm token={"a".repeat(64)} action="unsubscribe" />);
    fireEvent.click(screen.getByRole("button", { name: "Me désinscrire" }));
    expect((await screen.findByRole("status")).textContent).toContain("désinscrit");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).action).toBe("unsubscribe");
  });
});
