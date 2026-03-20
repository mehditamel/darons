import { z } from "zod";

export const createCalendarEventSchema = z.object({
  type: z.enum(["medical", "fiscal"], {
    errorMap: () => ({ message: "Le type doit être 'medical' ou 'fiscal'" }),
  }),
  entityId: z.string().uuid("Identifiant invalide"),
});

export type CreateCalendarEventData = z.infer<typeof createCalendarEventSchema>;

export const listCalendarEventsSchema = z.object({
  timeMin: z.string().datetime().optional(),
  timeMax: z.string().datetime().optional(),
});

export type ListCalendarEventsData = z.infer<typeof listCalendarEventsSchema>;
