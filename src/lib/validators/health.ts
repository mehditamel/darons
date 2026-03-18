import { z } from "zod";

export const vaccinationSchema = z.object({
  memberId: z.string().uuid("Membre invalide"),
  vaccineCode: z.string().min(1, "Le vaccin est requis"),
  vaccineName: z.string().min(1, "Le nom du vaccin est requis"),
  doseNumber: z.number().int().positive("Le numéro de dose est requis"),
  administeredDate: z.string().min(1, "La date d'administration est requise"),
  practitioner: z.string().max(100, "100 caractères maximum").optional(),
  batchNumber: z.string().max(50, "50 caractères maximum").optional(),
  notes: z.string().max(500, "500 caractères maximum").optional(),
});

export type VaccinationFormData = z.infer<typeof vaccinationSchema>;

export const growthMeasurementSchema = z.object({
  memberId: z.string().uuid("Membre invalide"),
  measurementDate: z.string().min(1, "La date de mesure est requise"),
  weightKg: z
    .union([z.number().positive("Le poids doit être positif"), z.nan()])
    .optional()
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  heightCm: z
    .union([z.number().positive("La taille doit être positive"), z.nan()])
    .optional()
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  headCircumferenceCm: z
    .union([z.number().positive("Le périmètre crânien doit être positif"), z.nan()])
    .optional()
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  notes: z.string().max(500, "500 caractères maximum").optional(),
});

export type GrowthMeasurementFormData = z.infer<typeof growthMeasurementSchema>;

export const medicalAppointmentSchema = z.object({
  memberId: z.string().uuid("Membre invalide"),
  appointmentType: z.string().min(1, "Le type de rendez-vous est requis"),
  practitioner: z.string().max(100, "100 caractères maximum").optional(),
  location: z.string().max(200, "200 caractères maximum").optional(),
  appointmentDate: z.string().min(1, "La date du rendez-vous est requise"),
  notes: z.string().max(500, "500 caractères maximum").optional(),
});

export type MedicalAppointmentFormData = z.infer<typeof medicalAppointmentSchema>;
