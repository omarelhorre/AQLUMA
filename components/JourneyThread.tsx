"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * JOURNEY THREAD — one continuous element that threads two adjacent sections.
 *
 * A single fixed-position mark that, frame by frame, reads two anchors:
 *   · #journey-voie       — its home above « Il faut une troisième voie »
 *   · #journey-rail(+fill)— La Méthode's progress rail and its growing fill
 *
 * At « voie » it is a compass (finding direction). As you scroll past, it morphs
 * into the gold orb and flies down onto the rail, then rides the rail's leading
 * edge through the six gestes — never fading, never duplicated. The two sections
 * own no orb of their own; this is the only one.
 *
 * Desktop + motion only (the sections render static fallbacks otherwise), so the
 * pinned rail it rides actually exists.
 */
export default function JourneyThread() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLSpanElement>(null);
  const orbRef = useRef<HTMLSpanElement>(null);
  const needleRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () =>
      setEnabled(mq.matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled || reduced) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const clamp = gsap.utils.clamp;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const smooth = (a: number, b: number, x: number) => {
      const t = clamp(0, 1, (x - a) / (b - a));
      return t * t * (3 - 2 * t);
    };

    const rect = (id: string) => document.getElementById(id)?.getBoundingClientRect();

    const tick = () => {
      const vh = window.innerHeight;
      const voie = rect("journey-voie");
      const rail = rect("journey-rail");
      if (!voie || !rail) {
        wrap.style.opacity = "0";
        return;
      }
      const fill = rect("journey-rail-fill");

      const railH = rail.height;
      const railPinTop = (vh - railH) / 2; // rail's screen-top while pinned (centred)
      // h: 0 while the rail is still below, 1 once it has settled into its pin.
      const h = clamp(0, 1, (vh - rail.top) / Math.max(1, vh - railPinTop));

      const voieCx = voie.left + voie.width / 2;
      const voieCy = voie.top + voie.height / 2;
      const fillH = fill ? fill.height : 0;
      const railLeadY = rail.top + fillH; // leading edge of the fill

      // Path threads the EMPTY LEFT MARGIN, never the centred words:
      //  1) slide left out of the text column to a corridor (still high, above
      //     the line) · 2) descend the corridor through negative space ·
      //  3) only once the words have scrolled away, slide onto the rail.
      const corridorX = window.innerWidth * 0.13;
      const xToCorridor = smooth(0.02, 0.24, h);
      const xToRail = smooth(0.62, 0.96, h);
      const x = lerp(lerp(voieCx, corridorX, xToCorridor), rail.left, xToRail);
      const y = lerp(voieCy, railLeadY, smooth(0.18, 1, h));

      // Morph is driven by TRAVEL only (h), so it stays a compass while the line
      // is being read (h≈0) and morphs into the orb as it actually moves.
      const m = smooth(0.05, 0.45, h);
      // Travel bump (0→1→0, peaks mid-flight): the orb stretches along its motion
      // (comet-like) to hold the eye during transit.
      const travel = 4 * h * (1 - h);

      // Visibility: fade in as voie arrives, hold, fade out as the rail leaves up.
      const entrance = clamp(0, 1, (vh * 0.99 - voieCy) / (vh * 0.34));
      const exit = smooth(-vh * 0.1, vh * 0.14, y);
      const o = entrance * exit;

      wrap.style.opacity = String(clamp(0, 1, o));
      wrap.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (detailRef.current) detailRef.current.style.opacity = String(1 - smooth(0, 0.4, m));
      if (orbRef.current) {
        orbRef.current.style.opacity = String(smooth(0.1, 0.45, m));
        const sy = 1 + travel * 0.85;
        const sx = 1 - travel * 0.28;
        orbRef.current.style.transform = `translate(-50%, -50%) scale(${sx}, ${sy})`;
      }
      if (needleRef.current) {
        const settle = clamp(0, 1, entrance);
        const angle = (1 - settle) * -150 + Math.sin(settle * Math.PI * 2) * 5 * (1 - settle);
        needleRef.current.setAttribute("transform", `rotate(${angle} 50 50)`);
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [enabled, reduced]);

  if (reduced) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[34] h-[78px] w-[78px]"
      style={{ opacity: 0, willChange: "transform, opacity" }}
    >
      {/* compass detail */}
      <span ref={detailRef} className="absolute inset-0 block">
        <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
          <circle cx="50" cy="50" r="46" stroke="rgba(247,244,239,0.26)" strokeWidth="1.1" />
          <circle cx="50" cy="50" r="36.5" stroke="rgba(247,244,239,0.1)" strokeWidth="1" />
          <line x1="50" y1="4.5" x2="50" y2="12.5" stroke="#E8B23A" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="95.5" y1="50" x2="88" y2="50" stroke="rgba(247,244,239,0.32)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="50" y1="95.5" x2="50" y2="88" stroke="rgba(247,244,239,0.32)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4.5" y1="50" x2="12" y2="50" stroke="rgba(247,244,239,0.32)" strokeWidth="1.2" strokeLinecap="round" />
          <g ref={needleRef}>
            <path d="M50 13 L56 50 L44 50 Z" fill="#E8B23A" />
            <path d="M50 87 L56 50 L44 50 Z" fill="rgba(247,244,239,0.32)" />
          </g>
          <circle cx="50" cy="50" r="3.6" fill="#0F1417" stroke="#E8B23A" strokeWidth="1.4" />
        </svg>
      </span>

      {/* gold journey-orb (the rail marker) */}
      <span
        ref={orbRef}
        className="absolute left-1/2 top-1/2 block h-[16px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          opacity: 0,
          background: "radial-gradient(circle, #FFF4D6 0%, #F0C25A 45%, rgba(232,178,58,0) 76%)",
          boxShadow: "0 0 18px 5px rgba(232,178,58,0.5)",
        }}
      />
    </div>
  );
}
