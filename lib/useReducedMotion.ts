"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion`. When true, the Act components skip all
 * scrub/pin choreography and render static end-states with normal scrolling
 * (see §8). Returns `false` during SSR / first paint to avoid hydration drift,
 * then resolves on mount.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
