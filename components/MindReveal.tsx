"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { lazyPreloadVideo } from "@/lib/lazyVideo";
import { fr } from "@/lib/typo";

/**
 * PHASE 4.5 — L'esprit.
 *
 * The Three.js particle brain is retired; its full implementation is preserved
 * in `MindReveal.brain.tsx.bak` (restore by copying it back over this file).
 *
 * Same shape as the Briefing / Musée / Studio intros: a pinned section with the
 * comparison clip on the right (the messy/passive half slides to the methodical/
 * creative half) and the statement held on the LEFT.
 *
 * AQLUMA + the lead line are STATIC — only the paragraph beneath them changes.
 * That paragraph writes itself in per-character (the "fill" effect from the
 * world heroes), then MORPHS: a soft gold light-pass travels left→right,
 * un-writing the lost line behind it as the thinker line writes itself in ahead
 * of it — one continuous rewrite, no cross-fade. After the read, the CTA fades in.
 *
 * Reduced motion: static thinker statement, clip at poster, no pin/scrub.
 */

const LEAD = "transforme votre adolescent.";
const LOST =
  "D'un adolescent qui demande une réponse, la recopie et l'oublie le lendemain — un esprit perdu, sans méthode, dont la voix se dissout dans celle de la machine.";
const THINKER =
  "à un esprit qui pense avec l'IA : il interroge, vérifie, reformule et garde sa voix. Même outil, deux trajectoires — la différence, c'est la méthode.";

const VOID = "#080A0C";
const FILL = "#F7F4EF"; // cream — the written ink
const GHOST = "rgba(247,244,239,0.07)"; // faint impression before/after writing

// Scroll-progress beats.
const REVEAL_IN = 0.06;
const REVEAL_OUT = 0.34; // LOST fully written
const UNWRITE_IN = 0.46; // LOST starts erasing — from the end, in reverse
const UNWRITE_OUT = 0.6; // LOST fully erased
const WRITE_IN = 0.6; // THINKER starts writing itself in
const WRITE_OUT = 0.78; // THINKER fully written
const END_AT = 0.9; // copy out, CTA in

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Per-character fill as a moving gradient. `f` (0..1) is how written THIS glyph
// is; a soft band straddles the edge so a glyph can read as half-written.
function fillGradient(f: number): string {
  const pct = f * 100;
  const a = pct - 4;
  const b = pct + 4;
  return `linear-gradient(90deg, ${FILL} 0%, ${FILL} ${a}%, ${GHOST} ${b}%, ${GHOST} 100%)`;
}

// Flatten a line into words (kept unbreakable) of characters with a global index.
function buildModel(text: string) {
  let i = 0;
  const words = fr(text)
    .split(" ")
    .filter(Boolean)
    .map((w) => [...w].map((ch) => ({ ch, i: i++ })));
  return { words, total: i };
}

// Edge blend: feathered on ALL four sides so the spotlit half floats in the
// dark. The strong LEFT fade carries the copy; the RIGHT fade hides the split
// seam + the gap beside the centred half; top/bottom melt the page edges.
const FEATHER: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 13%, #000 42%, #000 87%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 11%, #000 89%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 13%, #000 42%, #000 87%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 11%, #000 89%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

