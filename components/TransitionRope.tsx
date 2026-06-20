"use client";

import { useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { lazyPreloadVideo } from "@/lib/lazyVideo";
import { fr } from "@/lib/typo";

/**
 * PHASE 3 — Le seuil du Musée (entry to the Musée des Erreurs).
 *
 * A museum-themed echo of the Briefing hero. Cool spotlight on dark teal-navy
 * gallery walls (the art direction of the museum clip), a scrubbed support
 * video bleeding off the right edge, and one question that writes itself in as
 * a continuous left-to-right per-character sweep — ghost → cream, payoff in
 * terracotta (the brushstroke artwork's colour). After the fill there's a hold,
 * then a matte-black curtain rises to hand straight off to the panorama.
 *
 * Narrow screens: video hidden, question full-width.
 * Reduced motion: static filled question, video at poster, no scrub.
 */

// One flowing question, broken into three ragged-left lines for rhythm.
const LINES = [
  "Votre IA se trompe déjà,",
  "mais saurez-vous détecter ses erreurs",
  "avant qu’elles ne deviennent vos vérités ?",
];
const ACCENT = /vérités/i; // the payoff lands in terracotta

const FILL = "#F7F4EF"; // cream
const FILL_ACCENT = "#C8662F"; // terracotta — the brushstroke in the vitrine
const GHOST = "rgba(247,244,239,0.10)"; // faint impression on the dark wall

// Museum wall — deep teal-charcoal sampled off the clip; the panorama that
// follows is matte black, so the exit curtain hands off to #080A0C.
const WALL = "#0C1519";

// The clip runs 8s; only scrub through the first 6s.
const MAX_T = 6;

// Per-character fill as a moving gradient. `f` (0..1) is how filled THIS glyph
// is; a small soft band straddles the edge so a glyph can read as half-filled.
function fillGradient(fill: string, f: number): string {
  const pct = f * 100;
  const a = pct - 3;
  const b = pct + 3;
  return `linear-gradient(90deg, ${fill} 0%, ${fill} ${a}%, ${GHOST} ${b}%, ${GHOST} 100%)`;
}

// Edge-bleed blend: the LEFT side melts into the wall (where the text sits),
// top/bottom softly feathered; the right side stays solid and bleeds off-frame.
const FEATHER: React.CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.08) 13%, #000 44%), linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.08) 13%, #000 44%), linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

export default function TransitionRope() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Flatten the lines into words (kept unbreakable) of characters, each carrying
  // its fill colour + a global sweep index.
  const model = useMemo(() => {
    let idx = 0;
    const lines = LINES.map((line) => {
      const words = fr(line).split(" ").map((word) => {
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
            if (seek && video && video.duration) {
              // Cap the scrub at 6s of the 8s clip.
              const span = Math.min(video.duration, MAX_T);
              seek(self.progress * span);
            }
          },
        },
      });

      // Enter: question rises + fades in; video mists out of the wall.
      tl.to(columnRef.current, { opacity: 1, y: 0, ease: "power3.out", duration: 0.12 }, 0);
      tl.to(mediaRef.current, { opacity: 1, scale: 1, ease: "power4.out", duration: 0.55 }, 0.02);

      // The sweep: one continuous left-to-right fill across every character.
      tl.to(
        fillProxy,
        { g: 1, ease: "none", duration: 0.52, onUpdate: () => applyFill(fillProxy.g) },
        0.12
      );

      // Hold, then a PARALLAX CURTAIN exit: a solid matte-black panel (the
      // panorama's colour) slides up to cover the frame while the layers drift
      // upward behind it — video slow, copy faster — so the seuil recedes with
      // depth and hands a full black frame to the Musée. No opacity blending.
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
      id="transition-rope"
      className="relative flex h-screen w-full items-center overflow-hidden"
      style={{ backgroundColor: WALL }}
      aria-label="AQLUMA, le seuil du Musée"
    >
      {/* Full-height support clip — bleeds off the right edge, scrubs on scroll,
          left side melts into the wall. Hidden on narrow screens. */}
      <div
        ref={mediaRef}
        className="absolute right-0 top-0 hidden h-full w-[min(66vw,1040px)] will-change-[transform,opacity] md:block"
        style={{ ...FEATHER, opacity: reduced ? 1 : 0 }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/video/museum.mp4"
          poster="/video/museum-poster.jpg"
          muted
          playsInline
          preload="metadata"
          tabIndex={-1}
        />
      </div>

      {/* Cool spotlight from above — the museum key light, not the studio's warm
          glow — falling toward the vitrine on the right. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(60% 72% at 60% 14%, rgba(150,182,198,0.20), rgba(12,21,25,0) 58%)",
        }}
      />

      {/* Left legibility wash so the question reads cleanly over the melted edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(90deg, rgba(12,21,25,0.96) 0%, rgba(12,21,25,0.78) 26%, rgba(12,21,25,0.22) 48%, rgba(12,21,25,0) 62%)",
        }}
      />

      {/* Exit curtain — matte-black panel (the panorama's colour) waiting just
          below the viewport, rising over the frame on exit. */}
      <div
        ref={washRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[40] will-change-transform"
        style={{ backgroundColor: "#080A0C", transform: "translateY(100%)" }}
      />

      {/* Left: the question — ragged left. Full width on mobile. */}
      <div
        ref={columnRef}
        className="relative z-10 w-full px-[min(6vw,5rem)] text-left will-change-[transform,opacity,filter] md:w-[58%]"
        style={{ opacity: reduced ? 1 : 0 }}
      >
        {/* Section marker — gold diamond (the museum's brass wayfinding) + label. */}
        <div className="mb-9 flex items-center gap-3.5">
          <span
            aria-hidden
            className="font-didot text-[1.15rem] font-normal leading-none text-gold"
          >
            II
          </span>
          <span className="font-satoshi text-[0.95rem] font-semibold text-cream">
            Le Musée
          </span>
          <span
            aria-hidden
            className="h-px w-16 flex-shrink-0"
            style={{
              background: "linear-gradient(90deg, rgba(232,178,58,0.7), rgba(232,178,58,0))",
            }}
          />
        </div>

        <h2 className="font-didot text-[clamp(1.6rem,3.9vw,3.35rem)] font-normal leading-[1.2] tracking-[-0.018em]">
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
