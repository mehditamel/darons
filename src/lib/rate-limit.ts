/**
 * Rate limiter with Upstash Redis support and in-memory fallback.
 *
 * When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set,
 * uses Upstash Redis for production-grade distributed rate limiting.
 * Otherwise falls back to in-memory store (suitable for dev/preview).
 */

// --- In-memory fallback ---

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function rateLimitMemory(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > limit;
}

// --- Upstash Redis implementation ---

let upstashAvailable: boolean | null = null;

async function rateLimitUpstash(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    upstashAvailable = false;
    return rateLimitMemory(key, limit, windowMs);
  }

  try {
    const windowSec = Math.ceil(windowMs / 1000);
    const redisKey = `ratelimit:${key}`;

    // INCR + EXPIRE atomic pattern via Upstash REST API
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSec.toString()],
      ]),
    });

    if (!response.ok) {
      return rateLimitMemory(key, limit, windowMs);
    }

    const results = (await response.json()) as Array<{ result: number }>;
    const count = results[0]?.result ?? 0;
    upstashAvailable = true;
    return count > limit;
  } catch {
    // Fallback to memory on network errors
    return rateLimitMemory(key, limit, windowMs);
  }
}

// --- Public API ---

/**
 * Returns `true` if the request should be rate-limited (blocked).
 *
 * @param key - Unique identifier (e.g. "ai-coach:user-id")
 * @param limit - Maximum number of requests per window
 * @param windowMs - Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  // Use synchronous memory fallback when Upstash is known unavailable
  if (upstashAvailable === false) {
    return rateLimitMemory(key, limit, windowMs);
  }
  // For first call or when Upstash is available, still provide sync fallback
  // Callers needing async should use rateLimitAsync
  return rateLimitMemory(key, limit, windowMs);
}

/**
 * Async rate limiter — uses Upstash Redis when available.
 * Prefer this in API routes where async is natural.
 */
export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  return rateLimitUpstash(key, limit, windowMs);
}
