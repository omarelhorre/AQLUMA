"use client";

import { useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * BRIEFING — Hero (entry to Act II).
 *
 * Black canvas, warm orange key light. A pinned statement that the door's bloom
 * resolves into. The headline writes itself in: each word starts as a faint
 * impression and fills as you scroll (cream, with the payoff clause in gold).
 * When the fill completes the section releases into the horizontal worlds.
 *
 * Reduced motion: static, fully-filled headline, normal scroll.
 */

// Two flowing lines; the payoff clause fills gold. EDIT freely.
const LINE_A = "Votre adolescent croise déjà l’IA.";
const LINE_B = "Mais est-ce qu’il le fait correctement ?";
// words (by index, within the combined flow) that fill gold for emphasis
const ACCENT = /correctement/i;

const FILL = "#F7F4EF"; // cream
const FILL_ACCENT = "#E8B23A"; // gold/orange
const GHOST = "rgba(247,244,239,0.12)"; // faint impression on black

export default function BriefingHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();

  const lines = useMemo(
    () => [LINE_A.split(" "), LINE_B.split(" ")],
    []
  );

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const spans = wordsRef.current.filter(Boolean) as HTMLSpanElement[];

    const ctx = gsap.context(() => {
      gsap.set(spans, { color: GHOST });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      spans.forEach((span, i) => {
        const accent = span.dataset.accent === "1";
        tl.to(
          span,
          { color: accent ? FILL_ACCENT : FILL, ease: "none", duration: 1 },
          i * 0.6
        );
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  let idx = 0;

  return (
    <section
      ref={sectionRef}
      id="briefing"
      className="relative flex h-screen w-full items-center overflow-hidden bg-void"
      aria-label="AQLUMA — Le Briefing"
    >
      {/* Warm orange key light on black — Rembrandt from the upper-left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 80% at 22% 26%, rgba(201,97,46,0.30), rgba(8,10,12,0) 58%), radial-gradient(60% 70% at 82% 88%, rgba(139,58,26,0.22), rgba(8,10,12,0) 60%)",
        }}
      />

      <div className="relative z-10 flex w-full items-center px-[min(6vw,5rem)]">
        {/* Left: text block — ragged left */}
        <div className="w-1/2 text-left">
          <p className="kicker mb-7 text-[11px] text-clay/90">Le Briefing</p>

          <h2 className="font-didot text-[clamp(1.7rem,4.4vw,3.75rem)] font-normal leading-[1.18] tracking-display">
            {lines.map((line, li) => (
              <span
                key={li}
                className="mb-2 flex flex-wrap items-baseline justify-start gap-x-[0.28em] gap-y-1"
              >
                {line.map((word, wi) => {
                  const accent = ACCENT.test(word);
                  const myIdx = idx++;
                  const initialColor = reduced
                    ? accent
                      ? FILL_ACCENT
                      : FILL
                    : GHOST;
                  return (
                    <span
                      key={`${li}-${wi}`}
                      ref={(el) => {
                        wordsRef.current[myIdx] = el;
                      }}
                      data-accent={accent ? "1" : "0"}
                      style={{ color: initialColor }}
                    >
                      {word}
                    </span>
                  );
                })}
              </span>
            ))}
          </h2>
        </div>

        {/* Right: video slot — feathery briefing video goes here */}
        <div className="relative flex w-1/2 items-center justify-center">
          {/* placeholder — replace with <video> or <Image> + feather mask */}
          <div
            aria-hidden
            className="h-[60vh] w-full rounded-sm"
            style={{
              background: "rgba(201,97,46,0.06)",
              maskImage:
                "radial-gradient(ellipse 80% 90% at 50% 50%, black 40%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 90% at 50% 50%, black 40%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
