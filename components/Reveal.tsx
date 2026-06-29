"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Reveal — fades + lifts its children in the first time they enter the viewport.
 * A quiet, editorial entrance for normally-scrolling content (no GSAP, no pin).
 * Honours reduced motion by rendering its children plainly.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger, in ms. */
  delay?: number;
  /** Initial downward offset, in px. */
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition:
          "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
