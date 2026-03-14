"use client";

import { useEffect, useRef, useCallback } from "react";
import type { CharacterState, MountainLayout } from "@/lib/sisyphus/types";
import { renderScene } from "@/lib/sisyphus/sceneRenderer";

type SisyphusCanvasProps = {
  layout: MountainLayout;
  progress: number;
  characterState: CharacterState;
  compact?: boolean;
  lockInMode?: boolean;
  className?: string;
  height?: number;
};

export default function SisyphusCanvas({
  layout,
  progress,
  characterState,
  compact = false,
  lockInMode = false,
  className = "",
  height = 120,
}: SisyphusCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  const progressRef = useRef(progress);
  const displayProgressRef = useRef(progress);
  const isVisibleRef = useRef(true);
  const lastTimeRef = useRef(0);

  // Update target progress
  progressRef.current = progress;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Lerp progress for smooth transitions
    const target = progressRef.current;
    const current = displayProgressRef.current;
    displayProgressRef.current += (target - current) * 0.08;

    renderScene(ctx, layout, displayProgressRef.current, characterState, frameRef.current, compact, lockInMode);
  }, [layout, characterState, compact, lockInMode]);

  // Animation loop
  useEffect(() => {
    const targetFps = compact ? 15 : 60;
    const frameInterval = 1000 / targetFps;

    function loop(time: number) {
      animRef.current = requestAnimationFrame(loop);

      if (!isVisibleRef.current) return;

      const delta = time - lastTimeRef.current;
      if (delta < frameInterval) return;

      lastTimeRef.current = time - (delta % frameInterval);
      frameRef.current++;
      render();
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [compact, render]);

  // ResizeObserver for responsive canvas
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      render();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    return () => observer.disconnect();
  }, [render]);

  // IntersectionObserver to pause when off-screen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, width: "100%", position: "relative" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
