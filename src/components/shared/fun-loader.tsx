"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "On calcule...",
  "Patience, on bosse pour toi...",
  "Presque là...",
  "On vérifie les barèmes...",
  "Ça arrive...",
];

interface FunLoaderProps {
  className?: string;
}

export function FunLoader({ className }: FunLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center gap-4 ${className ?? ""}`}>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-warm-orange animate-bounce-gentle"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground animate-fade-in-up">
        {MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
