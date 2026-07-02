"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * ANNOTATE — the site's editorial "annotated book" ink.
 *
 * A tiny, restrained set of hand-drawn marks that a reader would pencil over the
 * ONE word that matters: a gold pen ring, an elegant / dotted underline, a
 * highlighter swipe, or a soft gold-gradient word. Each mark is measured to its
 * word and *drawn in* — a stroke writes itself on (dash-offset), a highlighter /
 * dotted rule wipes on left→right — so it reads as ink laid down by a hand, not a
 * shape that pops. Purely decorative: aria-hidden, pointer-events-none, never
 * affects layout (absolute overlay with its own breathing room).
 *
 * Two ways to fire:
 *   · <Annotate type="marker">rare</Annotate>  — self-triggers when the word
 *      settles into view (IntersectionObserver). Use in plain running text.
 *   · <AnnotationMark type="circle" active={…} /> — controlled, rendered as a
 *      ScrollFill `renderHighlight` overlay so the ink is drawn exactly as the
 *      write-in front reaches the word (same signal CopierCue rides).
 *
 * <GradientWord> is the text-level treatment (a warm gold gradient clipped to the
 * glyphs) for the single closing word that should glow.
 *
 * Reduced motion → every mark renders in its finished, drawn state, no motion.
 */

type MarkType = "circle" | "underline" | "dotted" | "marker";

const GOLD = "#E8B23A";
// px of breathing room around the word so a ring / underline has somewhere to
// live without touching the glyphs — generous, so the marks read as confident.
const PAD = 18;

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * A quick pen ellipse around the word — sampled with a little per-quadrant radius
 * wobble and ~28° of overshoot past the start, so the ends cross into a natural
 * tail instead of meeting on a perfect seam.
 */
function ellipsePath(w: number, h: number): string {
  const cx = PAD + w / 2 - w * 0.015;
  const cy = PAD + h / 2 + h * 0.02;
  const rx = w / 2 + PAD * 0.72;
  const ry = h / 2 + PAD * 0.64;
  const start = -2.0;
  const sweep = Math.PI * 2 + 0.5;
  const N = 46;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = start + sweep * t;
    const wob = 1 + 0.03 * Math.sin(3 * a + 0.7) + 0.018 * Math.sin(5 * a + 2.1);
    const x = cx + rx * wob * Math.cos(a);
    const y = cy + ry * wob * Math.sin(a);
    d += `${i === 0 ? "M" : "L"}${r1(x)} ${r1(y)}${i < N ? " " : ""}`;
  }
  return d;
}

/** A near-straight rule just under the baseline — a faint mid-bow + slight tilt so
 *  it reads as a drawn line rather than a border. Shared by underline + dotted. */
function underlinePath(w: number, h: number): string {
  const y0 = PAD + h + PAD * 0.2;
  const N = 26;
  const dip = h * 0.05;
  const tilt = -h * 0.06;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = PAD - 1 + (w + 3) * t;
    const y = y0 + Math.sin(Math.PI * t) * dip + tilt * t + 0.5 * Math.sin(9 * t + 0.4);
    d += `${i === 0 ? "M" : "L"}${r1(x)} ${r1(y)}${i < N ? " " : ""}`;
  }
  return d;
}

export function AnnotationMark({
  type,
  active,
  color = GOLD,
}: {
  type: MarkType;
  /** Controlled trigger. Omit to self-trigger when the word settles into view. */
  active?: boolean;
  color?: string;
}) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLSpanElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const wipeRef = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [selfActive, setSelfActive] = useState(false);
  const played = useRef(false);

  const controlled = active !== undefined;
  const on = reduced || (controlled ? !!active : selfActive);

  const isStroke = type === "circle" || type === "underline";
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

  // Self-trigger: draw the ink once the word is comfortably in view.
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

  // Draw. Strokes write on via dash-offset; dotted / marker wipe on via width.
  useEffect(() => {
    if (!box) return;
    if (reduced) {
      if (isStroke && strokeRef.current) strokeRef.current.style.strokeDashoffset = "0";
      if (!isStroke && wipeRef.current) wipeRef.current.style.width = `${full}px`;
      return;
    }
    if (played.current) {
      // keep the drawn state correct across resizes
      if (!isStroke && wipeRef.current) wipeRef.current.style.width = `${full}px`;
      return;
    }
    if (!on) {
      if (isStroke && strokeRef.current) gsap.set(strokeRef.current, { strokeDashoffset: 1 });
      if (!isStroke && wipeRef.current) gsap.set(wipeRef.current, { width: 0 });
      return;
    }
    played.current = true;
    if (isStroke && strokeRef.current) {
      gsap.fromTo(
        strokeRef.current,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: type === "circle" ? 0.82 : 0.56, ease: "power1.inOut", delay: 0.06 },
      );
    }
    if (!isStroke && wipeRef.current) {
      gsap.fromTo(
        wipeRef.current,
        { width: 0 },
        { width: full, duration: 0.58, ease: "power2.out", delay: 0.06 },
      );
    }
  }, [on, box, reduced, isStroke, type, full]);

  const markerStyle: CSSProperties = box
    ? {
        left: PAD - 3,
        top: PAD + box.h * 0.08,
        width: box.w + 6,
        height: box.h * 0.82,
        borderRadius: "45% 55% 48% 52% / 60% 55% 60% 55%",
        background: "linear-gradient(180deg, rgba(232,178,58,0.34), rgba(232,178,58,0.20))",
        transform: "rotate(-0.7deg)",
      }
    : {};

  return (
    <span ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 select-none">
      {box && isStroke && (
        <svg
          width={full}
          height={box.h + PAD * 2}
          viewBox={`0 0 ${full} ${box.h + PAD * 2}`}
          className="absolute overflow-visible"
          style={{ left: -PAD, top: -PAD }}
        >
          <path
            ref={strokeRef}
            d={type === "circle" ? ellipsePath(box.w, box.h) : underlinePath(box.w, box.h)}
            fill="none"
            stroke={color}
            strokeWidth={type === "circle" ? 2.5 : 2.3}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: reduced ? 0 : 1, opacity: 0.9 }}
          />
        </svg>
      )}

      {box && !isStroke && (
        <span
          ref={wipeRef}
          className="absolute overflow-hidden"
          style={{ left: -PAD, top: -PAD, height: box.h + PAD * 2, width: reduced ? full : 0 }}
        >
          {type === "dotted" ? (
            <svg
              width={full}
              height={box.h + PAD * 2}
              viewBox={`0 0 ${full} ${box.h + PAD * 2}`}
              className="absolute overflow-visible"
              style={{ left: 0, top: 0 }}
            >
              <path
                d={underlinePath(box.w, box.h)}
                fill="none"
                stroke={color}
                strokeWidth={2.7}
                strokeLinecap="round"
                style={{ strokeDasharray: "0.1 8", opacity: 0.9 }}
              />
            </svg>
          ) : (
            <span aria-hidden className="absolute" style={markerStyle} />
          )}
        </span>
      )}
    </span>
  );
}

/** Wrapper form — annotate a word inside plain running text; self-triggers. */
export default function Annotate({
  type,
  children,
  className = "",
}: {
  type: MarkType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-[1]">{children}</span>
      <AnnotationMark type={type} />
    </span>
  );
}

/** Soft, warm gold gradient clipped to the glyphs — for the one word that glows. */
export function GradientWord({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: "linear-gradient(102deg, #F4D27A 0%, #E8B23A 52%, #CE9A34 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </span>
  );
}
