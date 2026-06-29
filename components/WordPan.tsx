"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * WordPan — a single phrase delivered as a pinned horizontal scroll: vertical
 * scroll is pinned + scrubbed into a left→right pan, and each word lands as it
 * crosses the viewport centre, alternating between dropping from the top and
 * rising from the bottom (the same mechanism as ProgramManifesto, generalised
 * and on a transparent background so it inherits the section's void).
 *
 * Crash-safe mount (see the GSAP-pin × React-removeChild lesson): both the
 * static and the animated subtrees stay mounted and only `display` toggles, and
 * the static branch is the SSR/mobile/reduced-motion default. The pin only ever
 * runs ≥1024px with motion allowed.
 */
export default function WordPan({
  sentence,
  highlight = [],
  wordClassName = "font-satoshi font-bold tracking-[-0.02em]",
  sizeClassName = "text-[clamp(2.2rem,6.5vw,5.5rem)]",
  ariaLabel,
}: {
  sentence: string;
  /** Words (lower-cased, punctuation-stripped) rendered in gold. */
  highlight?: string[];
  wordClassName?: string;
  sizeClassName?: string;
  ariaLabel?: string;
}) {
  const animatedRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();

  const [narrow, setNarrow] = useState(false);
  useIsoLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 1023.98px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  const still = reduced || narrow;

  const clean = (w: string) =>
    w.replace(/[«».,:;!?'’"()-]/g, "").toLowerCase();
  const hlSet = new Set(highlight.map((h) => h.toLowerCase()));
  const words = fr(sentence).split(" ").filter(Boolean);

  useEffect(() => {
    if (
      still ||
      !window.matchMedia("(min-width: 1024px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const animated = animatedRef.current;
    const track = trackRef.current;
    if (!animated || !track) return;

    gsap.registerPlugin(ScrollTrigger);
    const els = wordRefs.current.filter(Boolean) as HTMLSpanElement[];

    const apply = () => {
      const vw = window.innerWidth;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.right) / 2 / vw;
        const enter = gsap.utils.clamp(0, 1, (0.92 - cx) / 0.3);
        const exit = gsap.utils.clamp(0, 1, (cx - 0.06) / 0.3);
        const v = Math.min(enter, exit);
        const dir = i % 2 === 0 ? -1 : 1;
        el.style.opacity = String(v);
        el.style.transform = `translateY(${(1 - v) * dir * 80}px)`;
        el.style.filter = v < 1 ? `blur(${(1 - v) * 6}px)` : "blur(0px)";
      }
    };

    const ctx = gsap.context(() => {
      gsap.set(els, { opacity: 0 });
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: animated,
          start: "top top",
          end: () => "+=" + (distance() + window.innerHeight),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: apply,
          onUpdate: apply,
        },
      });
      tl.to(track, { x: () => -distance(), ease: "none" });
      apply();
    }, animated);

    return () => ctx.revert();
  }, [still]);

  return (
    <div
      className="relative w-full overflow-hidden"
      aria-label={ariaLabel}
    >
      {/* STATIC — SSR / phones-tablets / reduced motion: centred statement. */}
      <div
        className="w-full flex-col items-center justify-center px-6 py-24 text-center"
        style={{ display: still ? "flex" : "none" }}
      >
        <p className={`max-w-[22ch] leading-tight text-cream ${wordClassName} ${sizeClassName}`}>
          {words.map((w, i) => {
            const hl = hlSet.has(clean(w));
            return (
              <span key={i} className={hl ? "text-gold" : undefined}>
                {w}{" "}
              </span>
            );
          })}
        </p>
      </div>

      {/* DESKTOP horizontal pan (≥1024px, motion allowed). */}
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
              const hl = hlSet.has(clean(w));
              return (
                <span
                  key={i}
                  ref={(el) => {
                    wordRefs.current[i] = el;
                  }}
                  className={`mx-[0.28em] inline-block will-change-transform ${wordClassName} ${sizeClassName} ${hl ? "text-gold" : "text-cream"}`}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
