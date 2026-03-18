import { z } from "zod";

const budgetCategories = [
  "alimentation",
  "sante",
  "garde",
  "vetements",
  "loisirs",
  "scolarite",
  "transport",
  "logement",
  "assurance",
  "autre",
] as const;

export const budgetEntrySchema = z.object({
  memberId: z.string().uuid().nullable().default(null),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  category: z.enum(budgetCategories, {
    required_error: "La catégorie est requise",
  }),
  label: z
    .string()
    .min(1, "Le libellé est requis")
    .max(200, "Maximum 200 caractères"),
  amount: z
    .number({ required_error: "Le montant est requis" })
    .refine((v) => v !== 0, "Le montant ne peut pas être zéro"),
  isRecurring: z.boolean().default(false),
  notes: z.string().max(500).nullable().default(null),
});

export type BudgetEntryFormData = z.infer<typeof budgetEntrySchema>;

export const cafAllocationSchema = z.object({
  allocationType: z
    .string()
    .min(1, "Le type d'allocation est requis")
    .max(100, "Maximum 100 caractères"),
  monthlyAmount: z
    .number({ required_error: "Le montant mensuel est requis" })
    .min(0.01, "Le montant doit être positif"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide")
    .nullable()
    .default(null),
  active: z.boolean().default(true),
  notes: z.string().max(500).nullable().default(null),
});

export type CafAllocationFormData = z.infer<typeof cafAllocationSchema>;

export const savingsGoalSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(200, "Maximum 200 caractères"),
  targetAmount: z
    .number({ required_error: "L'objectif est requis" })
    .min(1, "L'objectif doit être positif"),
  currentAmount: z.number().min(0).default(0),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide")
    .nullable()
    .default(null),
  icon: z.string().max(10).nullable().default(null),
  active: z.boolean().default(true),
});

export type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>;
