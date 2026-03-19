"use client";

import { useState, useCallback } from "react";

export type CelebrationType = "vaccine" | "milestone" | "budget_goal" | "document" | "onboarding";

export function useCelebration() {
  const [activeType, setActiveType] = useState<CelebrationType | null>(null);

  const celebrate = useCallback((type: CelebrationType) => {
    setActiveType(type);
    setTimeout(() => setActiveType(null), 1500);
  }, []);

  return {
    activeType,
    isActive: activeType !== null,
    celebrate,
  };
}
