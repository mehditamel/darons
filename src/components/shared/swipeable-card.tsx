"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  leftLabel = "Ignorer",
  rightLabel = "Action",
  className,
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-threshold, 0, threshold], [0.5, 1, 0.5]);
  const leftOpacity = useTransform(x, [-threshold, -20, 0], [1, 0, 0]);
  const rightOpacity = useTransform(x, [0, 20, threshold], [0, 0, 1]);

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    setIsDragging(false);
    if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    }
  }

  return (
    <div ref={constraintsRef} className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Background labels */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <motion.span
          style={{ opacity: rightOpacity }}
          className="text-xs font-medium text-warm-teal"
        >
          {rightLabel}
        </motion.span>
        <motion.span
          style={{ opacity: leftOpacity }}
          className="text-xs font-medium text-warm-red"
        >
          {leftLabel}
        </motion.span>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        className={cn("relative z-10 touch-pan-y", isDragging && "cursor-grabbing")}
      >
        {children}
      </motion.div>
    </div>
  );
}
