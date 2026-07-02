"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * ANNOTATE — the site's single editorial emphasis: a fine gold rule that draws
 * itself in under the one word that matters.
 *
 * One treatment, used everywhere, so emphasis reads as a designed decision rather
 * than a collection of effects. The rule is a straight 1.5px stroke, set a little
 * below the baseline, that writes on left→right (dash-offset) when the word
 * settles into view — quiet enough to belong to the typography. Purely
 * decorative: aria-hidden, pointer-events-none, never affects layout.
 *
 * Two ways to fire:
 *   · <Annotate>rare</Annotate> — self-triggers when the word settles into view
 *      (IntersectionObserver). Use in plain running text.
 *   · <AnnotationMark active={…} /> — controlled, rendered as a ScrollFill
 *      `renderHighlight` overlay so the rule is drawn exactly as the write-in
 *      front reaches the word (same signal CopierCue rides).
 *
 * Reduced motion → the rule renders in its finished state, no motion.
 */

const GOLD = "#E8B23A";
// px of breathing room around the word so the rule has somewhere to live without
// touching the glyphs.
const PAD = 18;

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function AnnotationMark({
  active,
  color = GOLD,
}: {
  /** Controlled trigger. Omit to self-trigger when the word settles into view. */
  active?: boolean;
  color?: string;
}) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLSpanElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [selfActive, setSelfActive] = useState(false);
  const played = useRef(false);

  const controlled = active !== undefined;
  const on = reduced || (controlled ? !!active : selfActive);

  const full = box ? box.w + PAD * 2 : 0;

  // Measure the word (this overlay sits inset-0 over it); re-measure on resize and
  // once the display font's real metrics land.
  useIso(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setBox((prev) =>
          prev && Math.abs(prev.w - rect.width) < 0.5 && Math.abs(prev.h - rect.height) < 0.5
            ? prev
            : { w: rect.width, h: rect.height },
        );
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Self-trigger: draw the rule once the word is comfortably in view.
  useEffect(() => {
    if (controlled || reduced) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSelfActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.9, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [controlled, reduced]);

  // Draw — the rule writes on via dash-offset, once.
  useEffect(() => {
    if (!box || !strokeRef.current) return;
    if (reduced) {
      strokeRef.current.style.strokeDashoffset = "0";
      return;
    }
    if (played.current) return;
    if (!on) {
      gsap.set(strokeRef.current, { strokeDashoffset: 1 });
      return;
    }
    played.current = true;
    gsap.fromTo(
      strokeRef.current,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.5, ease: "power1.inOut", delay: 0.06 },
    );
  }, [on, box, reduced]);

  const ruleY = box ? PAD + box.h + PAD * 0.14 : 0;

  return (
    <span ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 select-none">
      {box && (
        <svg
          width={full}
          height={box.h + PAD * 2}
          viewBox={`0 0 ${full} ${box.h + PAD * 2}`}
          className="absolute overflow-visible"
          style={{ left: -PAD, top: -PAD }}
        >
          <path
            ref={strokeRef}
            d={`M${PAD} ${ruleY} L${PAD + box.w} ${ruleY}`}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: reduced ? 0 : 1, opacity: 0.65 }}
          />
        </svg>
      )}
    </span>
  );
}

/** Wrapper form — annotate a word inside plain running text; self-triggers. */
export default function Annotate({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-[1]">{children}</span>
      <AnnotationMark />
    </span>
  );
}
