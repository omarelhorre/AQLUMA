"use client";

import { useSmoothScroll } from "@/lib/lenis";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Mounts global Lenis smooth scroll + GSAP/ScrollTrigger sync.
 * Renders nothing; place once near the root (see app/layout.tsx).
 */
export default function SmoothScroll() {
  const reduced = useReducedMotion();
  useSmoothScroll(!reduced);
  return null;
}
