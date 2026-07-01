"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * JOURNEY THREAD — one continuous mark that threads two adjacent sections.
 *
 * A single fixed-position element that, frame by frame, reads two anchors:
 *   · #journey-voie       — its home beside « Il faut une troisième voie »
 *   · #journey-rail(+fill) — La Méthode's progress rail and its growing fill
 *
 * It arrives at « voie » as a compass (the needle searches, then settles North),
 * holds there a beat, then morphs into the gold orb and slides directly onto the
 * rail, riding the fill's leading edge through the gestes. One mark, never
 * duplicated, hard-hidden outside the voie→rail window.
 *
 * Desktop + motion only (the sections render static fallbacks otherwise), so the
 * pinned rail it rides actually exists.
 */
export default function JourneyThread() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLSpanElement>(null);
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

    // Displayed (damped) state — eased toward the per-frame targets so rect jitter
    // and fast scroll never snap. Seeded NaN so the first valid frame jumps to
    // target instead of easing up from 0.
    const view = { x: NaN, y: NaN, o: 0, m: 0, settle: 0 };
    const K = 0.22; // damping (higher = tighter tracking, less ghosting)
    const damp = (cur: number, target: number) =>
      Number.isNaN(cur) ? target : lerp(cur, target, K);

    const tick = () => {
      const vh = window.innerHeight;
      const voie = rect("journey-voie");
      const rail = rect("journey-rail");
      if (!voie || !rail) {
        view.o = damp(view.o, 0);
        wrap.style.opacity = String(view.o);
        return;
      }

      // Hard visibility gate — the thread only exists in the voie→rail window.
      // Once the rail has left the top (later sections) or voie hasn't arrived
      // yet, force-hide so it never leaks elsewhere.
      if (rail.bottom < -40 || voie.top > vh * 1.15) {
        view.o = 0;
        wrap.style.opacity = "0";
        return;
      }

      const fill = rect("journey-rail-fill");
      const railH = rail.height;
      const railPinTop = (vh - railH) / 2; // rail's screen-top while pinned
      // h: 0 while the rail is still below, 1 once it has settled into its pin.
      const h = clamp(0, 1, (vh - rail.top) / Math.max(1, vh - railPinTop));

      const voieCx = voie.left + voie.width / 2;
      const voieCy = voie.top + voie.height / 2;
      const fillH = fill ? fill.height : 0;
      const railLeadY = rail.top + fillH; // leading edge of the fill

      // Hold at the voie line through the look/find beat, then slide DIRECTLY onto
      // the rail — no far-left detour (that read as a detached dot floating up top).
      const slide = smooth(0.22, 0.92, h);
      const tx = lerp(voieCx, rail.left, slide);
      const ty = lerp(voieCy, railLeadY, smooth(0.2, 0.96, h));

      // Morph held back so it stays a legible compass through the look beat, then
      // becomes the orb as it sets off.
      const tm = smooth(0.2, 0.6, h);

      // Visibility: gentle fade-in as voie arrives, full-opacity hold, fade out as
      // the rail carries it up and away.
      const entrance = smooth(vh * 0.96, vh * 0.5, voieCy);
      const exit = smooth(-vh * 0.1, vh * 0.16, ty);
      const tsettle = clamp(0, 1, entrance);

      view.x = damp(view.x, tx);
      view.y = damp(view.y, ty);
      view.o = damp(view.o, clamp(0, 1, entrance * exit));
      view.m = damp(view.m, tm);
      view.settle = damp(view.settle, tsettle);

      const morph = smooth(0.14, 0.9, view.m); // 0 = compass · 1 = orb (widened → the contraction reads slower, less of a snap)
      wrap.style.opacity = String(view.o);
      wrap.style.transform = `translate3d(${view.x}px, ${view.y}px, 0) translate(-50%, -50%)`;

      // TRUE MORPH — the compass CONTRACTS into the ball; it does not just dissolve.
      // The dial eases its scale down toward the orb's size and only fades once it
      // has shrunk that far, while the orb blooms up from a seed. The two opacities
      // overlap heavily (their sum stays ≳1), so the mark never blinks to empty —
      // you watch the compass tighten into the glowing point. Uniform scale only
      // (never per-axis), so it shrinks symmetrically and never stretches.
      const ORB = 0.17; // 16px orb ÷ 96px dial — the size the compass collapses to
      const collapse = morph * morph; // ease-in: drifts, then snaps inward
      const compassScale = lerp(1, ORB, collapse);
      const compassOp = 1 - smooth(0.52, 0.96, morph); // holds, then fades late
      const orbScale = lerp(0.45, 1, smooth(0.16, 1, morph));
      const orbOp = smooth(0.26, 0.86, morph);

      if (detailRef.current) {
        detailRef.current.style.opacity = String(compassOp);
        detailRef.current.style.transform = `scale(${compassScale})`;
      }
      if (haloRef.current) {
        haloRef.current.style.opacity = String(compassOp * 0.85);
        haloRef.current.style.transform = `translate(-50%, -50%) scale(${compassScale})`;
      }
      if (orbRef.current) {
        orbRef.current.style.opacity = String(orbOp);
        orbRef.current.style.transform = `translate(-50%, -50%) scale(${orbScale})`;
      }
      if (needleRef.current) {
        // Search → settle to North → a final clockwise lock as the dial folds in.
        const s = view.settle;
        const overshoot = Math.sin(s * Math.PI) * 6 * (1 - s);
        const windDown = collapse * 24; // eases to rest as it disappears into the orb
        const angle = (1 - s) * -150 + overshoot + windDown;
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
      /* z-[34]: above section content + the RunwayRule (z-30) it conceptually
         continues, but below the header (z-50), loupe (z-80) and modals (z-100). */
      className="pointer-events-none fixed left-0 top-0 z-[34] h-[96px] w-[96px]"
      style={{ opacity: 0, willChange: "transform, opacity" }}
    >
      {/* soft halo — lifts the dial off the void; fades with the compass */}
      <span
        ref={haloRef}
        aria-hidden
        className="absolute left-1/2 top-1/2 block h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--gold-rgb) / 0.12) 0%, rgb(var(--gold-rgb) / 0) 68%)",
          mixBlendMode: "screen",
          willChange: "transform, opacity",
        }}
      />

      {/* compass detail — strokes carry enough weight to read as a dial on the
          void, so the morph is plainly "a compass tightening into a ball" */}
      <span ref={detailRef} className="absolute inset-0 block" style={{ willChange: "transform, opacity" }}>
        <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
          <circle cx="50" cy="50" r="46" stroke="rgba(247,244,239,0.62)" strokeWidth="1.4" />
          <circle cx="50" cy="50" r="36.5" stroke="rgba(247,244,239,0.32)" strokeWidth="1" />
          <line x1="50" y1="3.5" x2="50" y2="13" stroke="#E8B23A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="96" y1="50" x2="88" y2="50" stroke="rgba(247,244,239,0.62)" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="50" y1="96" x2="50" y2="88" stroke="rgba(247,244,239,0.62)" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="4" y1="50" x2="12" y2="50" stroke="rgba(247,244,239,0.62)" strokeWidth="1.4" strokeLinecap="round" />
          <g ref={needleRef}>
            <path d="M50 12 L57 50 L43 50 Z" fill="#E8B23A" />
            <path d="M50 88 L57 50 L43 50 Z" fill="rgba(247,244,239,0.5)" />
          </g>
          <circle cx="50" cy="50" r="3.9" fill="#0F1417" stroke="#E8B23A" strokeWidth="1.6" />
        </svg>
      </span>

      {/* gold journey-orb (the rail marker) — fixed 16px, never scaled */}
      <span
        ref={orbRef}
        className="absolute left-1/2 top-1/2 block h-[16px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          opacity: 0,
          // cream core → gold, derived from the brand tokens (was #FFF4D6/#F0C25A);
          // glow lowered so the orb sits with the photography, not over it.
          background:
            "radial-gradient(circle, #F7F4EF 0%, #E8B23A 55%, rgb(var(--gold-rgb) / 0) 80%)",
          boxShadow: "0 0 10px 2px rgb(var(--gold-rgb) / 0.3)",
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}
