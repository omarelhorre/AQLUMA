"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Parallax — drifts its content vertically as it crosses the viewport, so layers
 * move at different speeds and the page gains depth. The element sits at its
 * natural position when centred in the viewport; it lags below on entry and
 * lifts above on exit. `speed` is the fraction of viewport height it travels
 * across its full scroll span (≈0.05 = whisper, ≈0.2 = pronounced).
 *
 * Used only on the normally-scrolling sections — the pinned/scrubbed heroes run
 * their own choreography and are left untouched. Honours reduced motion: renders
 * a plain element with no transform.
 */
type ParallaxProps = {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  "aria-hidden"?: boolean;
};

export default function Parallax({
  children,
  speed = 0.14,
  className,
  as = "div",
  "aria-hidden": ariaHidden,
}: ParallaxProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const d = () => window.innerHeight * speed;
      gsap.fromTo(
        el,
        { y: () => d() },
        {
          y: () => -d(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced, speed]);

  const Comp = as as React.ElementType;
  return (
    <Comp
      ref={ref}
      className={className}
      aria-hidden={ariaHidden}
      style={{ willChange: "transform" }}
    >
      {children}
    </Comp>
  );
}
