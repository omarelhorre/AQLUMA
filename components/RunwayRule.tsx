"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
} from "react";

/**
 * The runway's progress indicator — an architect's measuring rule.
 *
 * A notched baseline (fine ticks + longer ticks at each panel boundary) with a
 * gold fill and a travelling caret, plus a Satoshi counter. It ties to the
 * ruler object in the Briefing scene rather than reading as a download bar.
 *
 * Driven imperatively from ActWorlds' ScrollTrigger (no per-frame re-render):
 *   ref.setProgress(0..1)  — moves the caret + fill, updates the counter
 *   ref.setActive(bool)    — fades the whole rule in while the runway is pinned
 */

export type RunwayRuleHandle = {
  setProgress: (p: number) => void;
  setActive: (active: boolean) => void;
};

type Props = {
  /** Number of panels across the whole runway. */
  total: number;
  /** Current world label (e.g. "Le Briefing"). */
  label: string;
};

const RunwayRule = forwardRef<RunwayRuleHandle, Props>(function RunwayRule(
  { total, label },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const widthRef = useRef(0);
  const [active, setActiveState] = useState(false);

  // Keep the rail's pixel width current so the caret moves via transform
  // (not layout) at exactly the scrubbed progress.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const measure = () => (widthRef.current = rail.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    return () => ro.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    setProgress(p) {
      const clamped = Math.min(1, Math.max(0, p));
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${clamped})`;
      }
      if (caretRef.current) {
        caretRef.current.style.transform = `translate3d(${
          clamped * widthRef.current
        }px,0,0)`;
      }
      if (countRef.current) {
        const idx = Math.min(total, Math.floor(clamped * total) + 1);
        countRef.current.textContent = `${pad(idx)} / ${pad(total)}`;
      }
    },
    setActive(next) {
      setActiveState(next);
    },
  }));

  // Longer ticks at every panel boundary (0..total).
  const boundaries = Array.from({ length: total + 1 }, (_, i) => i / total);
  // A numeral centred under each segment.
  const segments = Array.from({ length: total }, (_, i) => i);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={[
        "pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center transition-all duration-700 ease-editorial md:bottom-10",
        active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      ].join(" ")}
    >
      <div className="w-[min(52vw,560px)]">
        {/* Top row: world label · counter */}
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-satoshi text-[11px] font-medium tracking-tight text-cream/70">
            {label}
          </span>
          <span className="font-satoshi text-[11px] tabular-nums tracking-tight text-cream/45">
            <span ref={countRef}>{`${pad(1)} / ${pad(total)}`}</span>
          </span>
        </div>

        {/* The rule */}
        <div ref={railRef} className="relative h-6">
          {/* fine notches */}
          <div
            className="absolute inset-x-0 bottom-0 h-2.5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, rgba(247,244,239,0.16) 0 1px, transparent 1px 9px)",
              maskImage: "linear-gradient(to bottom, transparent, black)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, black)",
            }}
          />

          {/* panel boundary ticks (taller) */}
          {boundaries.map((x, i) => (
            <span
              key={i}
              className="absolute bottom-0 h-4 w-px bg-cream/30"
              style={{ left: `${x * 100}%` }}
            />
          ))}

          {/* baseline hairline */}
          <span className="absolute inset-x-0 bottom-0 h-px bg-cream/20" />

          {/* gold fill up to the caret */}
          <span
            ref={fillRef}
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-gold"
            style={{ transform: "scaleX(0)" }}
          />

          {/* travelling caret */}
          <span
            ref={caretRef}
            className="absolute bottom-[-3px] left-0 -ml-[3.5px] will-change-transform"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            <span className="block h-[7px] w-[7px] rotate-45 border border-gold bg-gold/90 shadow-[0_0_8px_rgba(232,178,58,0.5)]" />
          </span>

          {/* segment numerals */}
          {segments.map((i) => (
            <span
              key={i}
              className="absolute -top-1 -translate-x-1/2 font-satoshi text-[9px] tabular-nums tracking-tight text-cream/30"
              style={{ left: `${((i + 0.5) / total) * 100}%` }}
            >
              {pad(i + 1)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default RunwayRule;
