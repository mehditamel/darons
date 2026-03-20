import { z } from "zod";

export const notificationDispatchSchema = z.object({
  type: z.string().min(1, "Le type est requis"),
  subject: z.string().min(1, "Le sujet est requis").max(200, "200 caractères maximum"),
  htmlBody: z.string().min(1, "Le contenu HTML est requis"),
  smsBody: z.string().max(160, "160 caractères maximum pour un SMS").optional(),
});

export type NotificationDispatchData = z.infer<typeof notificationDispatchSchema>;
