"use client";

import { useEffect, useState } from "react";

interface ConfettiEffectProps {
  trigger: boolean;
}

const COLORS = [
  "#E8734A", // warm-orange
  "#2BA89E", // warm-teal
  "#4A7BE8", // warm-blue
  "#7B5EA7", // warm-purple
  "#D4A843", // warm-gold
  "#4CAF50", // warm-green
  "#E8534A", // warm-red
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  shape: "circle" | "square" | "triangle";
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function ConfettiEffect({ trigger }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const shapes: Array<"circle" | "square" | "triangle"> = ["circle", "square", "triangle"];
    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: randomBetween(20, 80),
      y: randomBetween(-10, 0),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(6, 12),
      rotation: randomBetween(0, 360),
      velocityX: randomBetween(-3, 3),
      velocityY: randomBetween(2, 6),
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));

    setParticles(newParticles);
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible || particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== "triangle" ? p.color : "transparent",
            borderRadius: p.shape === "circle" ? "50%" : "0",
            borderLeft: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === "triangle" ? `${p.size}px solid ${p.color}` : undefined,
            transform: `rotate(${p.rotation}deg)`,
            animationDuration: `${randomBetween(2, 3.5)}s`,
            animationDelay: `${randomBetween(0, 0.5)}s`,
          }}
        />
      ))}
    </div>
  );
}
