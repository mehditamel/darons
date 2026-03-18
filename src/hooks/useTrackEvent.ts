"use client";

import { useCallback } from "react";
import { trackEvent, type AnalyticsEventName, type AnalyticsEventData } from "@/lib/analytics";

export function useTrackEvent() {
  return useCallback(
    <T extends AnalyticsEventName>(
      eventName: T,
      props?: AnalyticsEventData[T]
    ) => {
      trackEvent(eventName, props);
    },
    []
  );
}
