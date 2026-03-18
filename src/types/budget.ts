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

export interface SavingsGoal {
  id: string;
  householdId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  icon: string | null;
  active: boolean;
  createdAt: string;
}

export interface BudgetSummary {
  month: string;
  totalExpenses: number;
  totalIncome: number;
  totalAllocations: number;
  netBalance: number;
  byCategory: Record<string, number>;
  byMember: Record<string, number>;
  entryCount: number;
}

export const BUDGET_CATEGORY_COLORS: Record<BudgetCategory, string> = {
  alimentation: "#E8734A",
  sante: "#2BA89E",
  garde: "#4A7BE8",
  vetements: "#7B5EA7",
  loisirs: "#D4A843",
  scolarite: "#4CAF50",
  transport: "#607D8B",
  logement: "#795548",
  assurance: "#9E9E9E",
  autre: "#BDBDBD",
};

export const CAF_ALLOCATION_TYPES = [
  { value: "PAJE_prime_naissance", label: "PAJE - Prime naissance" },
  { value: "PAJE_allocation_base", label: "PAJE - Allocation de base" },
  { value: "CMG", label: "CMG (Complément mode de garde)" },
  { value: "allocations_familiales", label: "Allocations familiales" },
  { value: "allocation_rentree", label: "Allocation de rentrée scolaire" },
  { value: "APL", label: "APL (Aide au logement)" },
  { value: "prime_activite", label: "Prime d'activité" },
  { value: "ASF", label: "ASF (Allocation de soutien familial)" },
  { value: "autre", label: "Autre allocation" },
] as const;

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
