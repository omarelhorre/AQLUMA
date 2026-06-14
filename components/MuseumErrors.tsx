"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import GrowthLine, { type GrowthLineHandle } from "./GrowthLine";

/**
 * PHASE 4 — Le Musée des Erreurs (inverted horizontal pan, RIGHT → LEFT).
 *
 * A pinned, dark gallery. Unlike the studio, this scrolls backwards: the track
 * starts showing its right end and travels to its left end, so the viewer walks
 * the gallery right-to-left. Each panel is a spotlit pedestal — a mistake shown
 * as an exhibit. The growth line continues across the top (drawn right→left to
 * match the motion); its dot tracks progress.
 *
 * Mobile / reduced motion: vertical stack, native scroll.
 */

type Exhibit = { tag: string; header: string; body: string };

// Authored in VIEW order (first seen = rightmost). Rendered row-reverse.
const EXHIBITS: Exhibit[] = [
  {
    tag: "Salle I",
    header: "Le Musée des Erreurs",
    body: "Ici, chaque erreur est exposée comme une œuvre. Car c’est en se trompant, lentement, que l’on apprend à penser.",
  },
  {
    tag: "Salle II",
    header: "L’erreur féconde",
    body: "Une réponse fausse, bien interrogée, enseigne davantage qu’une bonne réponse copiée sans la comprendre.",
  },
  {
    tag: "Salle III",
    header: "La méthode",
    body: "On ne supprime pas l’erreur : on apprend à la lire, à la corriger, à en faire un tremplin vers la suite.",
  },
];

// Drawn right → left to match the inverted pan (0..1000 viewBox space).
const MUSEUM_PATH = "M960,196 C 680,260 320,140 40,210";

export default function MuseumErrors() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<(HTMLDivElement | null)[]>([]);
  const growthRef = useRef<GrowthLineHandle>(null);

  const reduced = useReducedMotion();
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const stacked = reduced || narrow;

  useEffect(() => {
    if (stacked) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);
    const content = contentRef.current.filter(Boolean) as HTMLDivElement[];
    const span = EXHIBITS.length - 1;
    const distance = () => Math.max(0, track.offsetWidth - window.innerWidth);

    const ctx = gsap.context(() => {
      gsap.set(content, { opacity: 0, y: 26 });
      // Start showing the RIGHT end (row-reverse → first exhibit sits right).
      gsap.set(track, { x: () => -distance() });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => growthRef.current?.setProgress(self.progress),
        },
      });

      // Travel from the right end (-distance) back to the left end (0).
      tl.fromTo(track, { x: () => -distance() }, { x: 0, ease: "none", duration: span }, 0);

      content.forEach((el, i) => {
        tl.fromTo(
          el,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, ease: "power3.out", duration: 0.5 },
          Math.max(0, i - 0.5)
        );
        if (i < content.length - 1) {
          tl.to(el, { opacity: 0, y: -22, ease: "power2.in", duration: 0.4 }, i + 0.35);
        }
      });
    }, section);

    return () => ctx.revert();
  }, [stacked]);

  const Pedestal = ({ e, idx }: { e: Exhibit; idx: number }) => (
    <>
      {/* Spotlight cone from above. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(46% 60% at 50% 30%, rgba(232,178,58,0.16), rgba(232,178,58,0.04) 40%, rgba(8,10,12,0) 70%)",
        }}
      />
      {/* The exhibit: a framed plate on a plinth. */}
      <div className="relative flex h-[44vh] w-[26vw] min-w-[280px] flex-col items-center justify-end">
        <div
          className="flex h-[30vh] w-full items-center justify-center border border-cream/12 bg-[#0c0e10]"
          style={{ boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.5)" }}
        >
          <span className="font-didot text-[clamp(3rem,6vw,5rem)] leading-none text-cream/22">
            {String(idx + 1).padStart(2, "0")}
          </span>
        </div>
        {/* Plinth. */}
        <div className="mt-0 h-[7vh] w-[60%] bg-gradient-to-b from-[#15171a] to-[#080a0c]" />
      </div>
    </>
  );

  // ── Mobile / reduced motion: vertical stack ──
  if (stacked) {
    return (
      <section id="museum-section" className="relative w-full bg-void" aria-label="AQLUMA — Le Musée des Erreurs">
        {EXHIBITS.map((e, i) => (
          <div key={i} className="relative flex min-h-[80vh] flex-col items-center justify-center gap-7 overflow-hidden px-7 py-16 text-center">
            <Pedestal e={e} idx={i} />
            <div>
              <span className="font-satoshi text-[11px] uppercase tracking-[0.2em] text-gold/80">{e.tag}</span>
              <h2 className="mt-3 font-didot text-[clamp(2rem,8vw,3rem)] leading-[1.06] tracking-display text-cream">{e.header}</h2>
              <p className="mx-auto mt-4 max-w-[44ch] font-satoshi text-[15px] leading-relaxed text-cream/70">{e.body}</p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="museum-section"
      className="relative h-screen w-full overflow-hidden bg-void"
      aria-label="AQLUMA — Le Musée des Erreurs"
    >
      <div
        ref={trackRef}
        className="flex h-screen flex-row-reverse will-change-transform"
        style={{ width: `${EXHIBITS.length * 100}vw` }}
      >
        {EXHIBITS.map((e, i) => (
          <div key={i} className="relative flex h-screen w-screen flex-shrink-0 items-center justify-center overflow-hidden">
            <Pedestal e={e} idx={i} />

            {/* Wall label, set to the side of the pedestal. */}
            <div
              ref={(el) => {
                contentRef.current[i] = el;
              }}
              className="absolute bottom-[16vh] left-[8vw] z-20 w-[30rem] max-w-[80vw] text-left will-change-[transform,opacity]"
            >
              <span className="font-satoshi text-[12px] uppercase tracking-[0.22em] text-gold/80">{e.tag}</span>
              <h2 className="mt-3 font-didot text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.05] tracking-display text-cream">
                {e.header}
              </h2>
              <p className="mt-5 max-w-[36ch] font-satoshi text-[clamp(0.95rem,1.2vw,1.1rem)] leading-relaxed text-cream/72">
                {e.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <GrowthLine ref={growthRef} d={MUSEUM_PATH} />
    </section>
  );
}
