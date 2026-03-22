"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = ["Toute", "ta", "vie", "de"];
const subtitle = "Une seule app.";
const rotatingWords = ["daron.", "daronne.", "parent."];

export function LandingAnimations() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    // Start rotating after initial animation completes
    const startTimer = setTimeout(() => {
      setIsRotating(true);
    }, 3000);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!isRotating) return;

    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isRotating]);

  return (
    <div>
      <h1 className="mx-auto max-w-4xl text-4xl font-serif font-bold tracking-tight sm:text-5xl lg:text-6xl">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: i * 0.1,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="inline-block mr-[0.3em]"
          >
            {word}
          </motion.span>
        ))}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.4,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="relative inline-block"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentWordIndex}
              initial={isRotating ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-gradient inline-block"
            >
              {rotatingWords[currentWordIndex]}
            </motion.span>
          </AnimatePresence>
          <motion.svg
            viewBox="0 0 200 12"
            className="absolute -bottom-2 left-0 w-full"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            <motion.path
              d="M 5 8 Q 50 2 100 7 Q 150 12 195 5"
              fill="none"
              stroke="#E8734A"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            />
          </motion.svg>
        </motion.span>{" "}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.5,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="text-primary"
        >
          {subtitle}
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
      >
        Vaccins, budget, impôts, papiers — 100% gratuit, sans piège. 15 outils sans inscription.
      </motion.p>
    </div>
  );
}
