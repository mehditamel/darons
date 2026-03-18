export type BudgetCategory =
  | "alimentation"
  | "sante"
  | "garde"
  | "vetements"
  | "loisirs"
  | "scolarite"
  | "transport"
  | "logement"
  | "assurance"
  | "autre";

export type DocumentCategory =
  | "identite"
  | "sante"
  | "fiscal"
  | "scolaire"
  | "caf"
  | "assurance"
  | "logement"
  | "autre";

export interface BudgetEntry {
  id: string;
  householdId: string;
  memberId: string | null;
  month: string;
  category: BudgetCategory;
  label: string;
  amount: number;
  isRecurring: boolean;
  notes: string | null;
  createdAt: string;
}

export interface CafAllocation {
  id: string;
  householdId: string;
  allocationType: string;
  monthlyAmount: number;
  startDate: string;
  endDate: string | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
}

export interface Document {
  id: string;
  householdId: string;
  memberId: string | null;
  category: DocumentCategory;
  title: string;
  description: string | null;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  tags: string[];
  uploadedAt: string;
}

export interface Activity {
  id: string;
  memberId: string;
  name: string;
  category: string | null;
  provider: string | null;
  schedule: string | null;
  costMonthly: number | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
}

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  alimentation: "Alimentation",
  sante: "Sant\u00e9",
  garde: "Garde",
  vetements: "V\u00eatements",
  loisirs: "Loisirs",
  scolarite: "Scolarit\u00e9",
  transport: "Transport",
  logement: "Logement",
  assurance: "Assurance",
  autre: "Autre",
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  identite: "Identit\u00e9",
  sante: "Sant\u00e9",
  fiscal: "Fiscal",
  scolaire: "Scolaire",
  caf: "CAF",
  assurance: "Assurance",
  logement: "Logement",
  autre: "Autre",
};