export default function MindReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const lostBoxRef = useRef<HTMLParagraphElement>(null);
  const thinkerBoxRef = useRef<HTMLParagraphElement>(null);
  const scanRef = useRef<HTMLSpanElement>(null);
  const lostRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const thinkerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0); // 0 = lost adolescent, 1 = thinker
  const [ended, setEnded] = useState(false); // after the read: copy out, CTA in

  const lostModel = useMemo(() => buildModel(LOST), []);
  const thinkerModel = useMemo(() => buildModel(THINKER), []);

  useEffect(() => {
    if (reduced) {
      setPhase(1);
      return;
    }
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const video = videoRef.current;
    if (video) video.pause();
    const stopLazy = lazyPreloadVideo(section, video);

    const lost = lostRefs.current;
    const think = thinkerRefs.current;
    const NL = lostModel.total;
    const NT = thinkerModel.total;

    // Handwriting transition, one line at a time (never two texts at once):
    //  · LOST writes itself in (REVEAL), holds.
    //  · LOST un-writes — the ink recedes from the END back to the start (reverse).
    //  · one empty beat, then THINKER writes itself in.
    const applyText = (p: number) => {
      const rv = clamp01((p - REVEAL_IN) / (REVEAL_OUT - REVEAL_IN)); // writes in
      const uw = clamp01((p - UNWRITE_IN) / (UNWRITE_OUT - UNWRITE_IN)); // erases (reverse)
      const wt = clamp01((p - WRITE_IN) / (WRITE_OUT - WRITE_IN)); // writes in

      for (let i = 0; i < lost.length; i++) {
        const el = lost[i];
        if (!el) continue;
        const written = clamp01(rv * NL - i); // ink lands in reading order
        const kept = clamp01((1 - uw) * NL - i); // ink recedes from the end first
        el.style.backgroundImage = fillGradient(Math.min(written, kept));
      }
      for (let j = 0; j < think.length; j++) {
        const el = think[j];
        if (!el) continue;
        el.style.backgroundImage = fillGradient(clamp01(wt * NT - j));
      }

      if (lostBoxRef.current)
        lostBoxRef.current.style.opacity = String(1 - sstep(0.58, 0.62, p));
      if (thinkerBoxRef.current)
        thinkerBoxRef.current.style.opacity = String(sstep(0.6, 0.64, p));
    };

    const ctx = gsap.context(() => {
      applyText(0);
      const seek = video
        ? gsap.quickTo(video, "currentTime", { duration: 0.3, ease: "power3.out" })
        : null;

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=460%",
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const p = self.progress;
          if (seek && video && video.duration) seek(p * video.duration);
          applyText(p);
          const ph = p < 0.5 ? 0 : 1;
          setPhase((prev) => (prev === ph ? prev : ph));
          const e = p > END_AT;
          setEnded((prev) => (prev === e ? prev : e));
        },
      });
    }, section);

    return () => {
      stopLazy();
      ctx.revert();
    };
  }, [reduced, lostModel, thinkerModel]);

  // Per-character fill spans for a model; refs let the scroll update each glyph.
  const renderFill = (
    model: ReturnType<typeof buildModel>,
    refs: React.MutableRefObject<(HTMLSpanElement | null)[]>,
  ) =>
    model.words.map((word, wi) => (
      // Breakable space BETWEEN word spans (outside the nowrap) so the paragraph
      // wraps inside the column instead of running on as one line.
      <Fragment key={wi}>
        <span className="whitespace-nowrap">
          {word.map((c) => (
            <span
              key={c.i}
              ref={(el) => {
                refs.current[c.i] = el;
              }}
              style={{
                backgroundImage: fillGradient(0),
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            >
              {c.ch}
            </span>
          ))}
        </span>
        {wi < model.words.length - 1 ? " " : ""}
      </Fragment>
    ));

  const paraClass =
    "font-satoshi text-[clamp(1rem,1.55vw,1.35rem)] leading-relaxed";

  return (
    <section
      ref={sectionRef}
      id="mind-reveal"
      className="relative flex h-screen w-full items-center overflow-hidden"
      style={{ backgroundColor: VOID }}
      aria-label="AQLUMA — l'esprit"
    >
      {/* Comparison clip — a left|right split (left half = methodical/creative,
          right half = messy/passive). Fits the panel height; we slide between
          halves so one whole kid shows at a time, graded grimmer for the lost
          beat, warming for the thinker. */}
      <div
        className="absolute right-0 top-0 hidden h-full w-[min(88vh,52vw)] overflow-hidden md:block"
        style={{
          ...FEATHER,
          filter:
            phase === 0 && !reduced
              ? "saturate(0.78) brightness(0.92) contrast(1.02)"
              : "saturate(1.04) brightness(1.02)",
          transition: "filter 1.4s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <video
          ref={videoRef}
          className="absolute left-1/2 top-0 block h-full w-auto max-w-none will-change-transform"
          src="/video/esprit-compare.mp4"
          poster="/video/esprit-compare-poster.jpg"
          muted
          playsInline
          preload="metadata"
          tabIndex={-1}
          style={{
            transform:
              reduced || phase === 1 ? "translateX(-25%)" : "translateX(-75%)",
            transition: "transform 1.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>

      {/* Warm Rembrandt key from the upper-left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(70% 80% at 20% 26%, rgba(201,97,46,0.24), rgba(8,10,12,0) 56%)",
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

      {/* Left column — AQLUMA + lead line are STATIC; only the paragraph rewrites.
          The whole column fades once, at the very end, to hand off to the CTA. */}
      <div
        ref={columnRef}
        className="absolute inset-y-0 left-0 z-10 flex w-full flex-col justify-center px-[min(7vw,5.5rem)] md:w-[52%]"
        style={{
          opacity: ended ? 0 : 1,
          transform: ended ? "translateY(-10px)" : "translateY(0)",
          transition:
            "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <h2 className="font-didot text-[clamp(3rem,7vw,6.75rem)] font-normal leading-[0.92] tracking-[-0.02em] text-cream">
          AQLUMA
        </h2>
        <p className="mt-3 font-satoshi text-[clamp(1.05rem,1.7vw,1.5rem)] font-medium leading-snug text-cream/65">
          {fr(LEAD)}
        </p>

        {/* The changing paragraph: two layers in one box. */}
        <div className="relative mt-9 max-w-[40ch]">
          {reduced ? (
            <p className={`${paraClass} text-cream/90`}>{fr(THINKER)}</p>
          ) : (
            <>
              <p ref={lostBoxRef} className={paraClass}>
                {renderFill(lostModel, lostRefs)}
              </p>
              <p
                ref={thinkerBoxRef}
                className={`absolute inset-0 ${paraClass}`}
                style={{ opacity: 0 }}
              >
                {renderFill(thinkerModel, thinkerRefs)}
              </p>
              {/* Soft gold light-pass that rides the rewrite edge during the morph. */}
              <span
                ref={scanRef}
                aria-hidden
                className="pointer-events-none absolute inset-y-[-0.4em] w-[46px]"
                style={{
                  left: "0%",
                  opacity: 0,
                  marginLeft: "-23px",
                  background:
                    "linear-gradient(90deg, rgba(232,178,58,0) 0%, rgba(232,178,58,0.22) 50%, rgba(232,178,58,0) 100%)",
                  filter: "blur(3px)",
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Closing CTA — fades in centred after the read. */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        style={{
          opacity: ended ? 1 : 0,
          filter: ended ? "blur(0px)" : "blur(16px)",
          transform: ended ? "translateY(0)" : "translateY(14px)",
          transition:
            "opacity 1.2s cubic-bezier(0.16,1,0.3,1), filter 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: ended ? "auto" : "none",
        }}
      >
        <p className="max-w-[26ch] font-satoshi text-[clamp(1.5rem,3.2vw,2.6rem)] font-medium leading-snug text-cream">
          {fr("Qu’attendez-vous ? Rejoignez notre programme.")}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#briefing"
            className="rounded-[10px] bg-gold px-8 py-4 font-satoshi text-[13px] font-semibold uppercase tracking-[0.16em] text-void transition-colors duration-300 hover:bg-[#f3c45e]"
          >
            Voir le programme
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("aqluma:contact"))}
            className="rounded-[10px] bg-cream px-8 py-4 font-satoshi text-[13px] font-semibold uppercase tracking-[0.16em] text-void transition-colors duration-300 hover:bg-white"
          >
            Contactez-nous
          </button>
        </div>
      </div>
    </section>
  );
}
