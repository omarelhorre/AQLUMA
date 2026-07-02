"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * CopierCue — « copier » shown as a *selected* word, iOS-style.
 *
 * The word carries a quiet native text-selection tint with the two teardrop grab
 * handles delimiting it — the selection treatment itself is the emphasis,
 * integrated into the typography rather than sitting on top of it. No callout
 * bubble: on desktop the macOS contextual menu lives separately, in the
 * headline's right negative space (see MacContextMenu).
 *
 * Fades in once when the write-in front reaches the word (`active`) — or
 * immediately under reduced motion — then stays put. Purely decorative:
 * aria-hidden, pointer-events-none.
 */

export default function CopierCue({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (active || reduced) setShown(true);
  }, [active, reduced]);

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 select-none"
      style={{ opacity: shown ? 1 : 0, transition: "opacity 0.6s ease" }}
    >
      {/* quiet native selection tint behind « copier » */}
      <span className="absolute -inset-x-[0.09em] -inset-y-[0.05em] rounded-[4px] bg-[#4a90ff]/[0.22]" />

      {/* teardrop grab handles delimiting the selection */}
      <span className="absolute -left-[0.12em] -top-[0.06em] bottom-[-0.06em] w-[10px] -translate-x-1/2">
        <span className="absolute bottom-0 left-1/2 top-0 w-[2px] -translate-x-1/2 rounded-full bg-[#0a69ff]" />
        <span className="absolute left-1/2 top-0 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a69ff] shadow-[0_1px_3px_rgba(0,0,0,0.35)]" />
      </span>
      <span className="absolute -right-[0.12em] -top-[0.06em] bottom-[-0.06em] w-[10px] translate-x-1/2">
        <span className="absolute bottom-0 left-1/2 top-0 w-[2px] -translate-x-1/2 rounded-full bg-[#0a69ff]" />
        <span className="absolute bottom-0 left-1/2 h-[10px] w-[10px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#0a69ff] shadow-[0_1px_3px_rgba(0,0,0,0.35)]" />
      </span>
    </span>
  );
}
