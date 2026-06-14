"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import GrowthLine, { type GrowthLineHandle } from "./GrowthLine";

/**
 * PHASE 3 — La Descente (vertical transition).
 *
 * The horizontal lock releases into a plain vertical scroll track. The growth
 * line turns 90° downward (a "rope") and the glowing dot slides down it,
 * tracking scroll speed. The ground cross-fades from the studio's terracotta
 * into the museum's matte black, bridging the two horizontal acts.
 *
 * Not pinned — a normal tall section. Reduced motion: dot rests; no scrub.
 */

// Comes in horizontally from the right (continuing the studio line), then turns
// and drops straight down (0..1000 viewBox space).
const ROPE_PATH = "M880,90 C 640,90 520,150 500,320 L500,980";

export default function TransitionRope() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const growthRef = useRef<GrowthLineHandle>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => growthRef.current?.setProgress(self.progress),
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="transition-rope"
      className="relative h-[150vh] w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #8B3A1A 0%, #3A1D12 42%, #0F0B09 78%, #080A0C 100%)",
      }}
      aria-label="AQLUMA — la descente"
    >
      <div className="pointer-events-none sticky top-0 flex h-screen items-center justify-center">
        <p className="font-didot text-[clamp(1.3rem,2.6vw,2.1rem)] leading-snug tracking-display text-cream/70">
          De l’erreur naît la méthode.
        </p>
      </div>

      <GrowthLine ref={growthRef} d={ROPE_PATH} />
    </section>
  );
}
