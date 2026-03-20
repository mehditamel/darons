import { z } from "zod";

export const checkoutSchema = z.object({
  plan: z.enum(["premium", "family_pro"], {
    errorMap: () => ({ message: "Plan invalide" }),
  }),
});

export type CheckoutData = z.infer<typeof checkoutSchema>;
