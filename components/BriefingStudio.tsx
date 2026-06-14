"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import GrowthLine, { type GrowthLineHandle } from "./GrowthLine";

/**
 * PHASE 2 — Le Studio du Briefing (horizontal left → right slider).
 *
 * One pinned section. A 4-slide track (each slide 100vw × 100vh) pans
 * horizontally with scroll. Every slide frames ONE object from the single
 * master desk image by translating that shared image so the object sits centre
 * stage; the slide ground + the image ground are the same terracotta, and the
 * image edges are feathered, so the four frames read as one continuous desk.
 *
 * The growth line runs across the top; its glowing dot tracks scroll progress.
 * Mobile / reduced motion: the slides stack vertically and scroll natively.
 */

const MASTER = "/worlds/briefing/master-desk-canvas.jpg";
const TERRACOTTA = "#8B3A1A";

// Master image is 2752 × 1536  →  aspect 1.7917. Sized by height in vh, its
// width in vh is height × aspect. `fx` is the object's centre as a fraction of
// the image width (measured off the master), used to slide it to centre stage.
const IMG_H_VH = 72;
const IMG_W_VH = IMG_H_VH * 1.7917; // ≈ 129

type Slide = { fx: number; header: string; body: string };

const SLIDES: Slide[] = [
  {
    fx: 0.092,
    header: "La page blanche",
    body: "Face à la page blanche, le premier réflexe d’un adolescent est souvent la panique : une pile d’idées jetées, de doutes froissés. Le problème n’est pas la machine ; c’est l’absence d’un chemin calme pour commencer.",
  },
  {
    fx: 0.3,
    header: "Le miroir sans fin",
    body: "Il croise déjà l’IA chaque jour, sur chaque écran. Mais un écran sans stratégie n’est qu’un miroir sans fin. Le vrai apprentissage commence quand les réponses numériques sont questionnées, puis réécrites à la main.",
  },
  {
    fx: 0.51,
    header: "L’œil critique",
    body: "Un outil gratuit peut donner mille réponses instantanées ; jamais un cadre mental rigoureux. Nous leur apprenons à regarder de plus près, à examiner ce qui est généré d’un œil critique.",
  },
  {
    fx: 0.795,
    header: "La boussole",
    body: "L’IA, est-ce tricher ? La frontière ne passe pas par l’appareil ; elle passe par ce qui reste dans la tête. Un outil doit être une boussole qui guide, non un véhicule qui transporte. C’est pour cela que le Briefing AQLUMA existe.",
  },
];

// Gentle left→right guide across the top third (0..1000 viewBox space).
const STUDIO_PATH = "M40,210 C 320,140 700,260 960,196";

export default function BriefingStudio() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<(HTMLDivElement | null)[]>([]);
  const growthRef = useRef<GrowthLineHandle>(null);

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
    const content = contentRef.current.filter(Boolean) as HTMLDivElement[];
    const span = SLIDES.length - 1; // number of transitions
    const distance = () => Math.max(0, track.offsetWidth - window.innerWidth);

    const ctx = gsap.context(() => {
      gsap.set(content, { opacity: 0, y: 26 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => growthRef.current?.setProgress(self.progress),
        },
      });

      // The pan: 0 → fully left. `span` time-units, so slide i is centred at i.
      tl.to(track, { x: () => -distance(), ease: "none", duration: span }, 0);

      // Copy for each slide rises in as it reaches centre, settles, then leaves.
      content.forEach((el, i) => {
        tl.fromTo(
          el,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, ease: "power3.out", duration: 0.5 },
          Math.max(0, i - 0.5)
        );
        if (i < content.length - 1) {
          tl.to(el, { opacity: 0, y: -22, ease: "power2.in", duration: 0.4 }, i + 0.35);
        }
      });
    }, section);

    return () => ctx.revert();
  }, [stacked]);

  // ── Mobile / reduced motion: vertical stack, native scroll ──
  if (stacked) {
    return (
      <section
        id="briefing-section"
        className="relative w-full"
        style={{ backgroundColor: TERRACOTTA }}
        aria-label="AQLUMA — Le Studio du Briefing"
      >
        {SLIDES.map((s, i) => (
          <div key={i} className="flex min-h-[78vh] flex-col justify-center gap-6 px-7 py-16">
            <div className="relative h-[34vh] w-full overflow-hidden rounded-sm">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${MASTER})`,
                  backgroundSize: "auto 100%",
                  backgroundPosition: `${s.fx * 100}% center`,
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
            <h2 className="font-didot text-[clamp(2rem,8vw,3rem)] leading-[1.06] tracking-display text-cream">
              {s.header}
            </h2>
            <p className="max-w-[46ch] font-satoshi text-[15px] leading-relaxed text-cream/75">
              {s.body}
            </p>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="briefing-section"
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: TERRACOTTA }}
      aria-label="AQLUMA — Le Studio du Briefing"
    >
      <div ref={trackRef} className="flex h-screen will-change-transform" style={{ width: `${SLIDES.length * 100}vw` }}>
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="briefing-slide relative h-screen w-screen flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: TERRACOTTA }}
          >
            {/* The shared master image, slid so THIS slide's object centres. The
                feathered edges melt into the terracotta ground on every side. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- measured pan
                of a single shared canvas; next/image fill can't express it. */}
            <img
              src={MASTER}
              alt=""
              draggable={false}
              className="pointer-events-none absolute select-none"
              style={{
                height: `${IMG_H_VH}vh`,
                width: "auto",
                top: "13vh",
                left: `calc(50vw - ${(s.fx * IMG_W_VH).toFixed(2)}vh)`,
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0, #000 13%, #000 87%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 11%, #000 89%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0, #000 13%, #000 87%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 11%, #000 89%, transparent 100%)",
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
              }}
            />

            {/* Legibility scrim, lower-left, under the copy. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(100deg, rgba(8,10,12,0.5) 0%, rgba(8,10,12,0.14) 30%, rgba(8,10,12,0) 55%), linear-gradient(0deg, rgba(8,10,12,0.42) 0%, rgba(8,10,12,0) 38%)",
              }}
            />

            {/* Editorial copy — anchored lower-left, in the open terracotta. */}
            <div
              ref={(el) => {
                contentRef.current[i] = el;
              }}
              className="absolute bottom-[15vh] left-[7vw] z-20 w-[34rem] max-w-[80vw] will-change-[transform,opacity]"
            >
              <span className="mb-5 flex items-center gap-3">
                <span className="font-satoshi text-[12px] tabular-nums tracking-tight text-cream/45">
                  {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </span>
                <span className="h-px w-12" style={{ background: "linear-gradient(90deg, rgba(247,244,239,0.5), rgba(247,244,239,0))" }} />
              </span>
              <h2 className="font-didot text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.05] tracking-display text-cream">
                {s.header}
              </h2>
              <p className="mt-5 max-w-[38ch] font-satoshi text-[clamp(0.95rem,1.2vw,1.1rem)] leading-relaxed text-cream/75">
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Growth line across the top — its dot tracks the pan. */}
      <GrowthLine ref={growthRef} d={STUDIO_PATH} />
    </section>
  );
}
