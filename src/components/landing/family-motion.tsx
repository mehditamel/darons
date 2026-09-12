"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";

export function FamilyReadingProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className="family-reading-progress"
      style={{ scaleX: reduced === false ? scrollYProgress : 0 }}
    />
  );
}

/** Pointer-only depth: no looping motion, mobile sensor access or React render per frame. */
export function FamilyDepth({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const element = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(y, { stiffness: 100, damping: 24 });
  const rotateY = useSpring(x, { stiffness: 100, damping: 24 });
  function reset() {
    x.set(0);
    y.set(0);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (reduced !== false || event.pointerType !== "mouse" || !element.current)
      return;
    const bounds = element.current.getBoundingClientRect();
    x.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 7);
    y.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -7);
  }
  return (
    <div
      className="family-depth"
      ref={element}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      <motion.div
        style={{
          rotateX: reduced === false ? rotateX : 0,
          rotateY: reduced === false ? rotateY : 0,
        }}
        className="family-depth-inner"
      >
        {children}
      </motion.div>
    </div>
  );
}
