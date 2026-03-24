import { unstable_cache } from "next/cache";

// Revalidation tags for the dashboard cache
export const CACHE_TAGS = {
  dashboard: "dashboard",
  alerts: "alerts",
  family: "family",
  health: "health",
  budget: "budget",
  fiscal: "fiscal",
  documents: "documents",
  activities: "activities",
} as const;

// Default cache TTL: 60 seconds (dashboard auto-refreshes on navigation)
const DEFAULT_REVALIDATE = 60;

/**
 * Cached wrapper for server-side data fetching.
 * Uses Next.js unstable_cache with tag-based revalidation.
 *
 * Usage:
 *   const data = await cachedFetch(
 *     ["dashboard", userId],
 *     () => fetchDashboardData(userId),
 *     { tags: ["dashboard"], revalidate: 60 }
 *   );
 */
export function cachedFetch<T>(
  keyParts: string[],
  fetchFn: () => Promise<T>,
  options?: { tags?: string[]; revalidate?: number }
): Promise<T> {
  const cached = unstable_cache(
    fetchFn,
    keyParts,
    {
      tags: options?.tags ?? [CACHE_TAGS.dashboard],
      revalidate: options?.revalidate ?? DEFAULT_REVALIDATE,
    }
  );
  return cached();
}
