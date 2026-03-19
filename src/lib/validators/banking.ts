import { z } from "zod";

export const bankTransactionFilterSchema = z.object({
  accountId: z.string().uuid().optional(),
  category: z.string().optional(),
  memberId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export type BankTransactionFilter = z.infer<typeof bankTransactionFilterSchema>;

export const transactionCategorySchema = z.object({
  transactionId: z.string().uuid(),
  category: z.enum([
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
  ]),
});

export type TransactionCategoryUpdate = z.infer<typeof transactionCategorySchema>;

export const transactionMemberSchema = z.object({
  transactionId: z.string().uuid(),
  memberId: z.string().uuid().nullable(),
});

export type TransactionMemberUpdate = z.infer<typeof transactionMemberSchema>;
