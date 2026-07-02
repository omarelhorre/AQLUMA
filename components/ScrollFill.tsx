"use client";

import {
  createElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

/**
 * ScrollFill — the site's signature per-character "write-in" packaged for reuse.
 *
 * A paragraph starts as a faint GHOST and fills to its resting colour left→right,
 * character by character, scrubbed by scroll as the element transits the upper
 * viewport. Same recipe (fill→ghost gradient, ±2% feather, `top 85%`→`top 42%`
 * scrub) as the footer manifesto, so every paragraph reads with one identical
 * motion. Reduced motion → the glyphs render solid at their resting colour.
 *
 * Pass `highlight` (a word regex) + `renderHighlight` to anchor an overlay onto a
 * single word; the overlay is told when the fill front has reached that word.
 */

type Props = {
  /** Tag to render (defaults to <p>). */
  as?: "p" | "h2" | "h3" | "span";
  /** Raw French copy — run through fr() internally, like the footer line. */
  text: string;
  className?: string;
  /** Resting colour the glyphs fill to — usually the paragraph's own colour. */
  fill: string;
  /** Faint colour the glyphs start from before scroll writes them in. */
  ghost?: string;
  start?: string;
  end?: string;
  /** Word to anchor an overlay onto (e.g. /copier/i). First match only. */
  highlight?: RegExp;
  /** Overlay rendered on the highlighted word; `active` = fill front has arrived. */
  renderHighlight?: (active: boolean) => ReactNode;
  /** Classes for the highlighted word itself (e.g. "font-bold" to weight it). */
  highlightClassName?: string;
};

const DEFAULT_GHOST = "rgba(247,244,239,0.13)";

function gradient(fill: string, ghost: string, f: number): string {
  if (f >= 1) return `linear-gradient(90deg, ${fill}, ${fill})`;
  if (f <= 0) return `linear-gradient(90deg, ${ghost}, ${ghost})`;
  const a = Math.max(0, f * 100 - 2);
  const b = Math.min(100, f * 100 + 2);
  return `linear-gradient(90deg, ${fill} 0%, ${fill} ${a}%, ${ghost} ${b}%, ${ghost} 100%)`;
}

export default function ScrollFill({
  as = "p",
  text,
  className = "",
  fill,
  ghost = DEFAULT_GHOST,
  start = "top 85%",
  end = "top 42%",
  highlight,
  renderHighlight,
  highlightClassName = "",
}: Props) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const [anchorActive, setAnchorActive] = useState(false);

  const model = useMemo(() => {
    const content = fr(text);
    // Split on regular spaces only — non-breaking groups (fr's thin spaces) stay
    // together, exactly like the footer write-in.
    const tokens = content.split(" ");
    let gi = 0;
    let anchorEnd = -1;
    const built = tokens.map((tok) => {
      let mStart = -1;
      let mEnd = -1;
      if (highlight) {
        const m = tok.match(highlight);
        if (m && m.index != null) {
          mStart = m.index;
          mEnd = m.index + m[0].length;
        }
      }
      const chars = [...tok].map((ch, li) => {
        const idx = gi++;
        const inAnchor = mStart >= 0 && li >= mStart && li < mEnd;
        if (inAnchor && li === mEnd - 1) anchorEnd = idx;
        return { ch, idx, inAnchor };
      });
      return { chars };
    });
    return { tokens: built, total: gi, anchorEnd };
  }, [text, highlight]);

  useEffect(() => {
    if (reduced) return;
    const el = containerRef.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const { total, anchorEnd } = model;
    let lastActive = false;
    const paint = (g: number) => {
      const sweep = g * total;
      const arr = spans.current;
      for (let i = 0; i < arr.length; i++) {
        const s = arr[i];
        if (!s) continue;
        const f = Math.min(1, Math.max(0, sweep - i));
        s.style.backgroundImage = gradient(fill, ghost, f);
      }
      if (anchorEnd >= 0) {
        const active = sweep >= anchorEnd + 0.5;
        if (active !== lastActive) {
          lastActive = active;
          setAnchorActive(active);
        }
      }
    };

    const proxy = { g: 0 };
    paint(0);
    const ctx = gsap.context(() => {
      gsap.to(proxy, {
        g: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start, end, scrub: true },
        onUpdate: () => paint(proxy.g),
      });
    }, el);
    return () => ctx.revert();
  }, [reduced, model, fill, ghost, start, end]);

  const glyphStyle = (): CSSProperties =>
    reduced
      ? { color: fill }
      : {
          backgroundImage: gradient(fill, ghost, 0),
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        };

  const children = model.tokens.map((tok, ti) => {
    const nodes: ReactNode[] = [];
    let anchorGroup: ReactNode[] | null = null;
    const flush = () => {
      if (anchorGroup) {
        nodes.push(
          <span key={`a${ti}`} ref={anchorRef} className={`relative inline ${highlightClassName}`}>
            {anchorGroup}
            {renderHighlight?.(anchorActive)}
          </span>,
        );
        anchorGroup = null;
      }
    };
    for (const c of tok.chars) {
      const glyph = (
        <span
          key={c.idx}
          ref={(el) => {
            spans.current[c.idx] = el;
          }}
          style={glyphStyle()}
        >
          {c.ch}
        </span>
      );
      if (c.inAnchor) {
        (anchorGroup ??= []).push(glyph);
      } else {
        flush();
        nodes.push(glyph);
      }
    }
    flush();
    return (
      <span key={ti} aria-hidden className="relative inline-block whitespace-nowrap">
        {nodes}
      </span>
    );
  });

  // Interleave word wrappers with real spaces, like the footer write-in.
  const spaced: ReactNode[] = [];
  children.forEach((node, i) => {
    spaced.push(node);
    if (i < children.length - 1) spaced.push(" ");
  });

  return createElement(
    as,
    { ref: containerRef, className, "aria-label": fr(text) },
    spaced,
  );
}
