export type AdministrativeTaskCategory =
  | "grossesse"
  | "naissance"
  | "garde"
  | "scolarite"
  | "fiscal"
  | "caf"
  | "sante"
  | "identite"
  | "autre";

export type AdministrativeTaskPriority = "low" | "normal" | "high" | "urgent";

export interface AdministrativeTask {
  id: string;
  householdId: string;
  memberId: string | null;
  title: string;
  description: string | null;
  category: AdministrativeTaskCategory;
  dueDate: string | null;
  triggerAgeMonths: number | null;
  completed: boolean;
  completedAt: string | null;
  url: string | null;
  templateId: string | null;
  priority: AdministrativeTaskPriority;
  createdAt: string;
}

export const TASK_CATEGORY_LABELS: Record<AdministrativeTaskCategory, string> = {
  grossesse: "Grossesse",
  naissance: "Naissance",
  garde: "Garde",
  scolarite: "Scolarité",
  fiscal: "Fiscal",
  caf: "CAF",
  sante: "Santé",
  identite: "Identité",
  autre: "Autre",
};

export const TASK_CATEGORY_COLORS: Record<AdministrativeTaskCategory, string> = {
  grossesse: "#E8734A",
  naissance: "#2BA89E",
  garde: "#4A7BE8",
  scolarite: "#4CAF50",
  fiscal: "#D4A843",
  caf: "#7B5EA7",
  sante: "#E8534A",
  identite: "#607D8B",
  autre: "#9E9E9E",
};

export const TASK_PRIORITY_LABELS: Record<AdministrativeTaskPriority, string> = {
  low: "Faible",
  normal: "Normal",
  high: "Élevée",
  urgent: "Urgent",
};

export const TASK_PRIORITY_COLORS: Record<AdministrativeTaskPriority, string> = {
  low: "#9E9E9E",
  normal: "#4A7BE8",
  high: "#D4A843",
  urgent: "#E8534A",
};
