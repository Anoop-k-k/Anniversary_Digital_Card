"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ClickEffect {
  id: number;
  x: number;
  y: number;
  emoji: string;
  angle: number;
  distance: number;
}

export default function CustomCursor() {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Update cursor position and element hover state
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.onclick ||
          target.getAttribute("role") === "button" ||
          target.classList.contains("cursor-pointer"))
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Click Animation: Burst of glowing hearts, sparkles, and expanding ripple ring
  const handleGlobalClick = useCallback((e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    const now = Date.now();

    // Spawn ripple
    const newRipple = { id: now, x, y };
    setRipples((prev) => [...prev.slice(-8), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== now));
    }, 700);

    // Spawn particle explosion
    const emojis = ["❤️", "💖", "✨", "🌸", "🌹", "💕"];
    const particlesCount = 8;
    const newParticles: ClickEffect[] = Array.from({ length: particlesCount }).map((_, i) => ({
      id: now + i + Math.random(),
      x,
      y,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      angle: (i * (360 / particlesCount) * Math.PI) / 180,
      distance: 35 + Math.random() * 45,
    }));

    setClickEffects((prev) => [...prev.slice(-16), ...newParticles]);
    setTimeout(() => {
      setClickEffects((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 750);
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [handleGlobalClick]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Click Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ opacity: 0.8, scale: 0.2 }}
            animate={{ opacity: 0, scale: 2.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
            }}
            className="absolute w-12 h-12 rounded-full border-2 border-red-500/80 bg-red-400/20 blur-[1px]"
          />
        ))}
      </AnimatePresence>

      {/* Click Heart Particle Explosion */}
      <AnimatePresence>
        {clickEffects.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.x,
              y: p.y,
              scale: 0.4,
              opacity: 1,
            }}
            animate={{
              x: p.x + Math.cos(p.angle) * p.distance,
              y: p.y + Math.sin(p.angle) * p.distance,
              scale: 1.2,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute text-lg select-none transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Desktop Main Glowing Cursor Ring & Heart Dot */}
      <div className="hidden md:block">
        <motion.div
          animate={{
            x: cursorPos.x - (isPointer ? 20 : 14),
            y: cursorPos.y - (isPointer ? 20 : 14),
            scale: isMouseDown ? 0.85 : isPointer ? 1.4 : 1,
          }}
          transition={{ type: "spring", stiffness: 450, damping: 28, mass: 0.5 }}
          className={`absolute w-7 h-7 rounded-full border-2 border-rose-500/80 bg-rose-400/10 backdrop-blur-[1px] shadow-[0_0_15px_rgba(225,29,72,0.5)] flex items-center justify-center ${
            isPointer ? "border-red-600 bg-red-500/20" : ""
          }`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_6px_#dc2626]" />
        </motion.div>

        {/* Trail Floating Micro-Heart */}
        <motion.div
          animate={{
            x: cursorPos.x + 8,
            y: cursorPos.y + 8,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          className="absolute text-xs opacity-75 select-none pointer-events-none"
        >
          ✨
        </motion.div>
      </div>
    </div>
  );
}
