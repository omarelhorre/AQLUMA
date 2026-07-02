"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

/**
 * INTRO REVEAL — the premium loading beat, played ONCE per page load.
 *
 * A pure-black screen (true #000 — deliberately deeper than the site's void, so
 * the reveal has somewhere to open INTO) with the AQLUMA mark centred: the mark
 * fades in and "wakes up" (0.98 → 1 scale, a gentle brightness swell, two
 * almost-imperceptible flickers inside the first second — no glitch, no glow),
 * the desktop recommendation settles in beneath with an outlined laptop, a
 * short held breath, then the whole screen opens like an aperture: a circular
 * mask expands from the exact centre until the page — already rendered and
 * settled underneath — fills the viewport. ~2.2s total, then the overlay
 * unmounts and the page is interactive.
 *
 * Craft notes:
 *   · The overlay server-renders opaque black with its content at opacity 0, so
 *     the first paint is a calm black screen — never a flash of the page.
 *   · Scroll is held (html overflow) for the duration; released on unmount.
 *   · GPU-only motion: opacity / transform / filter / mask. No layout writes.
 *   · The message uses Satoshi 700 — the heaviest weight the site ships (there
 *     is no Black face in the self-hosted set).
 *   · A module flag keeps it to one play per page load (strict-mode remounts,
 *     client re-renders); a refresh naturally resets it. Reduced motion skips
 *     the sequence entirely.
 *   · <noscript> hides the overlay so the page is never trapped behind it.
 */

let played = false;

// The aperture edge: a hole in the black, 1px feather — crisp, lens-like.
const mask = (r: number) =>
  `radial-gradient(circle at 50% 50%, transparent ${r}px, #000 ${r + 1}px)`;

export default function IntroReveal() {
  const reduced = useReducedMotion();
  const [gone, setGone] = useState(() => played);
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLParagraphElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gone) return;
    if (reduced) {
      // No sequence, no held scroll — straight to the page.
      played = true;
      setGone(true);
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    played = true;

    document.documentElement.style.overflow = "hidden";
    const release = () => {
      document.documentElement.style.overflow = "";
    };

    const aperture = { r: 0 };
    const targetR = () => Math.hypot(window.innerWidth, window.innerHeight) / 2 + 40;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          release();
          setGone(true);
        },
      });

      // 1–3 · the mark wakes up
      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out" },
        0.05,
      )
        .fromTo(
          logoRef.current,
          { filter: "brightness(0.92)" },
          { filter: "brightness(1.06)", duration: 0.45, ease: "sine.inOut" },
          0.15,
        )
        .to(logoRef.current, { filter: "brightness(1)", duration: 0.4, ease: "sine.inOut" }, 0.6)
        // two sub-frame dips — a filament settling, not a glitch
        .to(logoRef.current, { opacity: 0.94, duration: 0.05, ease: "none" }, 0.42)
        .to(logoRef.current, { opacity: 1, duration: 0.07, ease: "none" }, 0.47)
        .to(logoRef.current, { opacity: 0.97, duration: 0.04, ease: "none" }, 0.78)
        .to(logoRef.current, { opacity: 1, duration: 0.06, ease: "none" }, 0.82);

      // 4 · the recommendation settles in beneath
      tl.fromTo(
        msgRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
        0.5,
      ).fromTo(
        iconRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        0.66,
      );

      // 5 · held breath (nothing scheduled 1.16 → 1.5)

      // 6–7 · the screen's content recedes a step, then the aperture opens onto
      // the page already living underneath. power3.inOut = the lens feel.
      tl.to(
        contentRef.current,
        { opacity: 0, scale: 0.99, duration: 0.3, ease: "power1.in" },
        1.5,
      ).to(
        aperture,
        {
          r: targetR,
          duration: 0.6,
          ease: "power3.inOut",
          onUpdate: () => {
            const m = mask(aperture.r);
            root.style.webkitMaskImage = m;
            root.style.maskImage = m;
          },
        },
        1.6,
      );
    }, root);

    return () => {
      release();
      ctx.revert();
    };
  }, [gone, reduced]);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      id="aq-intro"
      aria-hidden
      className="fixed inset-0 z-[65] flex select-none items-center justify-center bg-black"
    >
      <noscript>
        <style>{`#aq-intro{display:none}`}</style>
      </noscript>

      <div ref={contentRef} className="flex flex-col items-center px-6 text-center">
        <img
          ref={logoRef}
          src="/brand/aqluma-mark.png"
          alt=""
          width={653}
          height={526}
          fetchPriority="high"
          className="w-[clamp(84px,9vw,120px)] will-change-[transform,opacity,filter]"
          style={{ opacity: 0 }}
        />

        <p
          ref={msgRef}
          className="mt-12 font-satoshi text-[clamp(0.98rem,1.4vw,1.2rem)] font-bold leading-[1.9] text-white will-change-[transform,opacity]"
          style={{ opacity: 0 }}
        >
          {fr("Pour une expérience optimale,")}
          <br />
          {fr("nous vous recommandons d'utiliser un ordinateur.")}
        </p>

        <div ref={iconRef} className="mt-9 text-white will-change-[transform,opacity]" style={{ opacity: 0 }}>
          {/* outlined laptop — screen + base, nothing else */}
          <svg
            viewBox="0 0 32 32"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="8" y="8.5" width="16" height="11.5" rx="1.5" />
            <path d="M5 23.5h22" />
          </svg>
        </div>
      </div>
    </div>
  );
}
