"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouching = useRef(false);

  const isAtTop = useCallback(() => {
    if (!containerRef.current) return false;
    return window.scrollY <= 0;
  }, []);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    if (!isTouchDevice) return;

    function handleTouchStart(e: TouchEvent) {
      if (isAtTop() && !isRefreshing) {
        startY.current = e.touches[0].clientY;
        isTouching.current = true;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (!isTouching.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0 && isAtTop()) {
        const dampened = Math.min(diff * 0.4, threshold * 1.5);
        setPullDistance(dampened);
      }
    }

    async function handleTouchEnd() {
      if (!isTouching.current) return;
      isTouching.current = false;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(threshold * 0.5);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isAtTop, isRefreshing, onRefresh, pullDistance, threshold]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-200 z-20",
          pullDistance > 0 || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: Math.max(pullDistance - 40, -40),
          transform: `translateX(-50%) rotate(${progress * 360}deg)`,
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-md border">
          <Loader2
            className={cn(
              "h-4 w-4 text-warm-orange",
              isRefreshing && "animate-spin"
            )}
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
