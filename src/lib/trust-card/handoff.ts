import { z } from "zod";

export const HANDOFF_PROMPTS = [
  { label: "Repas", text: "Repas — dernier repas et prochaine étape : " },
  {
    label: "Sommeil",
    text: "Sommeil — dernier réveil et repères habituels : ",
  },
  { label: "Réconfort", text: "Réconfort — ce qui aide mon enfant : " },
  { label: "Retour", text: "Retour — heure, personne et affaires à rendre : " },
] as const;

export function appendHandoffPrompt(
  notes: string,
  prompt: string,
): string | null {
  const next = [notes.trimEnd(), prompt].filter(Boolean).join("\n\n");
  return next.length <= 1000 ? next : null;
}

export const RECAP_FIELDS = [
  { key: "meal", label: "Repas", hint: "Ce qui a été pris, et quand" },
  { key: "rest", label: "Sommeil", hint: "Les heures de repos ou de réveil" },
  {
    key: "moment",
    label: "Le petit moment du jour",
    hint: "Une découverte, un jeu, une anecdote",
  },
  {
    key: "note",
    label: "À savoir pour la suite",
    hint: "Ce que le parent doit savoir en reprenant le relais",
  },
] as const;

export const recapSchema = z
  .object({
    date: z
      .string()
      .regex(/^20\d{2}-\d{2}-\d{2}$/, "Indique la date de la garde.")
      .refine((value) => {
        const date = new Date(`${value}T12:00:00Z`);
        return (
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === value
        );
      }, "Vérifie la date de la garde."),
    meal: z.string().trim().max(240),
    rest: z.string().trim().max(240),
    moment: z.string().trim().max(240),
    note: z.string().trim().max(240),
  })
  .strict()
  .refine(
    (value) => RECAP_FIELDS.some((field) => value[field.key]),
    "Ajoute au moins une information avant de préparer le récapitulatif.",
  );

export type HandoffRecapData = z.infer<typeof recapSchema>;

// Deliberately accepts no card payload, URL or PIN: only the recipient's draft.
export function buildHandoffRecap(
  data: HandoffRecapData,
  example = false,
): string {
  const parsed = recapSchema.parse(data);
  const date = parsed.date.split("-").reverse().join("/");
  return [
    example ? "EXEMPLE FICTIF — Relais du jour" : "Le relais du jour",
    `Garde du ${date}`,
    ...RECAP_FIELDS.filter((field) => parsed[field.key]).map(
      (field) => `${field.label}\n${parsed[field.key]}`,
    ),
    "Préparé avec Darons",
  ].join("\n\n");
}

export const DISCOVER_DARONS_MESSAGE =
  "Pour passer le relais à un proche : les consignes de ton enfant dans un carnet temporaire, puis un récap de sa garde. C’est gratuit et le proche n’a pas besoin de compte. Découvre Darons : https://darons.app/#quotidien";

export function handoffInvitation(shareUrl: string): string {
  const url = new URL(shareUrl);
  if (
    !/^https?:$/.test(url.protocol) ||
    !/^\/c\/[^/]+$/.test(url.pathname) ||
    url.search ||
    url.hash
  ) {
    throw new Error("Lien de carnet invalide");
  }
  return `Voici le carnet pour notre passage de relais :\n${url.href}\n\nAucun compte à créer. Je te donne le code PIN séparément. Après la garde, tu peux préparer un récapitulatif dans le carnet et me le transmettre.`;
}
