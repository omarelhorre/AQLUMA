"use client";

import { useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { lazyPreloadVideo } from "@/lib/lazyVideo";

/**
 * BRIEFING — Hero (entry to Act II).
 *
 * Black canvas, warm key light. One pinned scroll drives:
 *  · Left  — a ragged-left statement that writes itself in as a continuous
 *            left-to-right sweep, character by character (a glyph can be caught
 *            half-filled), ghost → cream, payoff in gold. A soft blend band
 *            rides the leading edge so the fill melts in rather than snapping.
 *  · Right — a full-height support video that bleeds off the right edge of the
 *            viewport, its left side melting into the dark canvas. Scrubbed.
 * After the fill there's a readable hold; on exit the statement dissolves
 * gradually (staggered fade + blur) so the screen is never abruptly empty.
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

// Per-character fill as a moving gradient. `f` (0..1) is how filled THIS glyph
// is; a small soft band straddles the edge so the sweep blends instead of
// hard-cutting — that's how a character reads as "half filled".
function fillGradient(fill: string, f: number): string {
  const pct = f * 100;
  const a = pct - 3;
  const b = pct + 3;
  return `linear-gradient(90deg, ${fill} 0%, ${fill} ${a}%, ${GHOST} ${b}%, ${GHOST} 100%)`;
}

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
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Flatten the two lines into words (kept unbreakable) of characters, each
  // carrying its fill colour + global sweep index.
  const model = useMemo(() => {
    let idx = 0;
    const lines = [LINE_A, LINE_B].map((line) => {
      const words = line.split(" ").map((word) => {
        const fill = ACCENT.test(word) ? FILL_ACCENT : FILL;
        const chars = [...word].map((ch) => ({ ch, fill, i: idx++ }));
        return { chars };
      });
      return { words };
    });
    return { lines, total: idx };
  }, []);

  const fills = useMemo(
    () => model.lines.flatMap((l) => l.words.flatMap((w) => w.chars.map((c) => c.fill))),
    [model]
  );

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const video = videoRef.current;
    if (video) video.pause();
    const stopLazy = lazyPreloadVideo(section, video);

    const total = model.total;
    const applyFill = (g: number) => {
      const sweep = g * total;
      const els = charsRef.current;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        const f = Math.min(1, Math.max(0, sweep - i));
        el.style.backgroundImage = fillGradient(fills[i], f);
      }
    };

    const ctx = gsap.context(() => {
      gsap.set(columnRef.current, { opacity: 0, y: 28 });
      gsap.set(mediaRef.current, { opacity: 0, scale: 1.05 });
      gsap.set(washRef.current, { yPercent: 100 });
      applyFill(0);

      // Eased scrub of the support clip toward scroll progress.
      const seek = video
        ? gsap.quickTo(video, "currentTime", { duration: 0.3, ease: "power3.out" })
        : null;

      const fillProxy = { g: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=260%",
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
      tl.to(mediaRef.current, { opacity: 1, scale: 1, ease: "power4.out", duration: 0.55 }, 0.02);

      // The sweep: one continuous left-to-right fill across every character.
      tl.to(
        fillProxy,
        { g: 1, ease: "none", duration: 0.52, onUpdate: () => applyFill(fillProxy.g) },
        0.12
      );

      // …a long readable hold, then a PARALLAX CURTAIN exit. A solid terracotta
      // panel (Act II's opening colour) slides up from below to cover the frame,
      // while the briefing's layers drift upward behind it at different speeds —
      // the video slow, the copy faster — so the section recedes with real depth
      // as the next one rises over it. No opacity blending; the curtain hands
      // straight off to the worlds runway with no black gap.
      tl.to(mediaRef.current, { yPercent: -7, ease: "power1.out", duration: 0.22 }, 0.8);
      tl.to(columnRef.current, { yPercent: -16, ease: "power1.out", duration: 0.22 }, 0.8);
      tl.to(washRef.current, { yPercent: 0, ease: "power3.inOut", duration: 0.2 }, 0.8);
    }, section);

    return () => {
      stopLazy();
      ctx.revert();
    };
  }, [reduced, model, fills]);

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
          src="/video/briefing-hook.mp4"
          poster="/video/briefing-hook-poster.jpg"
          muted
          playsInline
          preload="metadata"
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

      {/* Exit curtain — a solid terracotta panel (Act II's opening colour) that
          sits just below the viewport during the read, then slides up over the
          whole frame on exit. It covers the content as it rises, so the worlds
          runway is handed a full terracotta frame — a parallax wipe, no blend. */}
      <div
        ref={washRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[40] will-change-transform"
        style={{ backgroundColor: "#8B3A1A", transform: "translateY(100%)" }}
      />

      {/* Left: text block — ragged left. Full width on mobile. */}
      <div
        ref={columnRef}
        className="relative z-10 w-full px-[min(6vw,5rem)] text-left will-change-[transform,opacity,filter] md:w-1/2"
        style={{ opacity: reduced ? 1 : 0 }}
      >
        {/* Section marker — an editorial wayfinding cue: a gold diamond (echoes
            the Act II measuring-rule caret), the label, then a fading rule. */}
        <div className="mb-9 flex items-center gap-3.5">
          <span
            aria-hidden
            className="h-[7px] w-[7px] rotate-45 bg-gold"
            style={{ boxShadow: "0 0 9px 1px rgba(232,178,58,0.55)" }}
          />
          <span className="font-satoshi text-[12.5px] font-semibold uppercase tracking-[0.2em] text-cream">
            Le Briefing
          </span>
          <span
            aria-hidden
            className="h-px w-16 flex-shrink-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(232,178,58,0.7), rgba(232,178,58,0))",
            }}
          />
        </div>

        <h2 className="font-didot text-[clamp(1.7rem,4.4vw,3.75rem)] font-normal leading-[1.18] tracking-display">
          {model.lines.map((line, li) => (
            <span
              key={li}
              className="mb-2 flex flex-wrap items-baseline justify-start gap-x-[0.26em] gap-y-1"
            >
              {line.words.map((word, wi) => (
                <span key={wi} className="whitespace-nowrap">
                  {word.chars.map((c) => (
                    <span
                      key={c.i}
                      ref={(el) => {
                        charsRef.current[c.i] = el;
                      }}
                      style={
                        reduced
                          ? { color: c.fill }
                          : {
                              backgroundImage: fillGradient(c.fill, 0),
                              WebkitBackgroundClip: "text",
                              backgroundClip: "text",
                              color: "transparent",
                              WebkitTextFillColor: "transparent",
                            }
                      }
                    >
                      {c.ch}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
