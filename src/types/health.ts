export type VaccinationStatus = "done" | "pending" | "overdue" | "skipped";
export type ExamStatus = "upcoming" | "completed" | "missed";
export type MilestoneCategory = "motricite" | "langage" | "cognition" | "social" | "autonomie";
export type Mood = "great" | "good" | "neutral" | "difficult" | "tough";

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
  motricite: "Motricit\u00e9",
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
  pending: "Planifi\u00e9",
  overdue: "En retard",
  skipped: "Non fait",
};
