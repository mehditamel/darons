import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { TrustCardForm } from "@/components/confiance/trust-card-form";
const { createTrustCard, toast } = vi.hoisted(() => ({
  createTrustCard: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/lib/actions/trust-card", () => ({ createTrustCard }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
afterEach(cleanup);
beforeEach(() => {
  createTrustCard.mockReset();
  toast.mockReset();
});
const members = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    firstName: "Lou",
    lastName: "Exemple",
  },
];
const previousNotes = [
  {
    id: "old",
    memberId: members[0].id,
    label: "Mamie",
    date: "12/09/2026",
    notes: "Doudou dans le sac",
  },
  {
    id: "other",
    memberId: "22222222-2222-4222-8222-222222222222",
    label: "Autre enfant",
    date: "12/09/2026",
    notes: "Ne pas reprendre",
  },
];
it("reuses only the selected child's notes and lets the parent undo the replacement", () => {
  render(<TrustCardForm members={members} previousNotes={previousNotes} />);
  expect(screen.queryByRole("option", { name: /Autre enfant/ })).toBeNull();
  fireEvent.change(screen.getByLabelText("Les consignes du jour"), {
    target: { value: "Brouillon actuel" },
  });
  fireEvent.change(
    screen.getByLabelText("Repartir de mes dernières consignes"),
    { target: { value: "old" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Reprendre ces consignes" }),
  );
  expect(
    (screen.getByLabelText("Les consignes du jour") as HTMLTextAreaElement)
      .value,
  ).toBe("Doudou dans le sac");
  fireEvent.click(
    screen.getByRole("button", { name: "Annuler la reprise des consignes" }),
  );
  expect(
    (screen.getByLabelText("Les consignes du jour") as HTMLTextAreaElement)
      .value,
  ).toBe("Brouillon actuel");
});
it("does not send unchecked notes and keeps health sharing opt-in", async () => {
  createTrustCard.mockResolvedValue({
    success: false,
    error: "Test sans écriture",
  });
  render(<TrustCardForm members={members} />);
  expect(
    (screen.getByRole("checkbox", { name: /Allergies/ }) as HTMLInputElement)
      .checked,
  ).toBe(false);
  fireEvent.change(screen.getByLabelText("Les consignes du jour"), {
    target: { value: "Privé" },
  });
  fireEvent.click(screen.getByRole("checkbox", { name: /Notes & routines/ }));
  fireEvent.click(screen.getByRole("button", { name: "Créer le carnet" }));
  await waitFor(() => expect(createTrustCard).toHaveBeenCalledTimes(1));
  expect(createTrustCard.mock.calls[0][0]).toMatchObject({
    label: "",
    notes: undefined,
    sections: ["emergency"],
  });
});
it("preserves consignes and releases the button after an uncertain network failure", async () => {
  createTrustCard.mockRejectedValue(new Error("network"));
  render(<TrustCardForm members={members} />);
  fireEvent.change(screen.getByLabelText("Les consignes du jour"), {
    target: { value: "À conserver" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Créer le carnet" }));
  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Le carnet n’a pas pu être confirmé" }),
    ),
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Créer le carnet",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
  expect(
    (screen.getByLabelText("Les consignes du jour") as HTMLTextAreaElement)
      .value,
  ).toBe("À conserver");
});
