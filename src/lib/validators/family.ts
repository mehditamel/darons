import { z } from "zod";

export const householdSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du foyer est requis")
    .max(100, "100 caractères maximum"),
});

export type HouseholdFormData = z.infer<typeof householdSchema>;

export const familyMemberSchema = z.object({
  firstName: z
    .string()
    .min(1, "Le prénom est requis")
    .max(50, "50 caractères maximum"),
  lastName: z
    .string()
    .min(1, "Le nom est requis")
    .max(50, "50 caractères maximum"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  gender: z.enum(["M", "F"], {
    errorMap: () => ({ message: "Veuillez sélectionner un genre" }),
  }),
  memberType: z.enum(["adult", "child"], {
    errorMap: () => ({ message: "Veuillez sélectionner le type de membre" }),
  }),
  notes: z.string().max(500, "500 caractères maximum").optional(),
});

export type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;

export const identityDocumentSchema = z.object({
  memberId: z.string().uuid("Membre invalide"),
  documentType: z.enum(
    ["cni", "passeport", "livret_famille", "acte_naissance", "carte_vitale", "autre"],
    { errorMap: () => ({ message: "Type de document invalide" }) }
  ),
  documentNumber: z.string().max(50, "50 caractères maximum").optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  issuingAuthority: z.string().max(100, "100 caractères maximum").optional(),
});

export type IdentityDocumentFormData = z.infer<typeof identityDocumentSchema>;
