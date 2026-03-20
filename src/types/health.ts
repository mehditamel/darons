export type VaccinationStatus = "done" | "pending" | "overdue" | "skipped";
export type ExamStatus = "upcoming" | "completed" | "missed";
export type MilestoneCategory = "motricite" | "langage" | "cognition" | "social" | "autonomie";
export type Mood = "great" | "good" | "neutral" | "difficult" | "tough";

export type SyncSource = "local" | "fhir";

export interface Vaccination {
  id: string;
  memberId: string;
  vaccineName: string;
  vaccineCode: string | null;
  doseNumber: number;
  administeredDate: string | null;
  nextDueDate: string | null;
  practitioner: string | null;
  batchNumber: string | null;
  notes: string | null;
  status: VaccinationStatus;
  fhirResourceId?: string | null;
  fhirLastUpdated?: string | null;
  syncSource?: SyncSource;
  createdAt: string;
}

export interface MedicalAppointment {
  id: string;
  memberId: string;
  appointmentType: string;
  practitioner: string | null;
  location: string | null;
  appointmentDate: string;
  notes: string | null;
  completed: boolean;
  createdAt: string;
}

export interface GrowthMeasurement {
  id: string;
  memberId: string;
  measurementDate: string;
  weightKg: number | null;
  heightCm: number | null;
  headCircumferenceCm: number | null;
  notes: string | null;
  fhirResourceId?: string | null;
  fhirLastUpdated?: string | null;
  syncSource?: SyncSource;
  createdAt: string;
}

export interface DevelopmentMilestone {
  id: string;
  memberId: string;
  category: MilestoneCategory;
  milestoneName: string;
  expectedAgeMonths: number | null;
  achievedDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ParentJournalEntry {
  id: string;
  memberId: string;
  entryDate: string;
  content: string;
  mood: Mood | null;
  tags: string[];
  createdAt: string;
}

export interface HealthExamination {
  id: string;
  memberId: string;
  examNumber: number;
  examAgeLabel: string;
  scheduledDate: string | null;
  completedDate: string | null;
  practitioner: string | null;
  weightKg: number | null;
  heightCm: number | null;
  headCircumferenceCm: number | null;
  screenExposureNotes: string | null;
  tndScreeningNotes: string | null;
  notes: string | null;
  status: ExamStatus;
  createdAt: string;
}

export const MILESTONE_CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  motricite: "Motricité",
  langage: "Langage",
  cognition: "Cognition",
  social: "Social",
  autonomie: "Autonomie",
};

export const MOOD_LABELS: Record<Mood, string> = {
  great: "Super",
  good: "Bien",
  neutral: "Neutre",
  difficult: "Difficile",
  tough: "Dur",
};

export const VACCINATION_STATUS_LABELS: Record<VaccinationStatus, string> = {
  done: "Fait",
  pending: "Planifié",
  overdue: "En retard",
  skipped: "Non fait",
};

// Phase 7 — Santé enrichie types

export type SleepQuality = "excellent" | "good" | "average" | "poor" | "very_poor";
export type Appetite = "good" | "average" | "poor";
export type StoolType = "normal" | "liquid" | "hard" | "absent";
export type AllergySeverity = "mild" | "moderate" | "severe";

export interface DailyHealthJournal {
  id: string;
  memberId: string;
  entryDate: string;
  mood: Mood | null;
  sleepHours: number | null;
  sleepQuality: SleepQuality | null;
  appetite: Appetite | null;
  stools: StoolType | null;
  screenTimeMinutes: number | null;
  physicalActivityMinutes: number | null;
  notes: string | null;
  createdAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  memberId: string;
  householdId: string;
  scanFilePath: string | null;
  ocrText: string | null;
  medications: Medication[];
  practitioner: string | null;
  prescriptionDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Allergy {
  id: string;
  memberId: string;
  allergen: string;
  severity: AllergySeverity;
  reaction: string | null;
  diagnosedDate: string | null;
  active: boolean;
  notes: string | null;
  fhirResourceId?: string | null;
  fhirLastUpdated?: string | null;
  syncSource?: SyncSource;
  createdAt: string;
}

export const SLEEP_QUALITY_LABELS: Record<SleepQuality, string> = {
  excellent: "Excellent",
  good: "Bon",
  average: "Moyen",
  poor: "Mauvais",
  very_poor: "Très mauvais",
};

export const APPETITE_LABELS: Record<Appetite, string> = {
  good: "Bon",
  average: "Moyen",
  poor: "Faible",
};

export const STOOL_LABELS: Record<StoolType, string> = {
  normal: "Normal",
  liquid: "Liquide",
  hard: "Dur",
  absent: "Absent",
};

export const ALLERGY_SEVERITY_LABELS: Record<AllergySeverity, string> = {
  mild: "Légère",
  moderate: "Modérée",
  severe: "Sévère",
};

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  upcoming: "À venir",
  completed: "Réalisé",
  missed: "Manqué",
};

export const MOOD_ICONS: Record<Mood, string> = {
  great: "☀",
  good: "🌤",
  neutral: "☁",
  difficult: "🌧",
  tough: "⛈",
};
