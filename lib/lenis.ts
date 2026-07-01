"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Module-level handle so UI (header logo, nav) can drive smooth scrolling.
let lenisInstance: Lenis | null = null;

// One scroll feel everywhere — the wheel-driven smoothing and programmatic
// scrollTo share the same duration (mirrors the `scroll` motion-duration token).
const LENIS_DURATION = 1.1;

/**
 * Freeze / resume the smooth-scroll driver — used by full-screen overlays (e.g.
 * the worlds video lightbox) so the pinned ribbon underneath can't scroll while a
 * modal is open. No-op when Lenis is off (reduced motion / SSR).
 */
export function setSmoothScrollPaused(paused: boolean) {
  if (!lenisInstance) return;
  if (paused) lenisInstance.stop();
  else lenisInstance.start();
}

/**
 * Smoothly scroll to the top, or to a target (selector / element / offset).
 * Falls back to native scrolling when Lenis is off (reduced motion).
 */
export function smoothScrollTo(
  target: number | string | HTMLElement = 0,
  opts: { offset?: number } = {}
) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset: opts.offset ?? 0, duration: LENIS_DURATION });
    return;
  }
  if (typeof window === "undefined") return;
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Global smooth-scroll + GSAP sync (§1).
 *
 * Registers ScrollTrigger once, drives Lenis from GSAP's ticker, and forwards
 * Lenis scroll events to ScrollTrigger.update so every pin/scrub stays in sync.
 *
 * Under `prefers-reduced-motion` we skip Lenis entirely and fall back to native
 * scrolling — the Act components independently render static end-states.
 *
 * Use via the <SmoothScroll/> client component (components/SmoothScroll.tsx).
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!enabled) {
      // Reduced motion: no Lenis. Still refresh triggers on resize.
      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const lenis = new Lenis({
      duration: LENIS_DURATION,
      // long, eased curve — quiet and deliberate, no bounce (§8)
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisInstance = lenis;
    // Dev-only handle for driving the page during testing (harmless in prod).
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisInstance = null;
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);
}
