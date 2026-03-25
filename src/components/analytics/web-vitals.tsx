"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/analytics";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const { name, value, rating } = metric;

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${name}: ${Math.round(value)}ms (${rating})`);
    }

    // Send to Plausible as custom event
    if (typeof window !== "undefined") {
      const plausible = (window as unknown as Record<string, unknown>).plausible as
        | ((event: string, options?: { props: Record<string, unknown> }) => void)
        | undefined;

      if (plausible) {
        plausible("Web Vitals", {
          props: {
            metric_name: name,
            metric_value: Math.round(value),
            metric_rating: rating,
          },
        });
      }
    }
  });

  return null;
}
