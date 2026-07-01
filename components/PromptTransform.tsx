"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

/**
 * PROMPT TRANSFORM — the « L'IA sera dans sa vie » move (Wispr-Flow inspired).
 *
 * The BAD prompts circle the gold « Aqluma » pill as a slow ring of muted, messy
 * demands — each phrase stays UPRIGHT (it orbits, it doesn't flip). They funnel
 * into the pill and come out the other side GOOD: a bright band scrolling the
 * transformed prompts up and to the right, feathering off the frame. Before: I
 * want answers. After: I want to understand. Reduced motion → static.
 */

const BAD = [
  { text: "Donne-moi la réponse.", left: "84%", top: "30%" },
  { text: "Pas besoin d'expliquer.", left: "80%", top: "74%" },
  { text: "Juste le résultat, vite.", left: "20%", top: "72%" },
  { text: "Copie, colle, c'est tout.", left: "22%", top: "28%" },
];

const RIBBON_TEXT =
  "Explique-moi étape par étape.   ·   Pourquoi cette réponse est correcte ?   ·   Aide-moi à comprendre, pas à copier.   ·   ";

export default function PromptTransform() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const phraseRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const ring = ringRef.current;
    const marquee = marqueeRef.current;
    const pill = pillRef.current;
    if (!root || !ring || !marquee || !pill) return;
    const phrases = phraseRefs.current.filter(Boolean) as HTMLSpanElement[];
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // the ring of demands orbits slowly; each phrase counter-rotates upright
      const spin = gsap.to(ring, {
        rotation: 360,
        transformOrigin: "50% 50%",
        duration: 52,
        ease: "none",
        repeat: -1,
        paused: true,
      });
      const upright = phrases.map((el) =>
        gsap.to(el, {
          rotation: -360,
          transformOrigin: "50% 50%",
          duration: 52,
          ease: "none",
          repeat: -1,
          paused: true,
        }),
      );
      // clean result scrolls out along the band (two copies → seamless marquee)
      const scroll = gsap.to(marquee, { xPercent: -50, duration: 22, ease: "none", repeat: -1, paused: true });
      const pulse = gsap.to(pill, { scale: 1.05, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });

      ScrollTrigger.create({
        trigger: root,
        start: "top 92%",
        end: "bottom 8%",
        onToggle: (self) => {
          const m = self.isActive ? "play" : "pause";
          spin[m]();
          upright.forEach((t) => t[m]());
          scroll[m]();
          pulse[m]();
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={rootRef} aria-hidden className="relative mx-auto h-[24rem] w-full select-none">
      {/* warm glow at the transformation point */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[58%] h-56 w-56 -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(closest-side, rgba(232,178,58,0.18), rgba(8,10,12,0) 70%)" }}
      />

      {/* IN — the messy demands, orbiting the pill (each phrase stays upright) */}
      <div
        ref={ringRef}
        className="absolute left-[30%] top-[58%] h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2"
        style={{
          maskImage: "radial-gradient(closest-side, #000 62%, transparent 96%)",
          WebkitMaskImage: "radial-gradient(closest-side, #000 62%, transparent 96%)",
        }}
      >
        {BAD.map((p, i) => (
          <span
            key={p.text}
            style={{ left: p.left, top: p.top } as CSSProperties}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <span
              ref={(el) => {
                phraseRefs.current[i] = el;
              }}
              className="inline-block whitespace-nowrap font-satoshi text-[clamp(0.92rem,1vw,1.08rem)] leading-none text-cream/40 will-change-transform"
            >
              {fr(p.text)}
            </span>
          </span>
        ))}
      </div>

      {/* the Aqluma pill — the transformation point */}
      <div
        ref={pillRef}
        className="absolute left-1/2 top-[58%] z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold px-6 py-2.5 font-didot text-[clamp(1.4rem,1.8vw,1.8rem)] leading-none tracking-[0.02em] text-void shadow-[0_0_64px_-4px_rgba(232,178,58,0.75)]"
      >
        Aqluma
      </div>

      {/* OUT — the transformed prompts, a bright band scrolling up and to the
          right; the band itself is the "white marker". Feathers off the frame. */}
      <div
        className="absolute left-[48%] top-[58%] z-0 flex h-[2.9rem] w-[74%] origin-left -translate-y-1/2 -rotate-[11deg] items-center overflow-hidden rounded-[5px] bg-cream shadow-[0_16px_38px_-14px_rgba(0,0,0,0.7)]"
        style={{
          maskImage: "linear-gradient(to right, #000 62%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, #000 62%, transparent 100%)",
        }}
      >
        <div ref={marqueeRef} className="flex shrink-0 will-change-transform">
          <span className="whitespace-nowrap pr-1 font-satoshi text-[clamp(1rem,1.15vw,1.2rem)] font-bold leading-none text-void">
            {fr(RIBBON_TEXT)}
          </span>
          <span aria-hidden className="whitespace-nowrap pr-1 font-satoshi text-[clamp(1rem,1.15vw,1.2rem)] font-bold leading-none text-void">
            {fr(RIBBON_TEXT)}
          </span>
        </div>
      </div>
    </div>
  );
}
