"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * CopierCue — a small, believable macOS copy interaction anchored to the word
 * « copier ». When the scroll write-in reaches the word (`active`), the word
 * reads as SELECTED, a native-looking context menu rises with « Copier · ⌘C »,
 * the row flashes as ⌘C is pressed, then the menu dismisses and a quiet « Copié »
 * confirmation floats up. It plays once per activation (remounts on `active`).
 *
 * Purely decorative: pointer-events-none, aria-hidden. Font-size + family are
 * reset to system UI so the chip reads as real macOS chrome over the big Didot.
 */

const MENU_FONT = '-apple-system, "SF Pro Text", system-ui, sans-serif';

export default function CopierCue({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const selRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLSpanElement>(null);
  const rowRef = useRef<HTMLSpanElement>(null);
  const toastRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;
    const ctx = gsap.context(() => {
      gsap.set(selRef.current, { opacity: 0 });
      gsap.set(menuRef.current, { opacity: 0, y: 6, scale: 0.96, transformOrigin: "50% 100%" });
      gsap.set(rowRef.current, { backgroundColor: "rgba(0,0,0,0)", color: "#1d1d1f" });
      gsap.set(toastRef.current, { opacity: 0, y: 4 });

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      // word selects
      tl.to(selRef.current, { opacity: 1, duration: 0.28 }, 0);
      // menu rises
      tl.to(menuRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.32 }, 0.34);
      // ⌘C press — the row flashes macOS-selection blue, then releases
      tl.to(rowRef.current, { backgroundColor: "#0a69ff", color: "#ffffff", duration: 0.11, ease: "power1.out" }, 1.04);
      tl.to(rowRef.current, { backgroundColor: "rgba(0,0,0,0)", color: "#1d1d1f", duration: 0.2 }, 1.3);
      // menu dismisses, confirmation floats up
      tl.to(menuRef.current, { opacity: 0, y: -4, duration: 0.3, ease: "power2.in" }, 1.44);
      tl.to(toastRef.current, { opacity: 1, y: -2, duration: 0.3 }, 1.52);
      tl.to(toastRef.current, { opacity: 0, y: -12, duration: 0.55, ease: "power1.in" }, 2.15);
      // selection releases
      tl.to(selRef.current, { opacity: 0, duration: 0.5 }, 2.05);
    }, rootRef);
    return () => ctx.revert();
  }, [active]);

  if (!active) return null;

  return (
    <span ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 z-30 select-none">
      {/* selection highlight behind « copier » */}
      <span
        ref={selRef}
        className="absolute -inset-x-[0.09em] -inset-y-[0.05em] rounded-[4px] bg-[#4a90ff]/30"
      />

      {/* macOS context menu, floating above the word */}
      <span
        ref={menuRef}
        style={{ fontFamily: MENU_FONT }}
        className="absolute bottom-[calc(100%+0.5em)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[8px] border border-black/10 bg-[#f7f7f8]/95 p-1 text-[13px] font-normal leading-none shadow-[0_12px_34px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        <span
          ref={rowRef}
          className="flex items-center justify-between gap-7 rounded-[5px] px-2.5 py-[7px]"
        >
          <span>Copier</span>
          <span className="text-[#9a9a9f]">⌘C</span>
        </span>
      </span>

      {/* quiet confirmation */}
      <span
        ref={toastRef}
        style={{ fontFamily: MENU_FONT }}
        className="absolute bottom-[calc(100%+0.55em)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[11px] font-medium leading-none text-white/90 backdrop-blur-sm"
      >
        Copié
      </span>
    </span>
  );
}
