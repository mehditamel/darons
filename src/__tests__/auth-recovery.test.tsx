import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { safeAuthRedirect } from "@/lib/auth/redirect";
import { UpdatePasswordForm } from "@/components/forms/update-password-form";
import { updatePasswordSchema } from "@/lib/validators/auth";

const { updateUser } = vi.hoisted(() => ({ updateUser: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth: { updateUser } }) }));
afterEach(cleanup);
beforeEach(() => updateUser.mockReset());

describe("authentication return paths", () => {
  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "/budget/../../evil", "/budget-evil", "/api/private", "", undefined, ["/sante", "/budget"]])(
    "rejects unsafe or unsupported path %s", (value) => expect(safeAuthRedirect(value)).toBe("/dashboard"),
  );
  it.each(["/sante?member=demo", "/documents/example", "/update-password", "/budget#expenses"])(
    "preserves supported destination %s", (value) => expect(safeAuthRedirect(value)).toBe(value),
  );
});

describe("password recovery", () => {
  it("rejects weak or mismatched passwords", () => {
    expect(updatePasswordSchema.safeParse({ password: "weak", confirmPassword: "weak" }).success).toBe(false);
    expect(updatePasswordSchema.safeParse({ password: "TestPassword1", confirmPassword: "DifferentPassword2" }).success).toBe(false);
  });

  function fillAndSubmit(confirmPassword = "TestPassword1") {
    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), { target: { value: "TestPassword1" } });
    fireEvent.change(screen.getByLabelText("Confirmer le mot de passe"), { target: { value: confirmPassword } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer mon mot de passe" }));
  }

  it("does not send mismatched passwords", async () => {
    render(<UpdatePasswordForm />);
    fillAndSubmit("DifferentPassword2");
    await screen.findByText("Les mots de passe ne correspondent pas");
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("shows success only after Supabase accepts the new password", async () => {
    updateUser.mockResolvedValue({ error: null });
    render(<UpdatePasswordForm />);
    fillAndSubmit();
    await screen.findByRole("heading", { name: "Mot de passe mis à jour" });
    expect(updateUser).toHaveBeenCalledWith({ password: "TestPassword1" });
    expect(screen.getByRole("link", { name: "Retrouver mon espace" }).getAttribute("href")).toBe("/dashboard");
  });

  it("keeps the form available when the recovery session expires", async () => {
    updateUser.mockResolvedValue({ error: { message: "expired session" } });
    render(<UpdatePasswordForm />);
    fillAndSubmit();
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("n'a pas été modifié"));
    expect(screen.queryByRole("heading", { name: "Mot de passe mis à jour" })).toBeNull();
    expect(screen.getByRole("link", { name: "Demander un nouveau lien" }).getAttribute("href")).toBe("/reset-password");
  });
});
