"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { fr } from "@/lib/typo";
import type { WorldStatement } from "@/lib/worldsData";

/**
 * STATEMENT PANEL — one world's statement, writing itself in character by
 * character. In the ribbon it's the LEFT column of the opening beat, paired with
 * the world's clip card beside it (see ClipCard) so the copy and its support clip
 * read together, close and natural.
 *
 * Presentational: the ribbon drives the write-on imperatively via the ref
 * (`setFill(0..1)`) so scrolling never re-renders. `stacked` = the mobile /
 * reduced-motion fallback: static filled type.
 */

export type StatementHandle = {
  /** 0 → 1 sweep of the left-to-right character fill. */
  setFill: (g: number) => void;
};

// Per-character fill as a moving gradient. `f` (0..1) is how filled THIS glyph is;
// a small soft band straddles the edge so a glyph can read as half-filled.
function fillGradient(fill: string, ghost: string, f: number): string {
  const pct = f * 100;
  return `linear-gradient(90deg, ${fill} 0%, ${fill} ${pct - 3}%, ${ghost} ${pct + 3}%, ${ghost} 100%)`;
}

type Props = {
  s: WorldStatement;
  /** Static vertical block (mobile / reduced motion): filled type, no clip. */
  stacked?: boolean;
};

const StatementPanel = forwardRef<StatementHandle, Props>(function StatementPanel(
  { s, stacked = false },
  ref,
) {
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);

  // Flatten the lines into words (kept unbreakable) of characters, each carrying
  // its fill colour + a global sweep index.
  const model = useMemo(() => {
    let idx = 0;
    const lines = s.lines.map((line) => {
      const words = fr(line)
        .split(" ")
        .map((word) => {
          const fill = s.accent.test(word) ? s.fillAccent : s.fill;
          const chars = [...word].map((ch) => ({ ch, fill, i: idx++ }));
          return { chars };
        });
      return { words };
    });
    return { lines, total: idx };
  }, [s]);

  const fills = useMemo(
    () => model.lines.flatMap((l) => l.words.flatMap((w) => w.chars.map((c) => c.fill))),
    [model],
  );

  useImperativeHandle(
    ref,
    () => ({
      setFill(g: number) {
        const sweep = g * model.total;
        const els = charsRef.current;
        for (let i = 0; i < els.length; i++) {
          const el = els[i];
          if (!el) continue;
          const f = Math.min(1, Math.max(0, sweep - i));
          el.style.backgroundImage = fillGradient(fills[i], s.ghost, f);
        }
      },
    }),
    [model.total, fills, s.ghost],
  );

  const heading = (
    <h2 className={`font-didot font-normal tracking-[-0.018em] ${s.headingClass}`}>
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
                    if (!stacked) charsRef.current[c.i] = el;
                  }}
                  style={
                    stacked
                      ? { color: c.fill }
                      : {
                          backgroundImage: fillGradient(c.fill, s.ghost, 0),
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
  );

  const marker = (
    <div className="mb-9 flex items-center gap-3.5">
      <span
        aria-hidden
        className={`font-satoshi text-[0.9rem] font-bold tabular-nums tracking-tight ${s.markerColor}`}
      >
        {s.marker}
      </span>
      <span className={`font-satoshi text-[0.95rem] font-semibold ${s.labelColor}`}>
        {s.label}
      </span>
    </div>
  );

  // ── Stacked fallback: a static, fully-filled statement, no clip ──
  if (stacked) {
    return (
      <div className="relative w-full px-6 pb-4 pt-16 text-left">
        {marker}
        {heading}
      </div>
    );
  }

  // ── Ribbon: the left-hand copy column; the ribbon centres it vertically and
  //    sets the clip card beside it. ──
  return (
    <div className="w-full text-left">
      {marker}
      {heading}
    </div>
  );
});

export default StatementPanel;
