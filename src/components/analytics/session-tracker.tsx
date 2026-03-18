"use client";

import { useEffect } from "react";
import { recordSession } from "@/lib/analytics";

export function SessionTracker() {
  useEffect(() => {
    recordSession();
  }, []);

  return null;
}
