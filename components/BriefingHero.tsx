"use client";

import { useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * BRIEFING — Hero (entry to Act II).
 *
 * Black canvas, warm key light. One pinned scroll drives:
 *  · Left  — a ragged-left statement whose words write themselves in (ghost →
 *            cream, payoff in gold). The column rises + fades on enter.
 *  · Right — a full-height support video that bleeds off the right edge of the
 *            viewport, its left side melting organically into the dark canvas.
 *            Its frame is SCRUBBED by scroll (forward on the way down, reverses
 *            on the way up), in lock-step with the word fill.
 * On exit, text and video fade out together.
 *
 * Narrow screens: the video is hidden, the statement goes full-width.
 * Reduced motion: static filled headline, video at poster, no scrub.
 */

const LINE_A = "Votre adolescent croise déjà l’IA.";
const LINE_B = "Mais est-ce qu’il le fait correctement ?";
const ACCENT = /correctement/i;

const FILL = "#F7F4EF"; // cream
const FILL_ACCENT = "#E8B23A"; // gold/orange
const GHOST = "rgba(247,244,239,0.12)"; // faint impression on black

// Edge-bleed blend: the LEFT side melts into the canvas (where the text sits),
// while top/bottom are softly feathered. The right side stays solid — it bleeds
// off the viewport, so there's no box anywhere on screen.
const FEATHER: React.CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.08) 13%, #000 44%), linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.08) 13%, #000 44%), linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

export default function BriefingHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  const lines = useMemo(() => [LINE_A.split(" "), LINE_B.split(" ")], []);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const spans = wordsRef.current.filter(Boolean) as HTMLSpanElement[];
    const video = videoRef.current;
    if (video) video.pause();

    const ctx = gsap.context(() => {
      gsap.set(spans, { color: GHOST });
      gsap.set(columnRef.current, { opacity: 0, y: 30 });
      gsap.set(mediaRef.current, { opacity: 0, scale: 1.05 });

      // Eased scrub of the support clip toward scroll progress.
      const seek = video
        ? gsap.quickTo(video, "currentTime", { duration: 0.3, ease: "power3.out" })
        : null;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate(self) {
            if (seek && video && video.duration) seek(self.progress * video.duration);
          },
        },
      });

      // Enter: statement rises + fades in; video mists out of the background.
      tl.to(columnRef.current, { opacity: 1, y: 0, ease: "power3.out", duration: 0.12 }, 0);
      tl.to(
        mediaRef.current,
        { opacity: 1, scale: 1, ease: "power4.out", duration: 0.6 },
        0.02
      );

      // Words fill in sequence as the video settles + scrubs.
      const wStart = 0.14;
      const wStep = 0.05;
      spans.forEach((span, i) => {
        const accent = span.dataset.accent === "1";
        tl.to(
          span,
          { color: accent ? FILL_ACCENT : FILL, ease: "none", duration: 0.14 },
          wStart + i * wStep
        );
      });

      // Exit: text + video fade out together.
      tl.to(
        [columnRef.current, mediaRef.current],
        { opacity: 0, y: -22, ease: "power2.in", duration: 0.16 },
        0.86
      );
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
      {/* Full-height support video — bleeds off the right edge, scrubs on
          scroll, left side melts into the canvas. Hidden on narrow screens. */}
      <div
        ref={mediaRef}
        className="absolute right-0 top-0 hidden h-full w-[min(66vw,1040px)] will-change-[transform,opacity] md:block"
        style={{ ...FEATHER, opacity: reduced ? 1 : 0 }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/video/support.mp4"
          poster="/video/support-poster.jpg"
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
        />
      </div>

      {/* Warm key light on black — Rembrandt from the upper-left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(70% 80% at 20% 26%, rgba(201,97,46,0.26), rgba(8,10,12,0) 56%)",
        }}
      />

      {/* Left legibility wash so the copy reads cleanly over the melted edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,10,12,0.96) 0%, rgba(8,10,12,0.78) 26%, rgba(8,10,12,0.22) 48%, rgba(8,10,12,0) 62%)",
        }}
      />

      {/* Left: text block — ragged left. Full width on mobile. */}
      <div
        ref={columnRef}
        className="relative z-10 w-full px-[min(6vw,5rem)] text-left md:w-1/2"
        style={{ opacity: reduced ? 1 : 0 }}
      >
        {/* Section marker — a refined warm chip with a gold hairline and soft
            glow so it carries weight against the dark canvas. */}
        <span
          className="mb-9 inline-flex items-center gap-3 rounded-full border border-gold/30 px-4 py-2 backdrop-blur-md"
          style={{
            background:
              "linear-gradient(120deg, rgba(201,97,46,0.18), rgba(232,178,58,0.06) 60%, rgba(8,10,12,0) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(247,244,239,0.10), 0 12px 40px -16px rgba(232,178,58,0.40)",
          }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-gold"
            style={{ boxShadow: "0 0 10px 1.5px rgba(232,178,58,0.65)" }}
          />
          <span className="font-satoshi text-[12px] font-semibold uppercase tracking-[0.24em] text-cream">
            Le Briefing
          </span>
        </span>

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
    </section>
  );
}
