// Fast-path cache for "the current user already has a household".
// Used by the auth middleware to avoid a DB roundtrip on every protected
// navigation (the onboarding redirect only needs to know if a household exists).
// Set when a household is created and cleared when it is deleted (RGPD).
export const HAS_HOUSEHOLD_COOKIE = "has_household";
export const HAS_HOUSEHOLD_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours
