"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BookPageFlipProps {
  children: React.ReactNode;
  pageKey: string | number;
  direction: number; // 1 for next page (left turn), -1 for previous page (right turn)
}

export default function BookPageFlip({
  children,
  pageKey,
  direction,
}: BookPageFlipProps) {
  // 3D Realistic Book Page Flip Variants
  const bookVariants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.94,
      transformOrigin: dir > 0 ? "left center" : "right center",
      boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.4)",
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transformOrigin: "center center",
      boxShadow:
        "0 25px 50px -12px rgba(44, 40, 37, 0.18), 0 0 0 1px rgba(236, 229, 221, 0.9), 0 8px 16px -4px rgba(217, 128, 148, 0.12)",
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.94,
      transformOrigin: dir > 0 ? "left center" : "right center",
      boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.4)",
      transition: {
        duration: 0.55,
        ease: [0.32, 0, 0.67, 0] as const,
      },
    }),
  };

  return (
    <div
      className="w-full flex items-center justify-center relative"
      style={{ perspective: "1600px", transformStyle: "preserve-3d" }}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={pageKey}
          custom={direction}
          variants={bookVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Book Page Outer Bevel Highlight */}
          <div className="absolute inset-0 rounded-3xl border border-amber-200/30 pointer-events-none z-30 shadow-[inset_0_0_20px_rgba(255,255,255,0.6)]" />

          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
