"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import RunwayRule, { type RunwayRuleHandle } from "./RunwayRule";

/**
 * PHASE 2 — Le Studio du Briefing (continuous horizontal pan).
 *
 * One pinned section. The WHOLE master desk image is a single continuous strip
 * that pans left → right with scroll — no slicing, no per-object crops, no
 * seams. The image is shown wider than the viewport so vertical scroll drives a
 * real horizontal pan across the desk; the empty terracotta ground (#8B3A1A)
 * fills the ends, so the start/finish blend invisibly into the canvas.
 *
 * The four editorial captions cross-fade in a fixed lower-left slot as each
 * object passes centre. The growth line runs across the top; its dot tracks the
 * pan. Mobile / reduced motion: the full image sits above stacked captions.
 */

const MASTER = "/watermarked_img_6923391812713320576.png";
// Sampled straight off the photo's wall (rgb 160,72,40) so the overscan ground
// matches the desk EXACTLY — the brand #8B3A1A was darker and left a hard seam.
const TERRACOTTA = "#A04828";

// Image rendered this many viewport-widths wide → a full-screen horizontal pan
// while the flat-lay's empty top/bottom wall is gently cropped by the frame.
const ZOOM_W = 200; // vw

// Feathers the image's left/right edges into the matching ground so the strip's
// ends dissolve invisibly (objects sit well inside the solid band, untouched).
const EDGE_FEATHER =
  "linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%)";

// Object centres as a fraction of the image width (measured off the master):
// papers · tablet+journal · magnifier · compass+notebooks. Used to centre the
// first object at the start of the pan and the last at the end, and to time the
// captions as each object crosses centre.
const CAPTIONS = [
  {
    fx: 0.094,
    header: "La page blanche",
    body: "Face à la page blanche, le premier réflexe d’un adolescent est souvent la panique : une pile d’idées jetées, de doutes froissés. Le problème n’est pas la machine ; c’est l’absence d’un chemin calme pour commencer.",
  },
  {
    fx: 0.42,
    header: "Le miroir sans fin",
    body: "Il croise déjà l’IA chaque jour, sur chaque écran. Mais un écran sans stratégie n’est qu’un miroir sans fin. Le vrai apprentissage commence quand les réponses numériques sont questionnées, puis réécrites à la main.",
  },
  {
    fx: 0.671,
    header: "L’œil critique",
    body: "Un outil gratuit peut donner mille réponses instantanées ; jamais un cadre mental rigoureux. Nous leur apprenons à regarder de plus près, à examiner ce qui est généré d’un œil critique.",
  },
  {
    fx: 0.868,
    header: "La boussole",
    body: "L’IA, est-ce tricher ? La frontière ne passe pas par l’appareil ; elle passe par ce qui reste dans la tête. Un outil doit être une boussole qui guide, non un véhicule qui transporte. C’est pour cela que le Briefing AQLUMA existe.",
  },
];

const FX_FIRST = CAPTIONS[0].fx;
const FX_LAST = CAPTIONS[CAPTIONS.length - 1].fx;
// Caption i fires when its object reaches centre — a normalised 0..1 position.
const CAPTION_AT = CAPTIONS.map((c) => (c.fx - FX_FIRST) / (FX_LAST - FX_FIRST));

