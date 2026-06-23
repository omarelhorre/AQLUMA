"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll-scrubbed per-character fill for the RESPONSIVE / non-pinned contexts.
 *
 * The pinned desktop sections (heroes, the Programme reels) drive their own
 * character sweep off a pinned ScrollTrigger. On narrow screens those sections
 * fall back to a static stack with no pin — so this hook gives that stack THE
 * SAME write-in effect: as the headline/card transits the viewport, its glyphs
 * fill left→right, scrubbed by scroll. No pin, no layout shift — robust on touch.
 *
 * The caller renders the glyph spans (transparent text + a ghost→fill gradient
 * background-clip) and hands us their refs; we repaint each span's gradient as
 * scroll progresses. Disabled (`enabled=false`, e.g. reduced motion) it does
 * nothing, so the spans keep whatever solid/static style the caller gave them.
 */
export function useScrubbedFill({
  enabled,
  containerRef,
  spansRef,
  fills,
  total,
  fillGradient,
  start = "top 85%",
  end = "top 42%",
}: {
  /** Run the scrub. Pass false under reduced motion (keep the static end-state). */
  enabled: boolean;
  /** The element whose viewport transit drives the sweep (usually the headline). */
  containerRef: RefObject<HTMLElement | null>;
  /** Glyph spans in sweep order (index = character index). */
  spansRef: RefObject<(HTMLSpanElement | null)[]>;
  /** Per-glyph fill colour, same order as the spans. */
  fills: string[];
  /** Total glyph count (the sweep maps progress 0..1 → 0..total). */
  total: number;
  /** Component's own gradient recipe, so the look matches its desktop sweep. */
  fillGradient: (fill: string, f: number) => string;
  /** ScrollTrigger start/end — defaults sweep across the lower-middle of the view. */
  start?: string;
  end?: string;
}) {
  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    const apply = (g: number) => {
      const sweep = g * total;
      const els = spansRef.current;
      for (let i = 0; i < els.length; i++) {
        const s = els[i];
        if (!s) continue;
        const f = Math.min(1, Math.max(0, sweep - i));
        s.style.backgroundImage = fillGradient(fills[i], f);
      }
    };

    const proxy = { g: 0 };
    apply(0);

    const ctx = gsap.context(() => {
      gsap.to(proxy, {
        g: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start, end, scrub: true },
        onUpdate: () => apply(proxy.g),
      });
    }, el);

    return () => ctx.revert();
  }, [enabled, containerRef, spansRef, fills, total, fillGradient, start, end]);
}
