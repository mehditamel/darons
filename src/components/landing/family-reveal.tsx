"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Keep server-rendered content visible; animate only after motion preference is known. */
export function FamilyReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={false}
      whileInView={
        reducedMotion === false
          ? { y: [16, 0], opacity: [0.65, 1] }
          : { y: 0, opacity: 1 }
      }
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: reducedMotion === false ? 0.55 : 0,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
