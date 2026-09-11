"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!isInView || reducedMotion || duration <= 0) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();
    const durationMs = duration * 1000;

    let frame = 0;
    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(eased * value);

      if (progress < 1) {
        frame = requestAnimationFrame(update);
      }
    }

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration, reducedMotion]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString("fr-FR");

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{prefix}{value.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>
      <span aria-hidden="true">{prefix}{formatted}{suffix}</span>
    </span>
  );
}
