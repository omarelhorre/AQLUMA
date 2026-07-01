"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

/**
 * Minimal runway progress — a single hairline that fills in gold, with a quiet
 * label + counter. Driven imperatively from ActWorlds' ScrollTrigger:
 *   ref.setProgress(0..1)  — grows the fill, updates the counter
 *   ref.setActive(bool)    — fades the whole rule in while the runway is pinned
 */

export type RunwayRuleHandle = {
  setProgress: (p: number) => void;
  setActive: (active: boolean) => void;
};

type Props = {
  total: number;
  label: string;
  placement?: "top" | "bottom";
  /** "light" flips the hairline + labels to ink, for pale walls (Studio). */
  tone?: "dark" | "light";
};

const RunwayRule = forwardRef<RunwayRuleHandle, Props>(function RunwayRule(
  { total, label, placement = "bottom", tone = "dark" },
  ref
) {
  const isTop = placement === "top";
  const light = tone === "light";
  const fillRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);

  useImperativeHandle(ref, () => ({
    setProgress(p) {
      const clamped = Math.min(1, Math.max(0, p));
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${clamped})`;
      if (countRef.current) {
        const idx = Math.min(total, Math.floor(clamped * total) + 1);
        countRef.current.textContent = `${pad(idx)} / ${pad(total)}`;
      }
    },
    setActive(next) {
      setActive(next);
    },
  }));

  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none absolute inset-x-0 z-30 flex justify-center transition-all duration-700 ease-editorial",
        isTop ? "top-8 md:top-10" : "bottom-9 md:bottom-12",
        active ? "translate-y-0 opacity-100" : isTop ? "-translate-y-2 opacity-0" : "translate-y-2 opacity-0",
      ].join(" ")}
    >
      <div className="w-[min(44vw,440px)]">
        <div className="mb-3 flex items-baseline justify-between">
          <span
            className={[
              "font-satoshi text-[11px] font-medium tracking-tight",
              light ? "text-ink/70" : "text-cream/70",
            ].join(" ")}
          >
            {label}
          </span>
          <span
            ref={countRef}
            className={[
              "font-satoshi text-[11px] tabular-nums tracking-tight",
              light ? "text-ink/45" : "text-cream/45",
            ].join(" ")}
          >
            {`${pad(1)} / ${pad(total)}`}
          </span>
        </div>

        <div className={["relative h-px w-full", light ? "bg-ink/15" : "bg-cream/15"].join(" ")}>
          <span
            ref={fillRef}
            className="absolute inset-0 origin-left bg-gold"
            style={{
              transform: "scaleX(0)",
              boxShadow: "0 0 6px rgba(232,178,58,0.32)",
            }}
          />
        </div>
      </div>
    </div>
  );
});

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default RunwayRule;
