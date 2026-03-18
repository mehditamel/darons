// Analytics event definitions and tracking utilities

export const ANALYTICS_EVENTS = {
  // Onboarding
  onboarding_started: "onboarding_started",
  onboarding_step_completed: "onboarding_step_completed",
  onboarding_completed: "onboarding_completed",

  // Modules
  document_added: "document_added",
  vaccine_recorded: "vaccine_recorded",
  growth_measured: "growth_measured",
  journal_entry_created: "journal_entry_created",
  budget_transaction_added: "budget_transaction_added",
  bank_connected: "bank_connected",
  fiscal_simulation_run: "fiscal_simulation_run",
  garde_search_performed: "garde_search_performed",
  ai_coach_used: "ai_coach_used",
  milestone_achieved: "milestone_achieved",
  activity_added: "activity_added",

  // Conversion
  pricing_page_viewed: "pricing_page_viewed",
  checkout_started: "checkout_started",
  subscription_activated: "subscription_activated",
  subscription_cancelled: "subscription_cancelled",

  // Engagement
  alert_clicked: "alert_clicked",
  monthly_summary_opened: "monthly_summary_opened",
  document_exported: "document_exported",
} as const;

export type AnalyticsEventName = keyof typeof ANALYTICS_EVENTS;

export type AnalyticsEventData = {
  onboarding_started: Record<string, never>;
  onboarding_step_completed: { step: number };
  onboarding_completed: { durationSeconds: number };
  document_added: { type: string };
  vaccine_recorded: { vaccineCode: string };
  growth_measured: Record<string, never>;
  journal_entry_created: Record<string, never>;
  budget_transaction_added: { source: "manual" | "bank_sync" };
  bank_connected: { bankName: string };
  fiscal_simulation_run: Record<string, never>;
  garde_search_performed: { city: string };
  ai_coach_used: { module: string };
  milestone_achieved: { category: string };
  activity_added: { category: string };
  pricing_page_viewed: Record<string, never>;
  checkout_started: { plan: string };
  subscription_activated: { plan: string };
  subscription_cancelled: { plan: string; reason?: string };
  alert_clicked: { alertType: string };
  monthly_summary_opened: Record<string, never>;
  document_exported: { format: "pdf" | "csv" | "json" };
};

/**
 * Track a custom event to Plausible Analytics.
 * Safe to call server-side (no-op) or client-side.
 */
export function trackEvent<T extends AnalyticsEventName>(
  eventName: T,
  props?: AnalyticsEventData[T]
): void {
  if (typeof window === "undefined") return;

  // Plausible custom event API
  const plausible = (window as unknown as Record<string, unknown>).plausible as
    | ((event: string, options?: { props: Record<string, unknown> }) => void)
    | undefined;

  if (plausible) {
    plausible(eventName, props ? { props: props as Record<string, unknown> } : undefined);
  }
}

/**
 * Record a session ping to Supabase for DAU/MAU tracking.
 * Should be called once per page load from a client component.
 */
export async function recordSession(): Promise<void> {
  try {
    await fetch("/api/analytics/session", { method: "POST" });
  } catch {
    // Silent fail — analytics should never block UX
  }
}
