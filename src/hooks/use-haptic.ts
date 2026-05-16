"use client";

import * as React from "react";

type VibratePattern = number | number[];

function vibrate(pattern: VibratePattern) {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  try {
    navigator.vibrate(pattern);
  } catch {
    // Silent fail — vibration is best-effort UX, never a blocker.
  }
}

export function useHaptic() {
  const tap = React.useCallback(() => vibrate(15), []);
  const success = React.useCallback(() => vibrate([20, 40, 20]), []);
  const warning = React.useCallback(() => vibrate([60, 30, 60]), []);
  const error = React.useCallback(() => vibrate([120, 60, 120]), []);

  return { tap, success, warning, error };
}
