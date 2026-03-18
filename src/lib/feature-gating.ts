import { PLAN_LIMITS, type PlanName } from "@/lib/constants";

export function getPlanLimits(plan: PlanName) {
  return PLAN_LIMITS[plan];
}

export function canAccessFeature(
  plan: PlanName,
  feature: keyof (typeof PLAN_LIMITS)["free"]
): boolean {
  const limits = PLAN_LIMITS[plan];
  const value = limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return true;
}

export function isWithinLimit(
  plan: PlanName,
  feature: "maxAdults" | "maxChildren" | "maxDocuments" | "journalEntriesPerMonth",
  currentCount: number
): boolean {
  const limit = PLAN_LIMITS[plan][feature];
  return currentCount < limit;
}

export function getStorageLimitLabel(plan: PlanName): string {
  const bytes = PLAN_LIMITS[plan].storageBytes;
  if (bytes >= 1024 * 1024 * 1024) {
    return `${bytes / (1024 * 1024 * 1024)} Go`;
  }
  return `${bytes / (1024 * 1024)} Mo`;
}
