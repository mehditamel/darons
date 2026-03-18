export type InvitationRole = "partner" | "viewer" | "nanny";
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export interface HouseholdInvitation {
  id: string;
  householdId: string;
  inviterId: string;
  inviteeEmail: string;
  role: InvitationRole;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  userId: string;
  role: "owner" | "partner" | "viewer" | "nanny";
  joinedAt: string;
  profile?: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export type ReferralStatus = "pending" | "signed_up" | "subscribed" | "rewarded";
export type RewardType = "free_month" | "discount_20" | "storage_bonus";

export interface Referral {
  id: string;
  referrerId: string;
  referralCode: string;
  referreeId: string | null;
  referreeEmail: string | null;
  status: ReferralStatus;
  rewardType: RewardType;
  rewardApplied: boolean;
  createdAt: string;
  convertedAt: string | null;
}

export interface ExpenseGroup {
  id: string;
  householdId: string | null;
  name: string;
  description: string | null;
  createdBy: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  memberCount?: number;
  totalExpenses?: number;
  myBalance?: number;
}

export interface ExpenseGroupMember {
  id: string;
  groupId: string;
  userId: string | null;
  externalName: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  displayName?: string;
}

export interface SharedExpense {
  id: string;
  groupId: string;
  paidBy: string;
  title: string;
  amount: number;
  currency: string;
  category: string | null;
  expenseDate: string;
  receiptPath: string | null;
  notes: string | null;
  createdAt: string;
  paidByName?: string;
  splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  memberId: string;
  amount: number;
  isSettled: boolean;
  settledAt: string | null;
  createdAt: string;
  memberName?: string;
}

export interface ExpenseSettlement {
  id: string;
  groupId: string;
  fromMember: string;
  toMember: string;
  amount: number;
  settledAt: string;
  notes: string | null;
  createdAt: string;
  fromName?: string;
  toName?: string;
}

export interface MemberBalance {
  memberId: string;
  memberName: string;
  totalPaid: number;
  totalOwed: number;
  balance: number;
}

export interface SettlementSuggestion {
  from: ExpenseGroupMember;
  to: ExpenseGroupMember;
  amount: number;
}

export interface RoundupSettings {
  id: string;
  householdId: string;
  enabled: boolean;
  roundupTo: number;
  targetGoalId: string | null;
  monthlyCap: number;
  totalRounded: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoundupLogEntry {
  id: string;
  householdId: string;
  transactionAmount: number;
  roundupAmount: number;
  goalId: string | null;
  createdAt: string;
}

export interface AdminMetricsDaily {
  id: string;
  metricDate: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  freeUsers: number;
  premiumUsers: number;
  familyProUsers: number;
  mrrCents: number;
  churnCount: number;
  createdAt: string;
}

export const INVITATION_ROLE_LABELS: Record<InvitationRole, string> = {
  partner: "Partenaire",
  viewer: "Lecteur",
  nanny: "Nounou",
};

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  declined: "Refusée",
  expired: "Expirée",
};

export const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  free_month: "1 mois gratuit",
  discount_20: "20% de réduction",
  storage_bonus: "Stockage bonus",
};

export const SHARED_EXPENSE_CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "courses", label: "Courses" },
  { value: "loisirs", label: "Loisirs" },
  { value: "transport", label: "Transport" },
  { value: "logement", label: "Logement" },
  { value: "vacances", label: "Vacances" },
  { value: "cadeaux", label: "Cadeaux" },
  { value: "enfants", label: "Enfants" },
  { value: "autre", label: "Autre" },
] as const;
