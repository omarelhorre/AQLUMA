"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * COMPASS MARK — a fine line-drawn compass beside « explorer » in the Worlds
 * heading. On scroll into view the needle wakes: one slow searching swing past
 * east, a correction back, then it settles on its heading — once, physically,
 * like the paper note's swing (no loop, no bounce). Editorial ink: hairline rim
 * + cardinal ticks in cream, the needle's north in gold, its south left hollow.
 * Purely decorative: aria-hidden, pointer-events-none. Reduced motion → at
 * rest on its heading.
 */

const REST = 42; // final needle heading (deg clockwise from north — toward the worlds)

export default function CompassMark({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const rootRef = useRef<SVGSVGElement>(null);
  const needleRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const needle = needleRef.current;
    if (!root || !needle) return;

    gsap.set(needle, { svgOrigin: "24 24", rotation: -150 });

    let tl: gsap.core.Timeline | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        tl = gsap
          .timeline({ delay: 0.15 })
          .to(needle, { rotation: 74, duration: 0.9, ease: "power2.inOut" })
          .to(needle, { rotation: REST - 13, duration: 0.7, ease: "power2.inOut" })
          .to(needle, { rotation: REST, duration: 0.5, ease: "power2.out" });
      },
      { threshold: 0.7 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      tl?.kill();
    };
  }, [reduced]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 48 48"
      aria-hidden
      fill="none"
      className={`pointer-events-none select-none ${className}`}
    >
      {/* rim */}
      <circle cx="24" cy="24" r="20" className="stroke-cream/25" strokeWidth="1.5" />
      {/* cardinal ticks */}
      <path
        d="M24 6v4 M24 38v4 M6 24h4 M38 24h4"
        className="stroke-cream/40"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* needle — gold north, hollow south */}
      <g ref={needleRef}>
        <path d="M24 8 L26.8 24 L21.2 24 Z" className="fill-gold" />
        <path
          d="M24 40 L26.8 24 L21.2 24 Z"
          className="stroke-cream/35"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </g>
      {/* pivot */}
      <circle cx="24" cy="24" r="1.8" className="fill-gold" />
    </svg>
  );
}
