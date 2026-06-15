"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import RunwayRule, { type RunwayRuleHandle } from "./RunwayRule";

/**
 * LE MUSÉE AQLUMA — scroll-driven horizontal pan, RIGHT → LEFT.
 *
 * One pinned section; vertical scroll pans the whole gallery wall from its right
 * end to its left end. Moderate zoom (the whole wall reads; only empty
 * ceiling/floor crop). Editorial captions (Briefing style) travel with the wall
 * and fade in as they enter frame — alternated top/bottom so a label never sits
 * over its exhibit.
 *
 * Mobile / reduced motion: the full image sits above stacked captions.
 */

const PANORAMA = "/musee-aqluma-panorama.jpg";
const ZOOM_W = 140; // vw — unzoomed; ~40vw of horizontal travel

type Block = {
  left: string;
  /** Vertical anchor — top for exhibits whose piece sits low, bottom for high. */
  v: React.CSSProperties;
  title: string;
  note: string;
};

// Authored 01→04 left→right on the wall. Right→left pan meets 04 first.
// Alternated: 01 bottom · 02 top · 03 bottom · 04 top (never over the exhibit).
// Copy drawn from the Musée des Erreurs IA scripts — same storytelling voice.
const BLOCKS: Block[] = [
  {
    left: "8%",
    v: { bottom: "3%" },
    title: "La source qui n’existait pas.",
    note: "Un titre crédible. Un auteur. Une année. Tout avait la forme d’une référence — sans jamais en avoir la réalité.",
  },
  {
    left: "30%",
    v: { top: "15%" },
    title: "Le ton ne tremble jamais.",
    note: "Juste ou faux, la réponse garde la même voix. La fluidité n’est pas la fiabilité.",
  },
  {
    left: "53%",
    v: { bottom: "3%" },
    title: "Le calcul élégant et faux.",
    note: "Des étapes claires, une conclusion nette. Et une erreur, glissée au milieu, que l’élégance rend invisible.",
  },
  {
    left: "76%",
    v: { top: "15%" },
    title: "Le geste à retenir.",
    note: "Le problème n’est pas l’erreur. C’est la confiance trop rapide. On apprend à lire la réponse — sans la croire.",
  },
];

const SHADOW = "0 2px 30px rgba(0,0,0,0.85)";

function Caption({ b, i }: { b: Block; i: number }) {
  return (
    <div style={{ textShadow: SHADOW }}>
      <span className="mb-3 flex items-center gap-3">
        <span className="font-satoshi text-[11px] tabular-nums tracking-tight text-cream/45">
          {/* Right→left pan: the rightmost exhibit is seen first → reverse the index. */}
          {String(BLOCKS.length - i).padStart(2, "0")} / {String(BLOCKS.length).padStart(2, "0")}
        </span>
        <span
          className="h-px w-10"
          style={{ background: "linear-gradient(90deg, rgba(247,244,239,0.5), rgba(247,244,239,0))" }}
        />
      </span>
      <h2 className="font-didot text-[clamp(2.1rem,3.9vw,3.6rem)] leading-[1.04] tracking-display text-cream">
        {b.title}
      </h2>
      <p className="mt-4 font-satoshi text-[clamp(0.95rem,1.25vw,1.2rem)] leading-relaxed text-cream/70">
        {b.note}
      </p>
    </div>
  );
}

export default function MuseumErrors() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRef = useRef<RunwayRuleHandle>(null);

  const reduced = useReducedMotion();
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const stacked = reduced || narrow;

  useEffect(() => {
    if (stacked) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);
    const blocks = blockRefs.current.filter(Boolean) as HTMLDivElement[];
    const distance = () => Math.max(0, track.offsetWidth - window.innerWidth);

    const ctx = gsap.context(() => {
      // Start showing the RIGHT end; pan to the LEFT end.
      gsap.set(track, { x: () => -distance() });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            ruleRef.current?.setProgress(self.progress);
            const trackX = (gsap.getProperty(track, "x") as number) || 0;
            const vw = window.innerWidth;
            blocks.forEach((el) => {
              const sx = trackX + el.offsetLeft;
              if (sx >= -60 && sx <= vw + 60) el.style.opacity = "1";
            });
          },
          onToggle: (self) => ruleRef.current?.setActive(self.isActive),
        },
      });

      tl.fromTo(track, { x: () => -distance() }, { x: 0, ease: "none", duration: 1 }, 0);
    }, section);

    return () => ctx.revert();
  }, [stacked]);

  // ── Mobile / reduced motion: full image above stacked captions ──
  if (stacked) {
    return (
      <section id="museum-section" className="relative w-full" style={{ background: "#080A0C" }} aria-label="AQLUMA — Le Musée">
        {/* eslint-disable-next-line @next/next/no-img-element -- full gallery panorama */}
        <img src={PANORAMA} alt="" className="block h-auto w-full select-none" draggable={false} />
        <div className="flex flex-col gap-12 px-7 py-16">
          {BLOCKS.map((b, i) => (
            <Caption key={i} b={b} i={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="museum-section"
      className="relative h-screen w-full overflow-hidden"
      style={{ background: "#080A0C" }}
      aria-label="AQLUMA — Le Musée"
    >
      <div ref={trackRef} className="absolute inset-y-0 left-0 h-full will-change-transform" style={{ width: `${ZOOM_W}vw` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- single panned canvas */}
        <img
          src={PANORAMA}
          alt=""
          draggable={false}
          className="pointer-events-none absolute left-0 top-1/2 h-auto w-full max-w-none -translate-y-1/2 select-none"
        />

        {/* Wall captions — travel with the wall, fade in as they enter frame. */}
        {BLOCKS.map((b, i) => (
          <div
            key={i}
            ref={(el) => {
              blockRefs.current[i] = el;
            }}
            className="pointer-events-none absolute w-[min(27rem,36vw)]"
            style={{ left: b.left, ...b.v, opacity: 0, transition: "opacity 1.2s ease" }}
          >
            <Caption b={b} i={i} />
          </div>
        ))}
      </div>

      {/* Loading bar — Briefing-style runway, pinned to the TOP. */}
      <RunwayRule ref={ruleRef} total={BLOCKS.length} label="Le Musée" placement="top" />
    </section>
  );
}
