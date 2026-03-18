import { z } from "zod";

export const invitationSchema = z.object({
  email: z
    .string()
    .email("Adresse email invalide")
    .max(255, "Maximum 255 caractères"),
  role: z.enum(["partner", "viewer", "nanny"], {
    required_error: "Le rôle est requis",
  }),
});

export type InvitationFormData = z.infer<typeof invitationSchema>;

export const expenseGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(200, "Maximum 200 caractères"),
  description: z.string().max(500).nullable().default(null),
  currency: z.string().default("EUR"),
});

export type ExpenseGroupFormData = z.infer<typeof expenseGroupSchema>;

export const expenseGroupMemberSchema = z.object({
  userId: z.string().uuid().nullable().default(null),
  externalName: z.string().max(200).nullable().default(null),
  email: z.string().email().max(255).nullable().default(null),
});

export type ExpenseGroupMemberFormData = z.infer<typeof expenseGroupMemberSchema>;

export const sharedExpenseSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Maximum 200 caractères"),
  amount: z
    .number({ required_error: "Le montant est requis" })
    .min(0.01, "Le montant doit être positif"),
  paidBy: z.string().uuid("Payeur invalide"),
  category: z.string().max(100).nullable().default(null),
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  notes: z.string().max(500).nullable().default(null),
  splitType: z.enum(["equal", "custom"]).default("equal"),
  customSplits: z
    .array(
      z.object({
        memberId: z.string().uuid(),
        amount: z.number().min(0),
      })
    )
    .optional(),
});

export type SharedExpenseFormData = z.infer<typeof sharedExpenseSchema>;

export const settlementSchema = z.object({
  fromMember: z.string().uuid("Payeur invalide"),
  toMember: z.string().uuid("Bénéficiaire invalide"),
  amount: z
    .number({ required_error: "Le montant est requis" })
    .min(0.01, "Le montant doit être positif"),
  notes: z.string().max(500).nullable().default(null),
});

export type SettlementFormData = z.infer<typeof settlementSchema>;

export const roundupSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  roundupTo: z.number().min(0.50).max(10).default(1.00),
  targetGoalId: z.string().uuid().nullable().default(null),
  monthlyCap: z.number().min(1).max(500).default(50),
});

export type RoundupSettingsFormData = z.infer<typeof roundupSettingsSchema>;

export const referralSchema = z.object({
  email: z
    .string()
    .email("Adresse email invalide")
    .max(255, "Maximum 255 caractères"),
});

export type ReferralFormData = z.infer<typeof referralSchema>;
