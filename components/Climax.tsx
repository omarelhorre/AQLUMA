"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * PHASE 5 — La Destination ("Aqluma est là").
 *
 * The journey resolves on the wordmark. AQLUMA lands as the highest-priority
 * element; as it settles, a terracotta brushstroke (#8B3A1A) paints itself over
 * the top of the word via an SVG stroke-dashoffset reveal — the founder's
 * signature on the promise.
 *
 * Reduced motion: everything shown in its final painted state, no animation.
 */

export default function Climax() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLParagraphElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const stroke = strokeRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const len = stroke ? stroke.getTotalLength() : 0;
      if (stroke) {
        gsap.set(stroke, { strokeDasharray: len, strokeDashoffset: len });
      }
      gsap.set(wordRef.current, { opacity: 0, y: 34 });
      gsap.set(tailRef.current, { opacity: 0, y: 18 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 62%",
          toggleActions: "play none none reverse",
        },
      });

      tl.to(wordRef.current, { opacity: 1, y: 0, ease: "power3.out", duration: 0.9 }, 0);
      if (stroke) {
        tl.to(stroke, { strokeDashoffset: 0, ease: "power2.inOut", duration: 1.1 }, 0.45);
      }
      tl.to(tailRef.current, { opacity: 1, y: 0, ease: "power3.out", duration: 0.7 }, 0.9);
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="climax-section"
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-void"
      aria-label="AQLUMA est là"
    >
      {/* Warm key light behind the word. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 60% at 50% 42%, rgba(201,97,46,0.2), rgba(8,10,12,0) 60%)" }}
      />

      <div className="relative z-10 px-6 text-center">
        <div ref={wordRef} className="relative inline-block will-change-[transform,opacity]">
          {/* The brushstroke, painted over the top boundary of AQLUMA. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -top-[0.34em] left-1/2 h-[0.5em] w-[112%] -translate-x-1/2"
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              ref={strokeRef}
              d="M24,78 C 150,34 330,44 470,52 C 640,62 820,30 978,58"
              stroke="#8B3A1A"
              strokeWidth={34}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 2px 6px rgba(139,58,26,0.5))" }}
            />
          </svg>

          <h2
            className="relative font-didot font-normal leading-[0.92] tracking-display text-cream"
            style={{ fontSize: "clamp(3.4rem,13vw,11rem)" }}
          >
            AQLUMA
          </h2>
        </div>

        <p
          ref={tailRef}
          className="mt-6 font-didot text-[clamp(1.4rem,3vw,2.6rem)] leading-tight tracking-display text-cream/70 will-change-[transform,opacity]"
        >
          est là.
        </p>
      </div>
    </section>
  );
}
