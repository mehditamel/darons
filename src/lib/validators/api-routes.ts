import { z } from "zod";

export const aiSuggestionsSchema = z.object({
  childId: z.string().uuid("childId doit être un UUID valide"),
});

export const fhirMemberSchema = z.object({
  memberId: z.string().uuid("memberId doit être un UUID valide"),
});

export const fhirDisconnectSchema = z.object({
  memberId: z.string().uuid("memberId doit être un UUID valide"),
  deleteSyncedData: z.boolean().default(false),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url("L'endpoint doit être une URL valide"),
  keys: z.object({
    p256dh: z.string().min(1, "Clé p256dh requise"),
    auth: z.string().min(1, "Clé auth requise"),
  }),
});

export const bankingConnectSchema = z.object({
  callbackUrl: z.string().url("L'URL de callback doit être valide").optional(),
});
