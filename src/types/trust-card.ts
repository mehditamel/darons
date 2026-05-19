export const TRUST_CARD_SECTIONS = [
  "allergies",
  "vaccinations",
  "emergency",
  "practitioners",
  "routines",
  "identite",
] as const;

export type TrustCardSection = (typeof TRUST_CARD_SECTIONS)[number];

export interface TrustCard {
  id: string;
  householdId: string;
  memberId: string;
  createdBy: string;
  label: string | null;
  token: string;
  sections: TrustCardSection[];
  notes: string | null;
  expiresAt: string;
  revokedAt: string | null;
  accessCount: number;
  lastAccessedAt: string | null;
  createdAt: string;
}

export interface TrustCardWithMember extends TrustCard {
  memberFirstName: string;
  memberLastName: string;
  memberBirthDate: string;
}

export type TrustCardStatus = "active" | "expired" | "revoked" | "locked";

export function getTrustCardStatus(card: TrustCard, lockedUntil?: string | null): TrustCardStatus {
  if (card.revokedAt) return "revoked";
  if (lockedUntil && new Date(lockedUntil) > new Date()) return "locked";
  if (new Date(card.expiresAt) < new Date()) return "expired";
  return "active";
}

export interface TrustCardPayload {
  childFirstName: string;
  childBirthDate: string;
  childPhotoUrl: string | null;
  sections: TrustCardSection[];
  notes: string | null;
  allergies?: Array<{ allergen: string; severity: string; reaction: string | null }>;
  vaccinations?: Array<{ vaccineName: string; administeredDate: string | null; nextDueDate: string | null; status: string }>;
  emergencyContacts?: Array<{ label: string; phone: string }>;
  practitioners?: Array<{ name: string; type: string; phone: string | null }>;
  identite?: { firstName: string; lastName: string; birthDate: string; bloodType: string | null };
  expiresAt: string;
  generatedAt: string;
}
