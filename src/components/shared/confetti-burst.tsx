"use client";

import { useState, useCallback } from "react";

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  delay: number;
}

const COLORS = ["#E8734A", "#2BA89E", "#4A7BE8", "#7B5EA7", "#D4A843", "#4CAF50"];

function generateParticles(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: -(Math.random() * 150 + 50),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 720 - 360,
    scale: Math.random() * 0.6 + 0.4,
    delay: Math.random() * 0.3,
  }));
}

interface ConfettiBurstProps {
  active: boolean;
  onComplete?: () => void;
}

export function ConfettiBurst({ active, onComplete }: ConfettiBurstProps) {
  const [particles] = useState(() => generateParticles(20));

  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      onAnimationEnd={onComplete}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute left-1/2 top-1/2 block h-2 w-2 rounded-sm"
          style={{
            backgroundColor: p.color,
            animation: `confetti-pop 0.8s ease-out ${p.delay}s both`,
            transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg) scale(${p.scale})`,
          }}
        />
      ))}
    </div>
  );
}

export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback(() => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 1200);
  }, []);

  return { isActive, trigger };
}
