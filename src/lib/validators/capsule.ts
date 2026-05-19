import { z } from "zod";

export const memoryUploadSchema = z.object({
  memberId: z.string().uuid("Enfant invalide"),
  caption: z.string().max(500, "Légende trop longue").optional(),
  memoryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  tags: z.array(z.string()).optional(),
});

export type MemoryUploadData = z.infer<typeof memoryUploadSchema>;

export const generateRecapSchema = z.object({
  memberId: z.string().uuid("Enfant invalide"),
  periodType: z.enum(["quarter", "year", "custom"]),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type GenerateRecapData = z.infer<typeof generateRecapSchema>;

export const MAX_MEMORY_SIZE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_MEMORY_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "video/mp4",
  "video/quicktime",
];
