export type AlertPriority = "high" | "medium" | "low";
export type AlertCategory = "identite" | "sante" | "fiscal" | "caf" | "scolarite" | "budget";

export interface ProactiveAlert {
  id: string;
  householdId: string;
  priority: AlertPriority;
  category: AlertCategory;
  title: string;
  message: string;
  actionUrl: string | null;
  dueDate: string | null;
  dismissed: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export interface AiCoachResponse {
  message: string;
  suggestions: AiCoachSuggestion[];
}

export interface AiCoachSuggestion {
  title: string;
  description: string;
  estimatedSaving: string | null;
}

export interface MonthlySummary {
  month: string;
  health: string;
  development: string;
  budget: string;
  admin: string;
  priorities: string[];
  generatedAt: string;
}

export interface ActivitySuggestion {
  name: string;
  ageRange: string;
  benefits: string;
  frequency: string;
  estimatedCost: string;
  searchKeyword: string;
}

export interface AiUsageInfo {
  used: number;
  limit: number;
  remaining: number;
}
