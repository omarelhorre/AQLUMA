"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

/**
 * PROMPT TRANSFORM — the « L'IA sera dans sa vie » move, as an actual process.
 *
 * Three lanes run the same transformation on a stagger, so the frame is always
 * busy: a MESSY prompt drifts in from the left and accelerates INTO the gold
 * « Aqluma » pill, shrinking as it is absorbed; a beat of quiet; then a CLEAN
 * prompt emerges from the far side of the pill, grows out of it, and travels up
 * and to the right, feathering off the frame. No teleporting, no hard cuts —
 * every phrase is either arriving, being absorbed, or emerging. Reduced motion →
 * a calm static tableau (messy in, pill, clean out).
 *
 * `surface` flips the chip inks for the wall it sits on: "dark" (the original
 * void register) or "light" (the CtaCard cream slab — void chips, same gold
 * pill). Existing tokens only, no new colours.
 */

const BAD = ["Donne-moi la réponse.", "Juste le résultat.", "Copie, colle."];
const GOOD = ["Explique étape par étape.", "Pourquoi est-ce correct ?", "Aide-moi à comprendre."];

// Lane geometry (px from the pill centre). Messy prompts start at FROM and are
// pulled to the pill; clean prompts emerge and travel out to TO.
const FROM = [
  { x: -205, y: -54 },
  { x: -226, y: 4 },
  { x: -200, y: 58 },
];
const TO = [
  { x: 225, y: -54 },
  { x: 242, y: 4 },
  { x: 220, y: 58 },
];

const CYCLE = 4.2; // seconds per lane loop
const STEP = CYCLE / 3; // stagger between the three lanes

export default function PromptTransform({
  surface = "dark",
}: {
  surface?: "dark" | "light";
}) {
  const light = surface === "light";
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const badRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const goodRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const pill = pillRef.current;
    if (!root || !pill) return;
    const bad = badRefs.current;
    const good = goodRefs.current;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const lanes = FROM.map((from, i) => {
        const to = TO[i];
        const b = bad[i];
        const g = good[i];
        // One lane = one prompt's whole journey, looped. repeatDelay pads the
        // ~3.8s of motion up to CYCLE so all three stay phase-locked.
        const tl = gsap.timeline({ repeat: -1, repeatDelay: CYCLE - 3.8, delay: i * STEP, paused: true });
        // xPercent/yPercent:-50 centre the chip on its (left-1/2, top-58%) anchor;
        // x/y are then the lane offsets. (Kept off the className so GSAP owns the
        // whole transform — no Tailwind translate for it to clobber.)
        tl.set(b, { xPercent: -50, yPercent: -50, x: from.x, y: from.y, opacity: 0, scale: 0.92 })
          .set(g, { xPercent: -50, yPercent: -50, x: 0, y: 0, opacity: 0, scale: 0.42 })
          // messy prompt fades in, then accelerates into the pill and is absorbed
          .to(b, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0)
          .to(b, { x: 0, y: 0, duration: 1.5, ease: "power2.in" }, 0)
          .to(b, { opacity: 0, scale: 0.4, duration: 0.36, ease: "power2.in" }, 1.2)
          // …a beat of quiet, then the clean prompt emerges from the far side
          .to(g, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 1.85)
          .to(g, { x: to.x, y: to.y, duration: 1.7, ease: "power1.out" }, 1.95)
          .to(g, { opacity: 0, duration: 0.5, ease: "power1.in" }, 3.3);
        return tl;
      });

      // the pill breathes gently — its own life, not tied to any single intake
      const pulse = gsap.to(pill, { scale: 1.05, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });

      ScrollTrigger.create({
        trigger: root,
        start: "top 92%",
        end: "bottom 8%",
        onToggle: (self) => {
          const m = self.isActive ? "play" : "pause";
          lanes.forEach((t) => t[m]());
          pulse[m]();
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={rootRef} aria-hidden className="relative mx-auto h-[21rem] w-full select-none">
      {/* warm glow at the transformation point */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[58%] h-56 w-56 -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(closest-side, rgba(232,178,58,0.18), rgba(232,178,58,0) 70%)" }}
      />

      {/* IN — the messy prompts, drifting toward the pill to be absorbed */}
      {BAD.map((t, i) => (
        <span
          key={t}
          ref={(el) => { badRefs.current[i] = el; }}
          style={{
            transform: reduced ? `translate(calc(-50% + ${FROM[i].x}px), calc(-50% + ${FROM[i].y}px))` : undefined,
            opacity: reduced ? 0.4 : 0,
          }}
          className={`absolute left-1/2 top-[58%] whitespace-nowrap font-satoshi text-[clamp(0.9rem,1vw,1.05rem)] leading-none will-change-transform ${
            light ? "text-void/45" : "text-cream/40"
          }`}
        >
          {fr(t)}
        </span>
      ))}

      {/* the Aqluma pill — the transformation point */}
      <div
        ref={pillRef}
        className="absolute left-1/2 top-[58%] z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold px-6 py-2.5 font-didot text-[clamp(1.4rem,1.8vw,1.8rem)] leading-none tracking-[0.02em] text-void shadow-[0_0_64px_-4px_rgba(232,178,58,0.75)]"
      >
        Aqluma
      </div>

      {/* OUT — the transformed prompts, emerging clean and travelling off-frame.
          Each is a bright chip (the "clean" state) versus the muted messy text. */}
      {GOOD.map((t, i) => (
        <span
          key={t}
          ref={(el) => { goodRefs.current[i] = el; }}
          style={{
            transform: reduced ? `translate(calc(-50% + ${TO[i].x}px), calc(-50% + ${TO[i].y}px))` : undefined,
            opacity: reduced ? 1 : 0,
          } as CSSProperties}
          className={`absolute left-1/2 top-[58%] whitespace-nowrap rounded-full px-3.5 py-1.5 font-satoshi text-[clamp(0.9rem,1.05vw,1.1rem)] font-semibold leading-none will-change-transform ${
            light
              ? "bg-void text-cream shadow-[0_12px_30px_-14px_rgba(8,10,12,0.45)]"
              : "bg-cream text-void shadow-[0_12px_30px_-14px_rgba(0,0,0,0.7)]"
          }`}
        >
          {fr(t)}
        </span>
      ))}
    </div>
  );
}
