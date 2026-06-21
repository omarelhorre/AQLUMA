"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * PROGRAM MANIFESTO — the horizontal hand-off between the Studio gallery and the
 * programme details. It reads as ONE continuous horizontal scroll with the
 * Studio slides: this section opens on the SAME cream wall (PAPER) and gradually
 * blends to AQLUMA's void as the pan progresses — bg, words and edge fades all
 * scrub from cream→black together. Vertical scroll is pinned + scrubbed into the
 * left→right pan; each word lands as it crosses the viewport centre, alternating
 * words dropping from the TOP and rising from the BOTTOM. Big Satoshi.
 *
 * Reduced motion: the sentence renders as a static centred block, no pin.
 */

const SENTENCE =
  "En trois mois, AQLUMA emmène votre adolescent du Briefing au Studio";

// Key words rendered in gold (lower-cased to match cleanWord()).
const HIGHLIGHT = new Set(["aqluma"]);

// Words with a FIXED brand colour (independent of the cream→black blend):
// Briefing wears its terracotta wall, Studio its creamy white.
const FIXED: Record<string, string> = {
  briefing: "rgb(139,58,26)", // terracotta
  studio: "rgb(247,244,239)", // cream
};

const cleanWord = (w: string) =>
  w.replace(/[«».,:;!?'’"()-]/g, "").toLowerCase();

// Colours we scrub between (the cream→black blend). Matches the Studio wall
// (PAPER) and the AQLUMA void; text goes ink→cream, highlights brass→gold.
const PAPER = [236, 231, 221];
const VOID = [8, 10, 12];
const INK = [15, 20, 23];
const CREAM = [247, 244, 239];
const BRASS = [154, 123, 69];
const GOLD = [232, 178, 58];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const mix = (a: number[], b: number[], t: number) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
const rgb = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;
const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export default function ProgramManifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const animatedRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();
  // Below 1024px the horizontal word-pan is cramped (words clipped at the viewport
  // edges), so phones/tablets get the static centred statement instead — same
  // branch as reduced motion. Resolved in a layout effect for SSR-safety.
  const [narrow, setNarrow] = useState(false);
  useIsoLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 1023.98px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  const still = reduced || narrow;

  // fr() the whole sentence first (so thin no-break spaces stick to their
  // punctuation), then split on real spaces into animatable words.
  const words = fr(SENTENCE).split(" ").filter(Boolean);

  useEffect(() => {
    // Authoritative viewport check (see WorldGallery): never pin below 1024px or
    // under reduced motion, even if this passive effect runs with a stale closure
    // before the resolving layout effect commits.
    if (
      still ||
      !window.matchMedia("(min-width: 1024px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const section = sectionRef.current;
    const animated = animatedRef.current;
    const track = trackRef.current;
    if (!section || !animated || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    const els = wordRefs.current.filter(Boolean) as HTMLSpanElement[];

    const apply = (p: number) => {
      // Cream → black blend, completed a little past halfway so the section
      // lands fully on the void before handing off to the programme.
      const d = clamp01(p / 0.55);
      const bg = mix(PAPER, VOID, d);
      const body = mix(INK, CREAM, d);
      const accent = mix(BRASS, GOLD, d);
      section.style.backgroundColor = rgb(bg);
      if (fadeRef.current) {
        fadeRef.current.style.background = `linear-gradient(90deg, ${rgb(bg)} 0%, ${rgba(bg, 0)} 16%, ${rgba(bg, 0)} 84%, ${rgb(bg)} 100%)`;
      }

      const vw = window.innerWidth;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.right) / 2 / vw; // word centre, 0..1 of viewport
        // Visible as the word sits in the central band; hidden while it is
        // still entering from the right or has exited to the left.
        const enter = gsap.utils.clamp(0, 1, (0.92 - cx) / 0.3); // 0 right → 1 in
        const exit = gsap.utils.clamp(0, 1, (cx - 0.06) / 0.3); // 0 left → 1 in
        const v = Math.min(enter, exit);
        const dir = i % 2 === 0 ? -1 : 1; // even from top, odd from bottom
        el.style.opacity = String(v);
        el.style.transform = `translateY(${(1 - v) * dir * 80}px)`;
        el.style.filter = v < 1 ? `blur(${(1 - v) * 6}px)` : "blur(0px)";
        const fixed = el.dataset.fixed;
        el.style.color = fixed
          ? fixed
          : rgb(el.dataset.hl === "1" ? accent : body);
      }
    };

    const ctx = gsap.context(() => {
      gsap.set(els, { opacity: 0 });
      const distance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: animated,
          start: "top top",
          end: () => "+=" + (distance() + window.innerHeight),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: (self) => apply(self.progress),
          onUpdate: (self) => apply(self.progress),
        },
      });
      tl.to(track, { x: () => -distance(), ease: "none" });
      apply(0);
    }, animated);

    return () => ctx.revert();
  }, [still]);

  // Both presentations stay mounted — only `display` toggles — so the pinned pan
  // subtree is never added/removed by React. A whole-section swap here orphaned the
  // GSAP pin and blanked the page in prod (`removeChild`); this keeps it stable.
  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: still ? rgb(VOID) : rgb(PAPER) }}
      aria-label="AQLUMA, le programme en une phrase"
    >
      {/* STATIC — phones / tablets / reduced motion: calm centred statement, no pin. */}
      <div
        className="min-h-screen w-full flex-col items-center justify-center px-6 py-28 text-center sm:px-8 sm:py-32"
        style={{ display: still ? "flex" : "none" }}
      >
        <p className="max-w-[24ch] font-satoshi text-[clamp(1.6rem,6vw,3rem)] font-medium leading-tight text-cream sm:max-w-[60ch]">
          {words.map((w, i) => {
            const key = cleanWord(w);
            const fixed = FIXED[key];
            return (
              <span
                key={i}
                className={!fixed && HIGHLIGHT.has(key) ? "text-gold" : undefined}
                style={fixed ? { color: fixed } : undefined}
              >
                {w}{" "}
              </span>
            );
          })}
        </p>
      </div>

      {/* DESKTOP horizontal word-pan (≥1024px, motion allowed). */}
      <div
        ref={animatedRef}
        className="relative h-screen w-full"
        style={{ display: still ? "none" : "block" }}
      >
        <div className="absolute inset-0 flex items-center">
          <div
            ref={trackRef}
            className="flex flex-nowrap items-center whitespace-nowrap pl-[55vw] pr-[55vw] will-change-transform"
          >
            {words.map((w, i) => {
              const key = cleanWord(w);
              const fixed = FIXED[key];
              const hl = HIGHLIGHT.has(key);
              return (
                <span
                  key={i}
                  ref={(el) => {
                    wordRefs.current[i] = el;
                  }}
                  data-hl={hl ? "1" : "0"}
                  data-fixed={fixed}
                  className="mx-[0.28em] inline-block font-satoshi text-[clamp(2.4rem,7vw,6rem)] font-bold tracking-[-0.02em] will-change-transform"
                  style={{ color: fixed ?? rgb(hl ? BRASS : INK) }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>

        {/* edge fades so words melt in/out at the viewport sides — colour scrubs
            with the bg (set imperatively above). */}
        <div
          ref={fadeRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `linear-gradient(90deg, ${rgb(PAPER)} 0%, ${rgba(PAPER, 0)} 16%, ${rgba(PAPER, 0)} 84%, ${rgb(PAPER)} 100%)`,
          }}
        />
      </div>
    </section>
  );
}
