"use client";

import { useEffect, useState } from "react";

export function useAnimationLoop(active: boolean, fps = 15) {
  const [frame, setFrame] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (!active || prefersReducedMotion) {
      return;
    }

    let animationFrame = 0;
    let lastTimestamp = 0;
    const frameDuration = 1000 / fps;

    const tick = (timestamp: number) => {
      if (timestamp - lastTimestamp >= frameDuration) {
        lastTimestamp = timestamp;
        setFrame((current) => (current + 1) % 10000);
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [active, fps, prefersReducedMotion]);

  return active && !prefersReducedMotion ? frame : 0;
}
