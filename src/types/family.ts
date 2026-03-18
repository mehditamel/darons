export type MemberType = "adult" | "child";
export type Gender = "M" | "F";
export type DocumentType = "cni" | "passeport" | "livret_famille" | "acte_naissance" | "carte_vitale" | "autre";
export type DocumentStatus = "valid" | "expiring_soon" | "expired";
export type SubscriptionPlan = "free" | "premium" | "family_pro";
export type UserRole = "owner" | "partner" | "viewer";

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl: string | null;
  subscriptionPlan: SubscriptionPlan;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Household {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  householdId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  memberType: MemberType;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IdentityDocument {
  id: string;
  memberId: string;
  documentType: DocumentType;
  documentNumber: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  issuingAuthority: string | null;
  filePath: string | null;
  status: DocumentStatus;
  createdAt: string;
}

export type ConsentType =
  | "terms_of_service"
  | "privacy_policy"
  | "health_data"
  | "open_banking"
  | "ai_processing"
  | "email_notifications"
  | "sms_notifications"
  | "push_notifications"
  | "analytics";

export interface UserConsent {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  grantedAt: string;
  revokedAt: string | null;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  cni: "Carte nationale d'identit\u00e9",
  passeport: "Passeport",
  livret_famille: "Livret de famille",
  acte_naissance: "Acte de naissance",
  carte_vitale: "Carte vitale",
  autre: "Autre",
};

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  adult: "Adulte",
  child: "Enfant",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  valid: "Valide",
  expiring_soon: "\u00c0 renouveler",
  expired: "Expir\u00e9",
};
