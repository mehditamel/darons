"use client";

import { useEffect, useState } from "react";

interface UseHideOnScrollOptions {
  threshold?: number;
  disabled?: boolean;
}

/**
 * Returns `true` when the user is scrolling down past the threshold,
 * `false` when scrolling up or near the top. Used to hide sticky chrome
 * (e.g. bottom navigation) while reading content.
 */
export function useHideOnScroll({
  threshold = 24,
  disabled = false,
}: UseHideOnScrollOptions = {}): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        // Always show near the top of the page
        if (y < 80) {
          setHidden(false);
        } else if (delta > threshold) {
          setHidden(true);
          lastY = y;
        } else if (delta < -threshold) {
          setHidden(false);
          lastY = y;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, disabled]);

  return hidden;
}
