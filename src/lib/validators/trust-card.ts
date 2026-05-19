import { z } from "zod";
import { TRUST_CARD_SECTIONS } from "@/types/trust-card";

export const TRUST_CARD_DURATIONS = [
  { value: 6, label: "6 heures" },
  { value: 24, label: "24 heures" },
  { value: 72, label: "3 jours" },
  { value: 168, label: "7 jours" },
] as const;

export const createTrustCardSchema = z.object({
  memberId: z.string().uuid("Enfant invalide"),
  label: z.string().min(2, "Donne un nom à ce carnet").max(60).optional(),
  durationHours: z.coerce.number().refine(
    (v) => TRUST_CARD_DURATIONS.some((d) => d.value === v),
    "Durée invalide"
  ),
  sections: z
    .array(z.enum(TRUST_CARD_SECTIONS))
    .min(1, "Sélectionne au moins une section"),
  notes: z.string().max(1000, "Notes trop longues").optional(),
});

export type CreateTrustCardData = z.infer<typeof createTrustCardSchema>;

export const verifyPinSchema = z.object({
  token: z.string().min(8, "Lien invalide"),
  pin: z.string().regex(/^\d{4}$/, "Le PIN doit faire 4 chiffres"),
});

export type VerifyPinData = z.infer<typeof verifyPinSchema>;