export default function BriefingStudio() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<(HTMLDivElement | null)[]>([]);
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
    const captions = captionRef.current.filter(Boolean) as HTMLDivElement[];

    // Centre the first object at the start of the pan and the last at the end;
    // terracotta ground fills the overscan on either side.
    const startX = () => window.innerWidth / 2 - FX_FIRST * track.offsetWidth;
    const endX = () => window.innerWidth / 2 - FX_LAST * track.offsetWidth;
    const distance = () => Math.abs(startX() - endX());

    const ctx = gsap.context(() => {
      gsap.set(captions, { opacity: 0, y: 22 });
      gsap.set(track, { x: startX });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => ruleRef.current?.setProgress(self.progress),
          onToggle: (self) => ruleRef.current?.setActive(self.isActive),
        },
      });

      // Timeline of duration 1 == scroll progress, so caption timings line up
      // directly with each object's normalised centre position.
      tl.fromTo(track, { x: startX }, { x: endX, ease: "none", duration: 1 }, 0);

      captions.forEach((el, i) => {
        const at = CAPTION_AT[i];
        tl.fromTo(
          el,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, ease: "power3.out", duration: 0.12 },
          Math.max(0, at - 0.12)
        );
        if (i < captions.length - 1) {
          tl.to(el, { opacity: 0, y: -18, ease: "power2.in", duration: 0.1 }, at + 0.1);
        }
      });
    }, section);

    return () => ctx.revert();
  }, [stacked]);

  // ── Mobile / reduced motion: full image above stacked captions ──
  if (stacked) {
    return (
      <section
        id="briefing-section"
        className="relative w-full"
        style={{ backgroundColor: TERRACOTTA }}
        aria-label="AQLUMA — Le Studio du Briefing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- full desk canvas */}
        <img src={MASTER} alt="" className="block h-auto w-full select-none" draggable={false} />
        <div className="flex flex-col gap-12 px-7 py-16">
          {CAPTIONS.map((c, i) => (
            <div key={i}>
              <span className="font-satoshi text-[12px] tabular-nums tracking-tight text-cream/45">
                {String(i + 1).padStart(2, "0")} / {String(CAPTIONS.length).padStart(2, "0")}
              </span>
              <h2 className="mt-2 font-didot text-[clamp(2rem,8vw,3rem)] leading-[1.06] tracking-display text-cream">
                {c.header}
              </h2>
              <p className="mt-3 max-w-[46ch] font-satoshi text-[15px] leading-relaxed text-cream/75">
                {c.body}
              </p>
            </div>
          ))}
        </div>
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
      {/* The whole desk as one continuous strip, panned horizontally. */}
      <div
        ref={trackRef}
        className="absolute inset-y-0 left-0 will-change-transform"
        style={{ width: `${ZOOM_W}vw` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- single panned canvas */}
        <img
          src={MASTER}
          alt=""
          draggable={false}
          className="pointer-events-none absolute left-0 top-1/2 h-auto w-full max-w-none -translate-y-1/2 select-none"
          style={{ WebkitMaskImage: EDGE_FEATHER, maskImage: EDGE_FEATHER }}
        />
      </div>

      {/* Legibility scrim under the caption (lower-left). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(100deg, rgba(8,10,12,0.52) 0%, rgba(8,10,12,0.16) 30%, rgba(8,10,12,0) 56%), linear-gradient(0deg, rgba(8,10,12,0.42) 0%, rgba(8,10,12,0) 38%)",
        }}
      />

      {/* Captions — fixed lower-left slot, cross-fading as each object centres. */}
      <div className="pointer-events-none absolute bottom-[15vh] left-[7vw] z-20 h-[36vh] w-[34rem] max-w-[80vw]">
        {CAPTIONS.map((c, i) => (
          <div
            key={i}
            ref={(el) => {
              captionRef.current[i] = el;
            }}
            className="absolute bottom-0 left-0 will-change-[transform,opacity]"
          >
            <span className="mb-5 flex items-center gap-3">
              <span className="font-satoshi text-[12px] tabular-nums tracking-tight text-cream/45">
                {String(i + 1).padStart(2, "0")} / {String(CAPTIONS.length).padStart(2, "0")}
              </span>
              <span className="h-px w-12" style={{ background: "linear-gradient(90deg, rgba(247,244,239,0.5), rgba(247,244,239,0))" }} />
            </span>
            <h2 className="font-didot text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.05] tracking-display text-cream">
              {c.header}
            </h2>
            <p className="mt-5 max-w-[38ch] font-satoshi text-[clamp(0.95rem,1.2vw,1.1rem)] leading-relaxed text-cream/75">
              {c.body}
            </p>
          </div>
        ))}
      </div>

      {/* Briefing filling bar (progress hairline + counter) at the foot. */}
      <RunwayRule ref={ruleRef} total={CAPTIONS.length} label="Le Briefing" />
    </section>
  );
}
