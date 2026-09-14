"use client";

import React, { useEffect, useRef } from "react";

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  type: "heart" | "star" | "orb";
}

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.05;
      mouseY = (e.clientY - height / 2) * 0.05;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Generate 3D particles
    const colors = ["#ef4444", "#f43f5e", "#fb7185", "#f472b6", "#fbbf24", "#fda4af"];
    const particlesCount = 45;
    const particles: Particle3D[] = [];

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.4 - Math.random() * 0.6, // floating upwards
        vz: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 16 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
        type: i % 3 === 0 ? "heart" : i % 3 === 1 ? "star" : "orb",
      });
    }

    // Helper to render a 3D heart shape on canvas
    const draw3DHeart = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      rotation: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 15;

      context.beginPath();
      const topCurveHeight = size * 0.3;
      context.moveTo(0, topCurveHeight);
      // top left curve
      context.bezierCurveTo(
        -size / 2,
        -size / 2,
        -size,
        topCurveHeight / 2,
        0,
        size
      );
      // top right curve
      context.bezierCurveTo(
        size,
        topCurveHeight / 2,
        size / 2,
        -size / 2,
        0,
        topCurveHeight
      );
      context.closePath();
      context.fill();

      // Highlight sheen
      context.fillStyle = "rgba(255, 255, 255, 0.4)";
      context.beginPath();
      context.arc(-size * 0.25, -size * 0.1, size * 0.15, 0, Math.PI * 2);
      context.fill();

      context.restore();
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const focalLength = 500;
      const centerX = width / 2 + mouseX;
      const centerY = height / 2 + mouseY;

      // Sort particles by depth Z for proper 3D layering
      particles.sort((a, b) => b.z - a.z);

      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.rotation += p.vRot;

        // Wrap around bounds
        if (p.y < -height) p.y = height;
        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.z < 50) p.z = 800;

        // 3D perspective projection formula: scale = focalLength / (focalLength + z)
        const scale = focalLength / (focalLength + p.z);
        const projX = centerX + p.x * scale;
        const projY = centerY + p.y * scale;
        const projSize = p.size * scale;
        const opacity = Math.min(1, Math.max(0.1, (1000 - p.z) / 900));

        ctx.globalAlpha = opacity;

        if (p.type === "heart") {
          draw3DHeart(ctx, projX, projY, projSize, p.color, p.rotation);
        } else if (p.type === "star") {
          ctx.save();
          ctx.translate(projX, projY);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, 0, projSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(projX, projY, projSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70 transition-opacity duration-1000"
    />
  );
}
