"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * CopierCue — « copier » shown as a *selected* word (not a copy animation).
 *
 * The word carries a permanent native text-selection highlight. On mobile the iOS
 * selection callout bubble + teardrop grab handles sit on it; on desktop the macOS
 * contextual menu lives separately, in the headline's right negative space (see
 * MacContextMenu), so the typography stays clean — here we keep only the selection.
 *
 * Fades in once when the write-in front reaches the word (`active`) — or
 * immediately under reduced motion — then stays put. Purely decorative:
 * aria-hidden, pointer-events-none, system font so the chrome reads as real.
 */

const MENU_FONT = '-apple-system, "SF Pro Text", system-ui, sans-serif';

// iOS selection callout (mobile).
const IOS_ITEMS = ["Copier", "Coller", "Rechercher"];

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
      {/* permanent native selection highlight behind « copier » */}
      <span className="absolute -inset-x-[0.09em] -inset-y-[0.05em] rounded-[4px] bg-[#4a90ff]/30" />

      {/* ── Mobile · iOS selection: teardrop handles + callout bubble ── */}
      <span className="md:hidden">
        {/* grab handles on the selection ends */}
        <span className="absolute -left-[0.12em] -top-[0.06em] bottom-[-0.06em] w-[10px] -translate-x-1/2">
          <span className="absolute bottom-0 left-1/2 top-0 w-[2px] -translate-x-1/2 rounded-full bg-[#0a69ff]" />
          <span className="absolute left-1/2 top-0 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a69ff] shadow-[0_1px_3px_rgba(0,0,0,0.35)]" />
        </span>
        <span className="absolute -right-[0.12em] -top-[0.06em] bottom-[-0.06em] w-[10px] translate-x-1/2">
          <span className="absolute bottom-0 left-1/2 top-0 w-[2px] -translate-x-1/2 rounded-full bg-[#0a69ff]" />
          <span className="absolute bottom-0 left-1/2 h-[10px] w-[10px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#0a69ff] shadow-[0_1px_3px_rgba(0,0,0,0.35)]" />
        </span>

        {/* callout bubble */}
        <span
          style={{ fontFamily: MENU_FONT, animation: reduced ? undefined : "aq-os-float 11s ease-in-out infinite" }}
          className="absolute bottom-[calc(100%+0.7em)] left-1/2 flex -translate-x-1/2 items-stretch overflow-hidden rounded-[11px] bg-[#2b2b2e]/95 text-[13px] font-normal leading-none text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md"
        >
          {IOS_ITEMS.map((label, i) => (
            <span key={label} className={`px-3.5 py-[9px] ${i > 0 ? "border-l border-white/15" : ""}`}>
              {label}
            </span>
          ))}
          {/* down-pointing tail toward the selection */}
          <span className="absolute left-1/2 top-full h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#2b2b2e]/95" />
        </span>
      </span>
    </span>
  );
}
