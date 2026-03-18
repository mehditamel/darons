import { z } from "zod";

export const documentUploadSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "200 caractères maximum"),
  category: z.enum(
    ["identite", "sante", "fiscal", "scolaire", "caf", "assurance", "logement", "autre"],
    { errorMap: () => ({ message: "Catégorie invalide" }) }
  ),
  memberId: z.string().uuid("Membre invalide").optional(),
  description: z.string().max(500, "500 caractères maximum").optional(),
  tags: z.array(z.string()).optional(),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp"] as const;
