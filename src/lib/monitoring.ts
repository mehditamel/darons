/**
 * Error monitoring abstraction.
 *
 * In development: logs to console.
 * In production: sends to Sentry when SENTRY_DSN is configured.
 *
 * To enable Sentry:
 * 1. npm install @sentry/nextjs
 * 2. Set SENTRY_DSN in environment variables
 * 3. Update this file to import and initialize Sentry
 */

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SENTRY_DSN = process.env.SENTRY_DSN;

/**
 * Capture an exception for monitoring.
 * Safe to call anywhere — gracefully degrades to console.error.
 */
export function captureException(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (IS_PRODUCTION && SENTRY_DSN) {
    // When Sentry is installed, replace this block:
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.captureException(error, { extra: context });
    console.error("[monitoring]", error, context);
  } else {
    console.error("[monitoring]", error, context);
  }
}

/**
 * Log a message for monitoring (non-error).
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>
): void {
  if (IS_PRODUCTION && SENTRY_DSN) {
    // Sentry.captureMessage(message, { level, extra: context });
    console[level === "warning" ? "warn" : level]("[monitoring]", message, context);
  } else {
    console[level === "warning" ? "warn" : level]("[monitoring]", message, context);
  }
}
