"use client";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

interface ScrollSectionProps {
  children: React.ReactNode;
  direction?: "up" | "left" | "right" | "scale";
  className?: string;
}

export function ScrollSection({ children, direction = "up", className }: ScrollSectionProps) {
  return (
    <ScrollReveal direction={direction}>
      <div className={className}>{children}</div>
    </ScrollReveal>
  );
}
