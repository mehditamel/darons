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

// Phase 7 — Santé enrichie validators

export const healthExaminationSchema = z.object({
  memberId: z.string().uuid("Membre invalide"),
  examNumber: z.number().int().min(1).max(20),
  examAgeLabel: z.string().min(1, "Le libellé d'âge est requis"),
  completedDate: z.string().min(1, "La date de l'examen est requise"),
  practitioner: z.string().max(100, "100 caractères maximum").optional(),
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
  screenExposureNotes: z.string().max(1000, "1000 caractères maximum").optional(),
  tndScreeningNotes: z.string().max(1000, "1000 caractères maximum").optional(),
  notes: z.string().max(500, "500 caractères maximum").optional(),
});

export type HealthExaminationFormData = z.infer<typeof healthExaminationSchema>;

export const dailyHealthJournalSchema = z.object({
  memberId: z.string().uuid("Membre invalide"),
  entryDate: z.string().min(1, "La date est requise"),
  mood: z.enum(["great", "good", "neutral", "difficult", "tough"]).optional(),
  sleepHours: z
    .union([z.number().min(0).max(24, "Maximum 24 heures"), z.nan()])
    .optional()
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  sleepQuality: z.enum(["excellent", "good", "average", "poor", "very_poor"]).optional(),
  appetite: z.enum(["good", "average", "poor"]).optional(),
  stools: z.enum(["normal", "liquid", "hard", "absent"]).optional(),
  screenTimeMinutes: z
    .union([z.number().int().min(0, "Le temps d'écran doit être positif"), z.nan()])
    .optional()
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  notes: z.string().max(500, "500 caractères maximum").optional(),
});

export type DailyHealthJournalFormData = z.infer<typeof dailyHealthJournalSchema>;

export const allergySchema = z.object({
  memberId: z.string().uuid("Membre invalide"),
  allergen: z.string().min(1, "L'allergène est requis").max(100, "100 caractères maximum"),
  severity: z.enum(["mild", "moderate", "severe"]),
  reaction: z.string().max(200, "200 caractères maximum").optional(),
  diagnosedDate: z.string().optional(),
  notes: z.string().max(500, "500 caractères maximum").optional(),
});

export type AllergyFormData = z.infer<typeof allergySchema>;

export const prescriptionSchema = z.object({
  memberId: z.string().uuid("Membre invalide"),
  practitioner: z.string().max(100, "100 caractères maximum").optional(),
  prescriptionDate: z.string().optional(),
  notes: z.string().max(500, "500 caractères maximum").optional(),
});

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
