"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import RunwayRule, { type RunwayRuleHandle } from "./RunwayRule";

/**
 * WORLD GALLERY — the shared "Musée pan" engine for all three AQLUMA worlds.
 *
 * One pinned section. Vertical scroll pans a single flat-lay / gallery image
 * horizontally across the viewport (left→right, or right→left for the Musée).
 *
 * Each caption is PINNED TO THE WALL (at an image-fraction position next to its
 * object) so it travels with the image — fixed to the image, never sliding over
 * it. Only ONE caption is legible at a time: each fades in/out (opacity + blur)
 * around its scroll-progress peak (`at`). A bg-colour vignette blends the
 * panorama edges into the page, giving the centred object room to breathe.
 *
 * Mobile / reduced motion: the full image sits above stacked captions.
 */

export type GalleryBlock = {
  /** Counter index (01 / total). */
  n: number;
  /** Object centre as a fraction of the image width. The pan centres each object
   *  in turn; the caption peaks exactly when its object hits screen centre. */
  fx: number;
  /** Caption anchor on the WALL, as a fraction of the image width ("40%"). Glued
   *  here, it pans with the image. Place it in the empty space beside the object. */
  left: string;
  /** Vertical anchor on the wall: `{ top }` or `{ bottom }`. */
  v: CSSProperties;
  title: string;
  note: string;
};

type Props = {
  id: string;
  label: string;
  image: string;
  /** Backdrop colour — fills the overscan and blends the image edges. */
  bg: string;
  /** Text colour scheme for the wall: dark wall → cream, pale wall → ink. */
  tone: "dark" | "light";
  blocks: GalleryBlock[];
  /** Image width in viewport-widths. > ~180 fills height and gives travel. */
  zoomW?: number;
  rulePlacement?: "top" | "bottom";
};

// A caption owns the stretch of scroll around its object and hands off at a
// boundary biased LATE (BIAS→1), so the previous note holds while the wall
// travels to the next object and the next note appears only as it arrives.
const FADE = 0.06; // cross-fade half-width at a boundary
const BIAS = 0.72; // 0.5 = midpoint handoff; →1 = previous note holds longer

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (t: number) => t * t * (3 - 2 * t);

// Feather the image's far left/right edges into transparency so that, at the
// start/end of the pan, the picture dissolves into the world bg (no hard seam).
const EDGE_FEATHER =
  "linear-gradient(to right, transparent 0, #000 3.5%, #000 96.5%, transparent 100%)";

function Caption({ b, tone, total }: { b: GalleryBlock; tone: "dark" | "light"; total: number }) {
  const light = tone === "light";
  const titleC = light ? "text-ink" : "text-cream";
  const bodyC = light ? "text-ink/72" : "text-cream/75";
  const mutedC = light ? "text-ink/45" : "text-cream/45";

  return (
    <div className="relative">
      <span className="mb-4 flex items-center gap-3">
        <span className={`font-satoshi text-[12px] font-medium tabular-nums tracking-tight ${mutedC}`}>
          {`${String(b.n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
        </span>
        <span
          className="h-px w-12"
          style={{
            background: light
              ? "linear-gradient(90deg, rgba(15,20,23,0.5), rgba(15,20,23,0))"
              : "linear-gradient(90deg, rgba(247,244,239,0.55), rgba(247,244,239,0))",
          }}
        />
      </span>
      <h2 className={`font-didot text-[clamp(2.6rem,4.4vw,4.9rem)] leading-[1.02] tracking-display ${titleC}`}>
        {b.title}
      </h2>
      <p className={`mt-5 max-w-[28ch] font-satoshi text-[clamp(1.1rem,1.5vw,1.55rem)] leading-relaxed ${bodyC}`}>
        {b.note}
      </p>
    </div>
  );
}

export default function WorldGallery({
  id,
  label,
  image,
  bg,
  tone,
  blocks,
  zoomW = 200,
  rulePlacement = "top",
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const capTrackRef = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    const caps = capRefs.current;
    const lanes = [track, capTrackRef.current].filter(Boolean) as HTMLDivElement[];

    // Centre the FIRST object at the start of the pan and the LAST at the end, so
    // every object crosses screen centre in turn. `ats[i]` is the progress where
    // object i is centred — its caption peaks exactly then.
    const fx0 = blocks[0].fx;
    const fxL = blocks[blocks.length - 1].fx;
    const span = fxL - fx0 || 1;
    const ats = blocks.map((b) => (b.fx - fx0) / span);

    const trackW = () => track.offsetWidth;
    const startX = () => window.innerWidth / 2 - fx0 * trackW();
    const endX = () => window.innerWidth / 2 - fxL * trackW();
    const distance = () => Math.abs(startX() - endX());

    // A note is full across its own stretch and cross-fades only at the (late)
    // boundaries with its neighbours — holds, then a quick handoff.
    const last = blocks.length - 1;
    const bound = (a: number, b: number) => a + (b - a) * BIAS;
    const paint = (p: number) => {
      for (let i = 0; i < caps.length; i++) {
        const el = caps[i];
        if (!el) continue;
        let op = 1;
        if (i > 0) op *= clamp01((p - (bound(ats[i - 1], ats[i]) - FADE)) / (2 * FADE));
        if (i < last) op *= 1 - clamp01((p - (bound(ats[i], ats[i + 1]) - FADE)) / (2 * FADE));
        const e = smooth(op);
        el.style.opacity = String(e);
        el.style.filter = `blur(${(1 - e) * 14}px)`;
      }
    };

    const ctx = gsap.context(() => {
      gsap.set(lanes, { x: startX });
      paint(0);

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
            paint(self.progress);
          },
          onToggle: (self) => ruleRef.current?.setActive(self.isActive),
        },
      });

      tl.fromTo(lanes, { x: startX }, { x: endX, ease: "none", duration: 1 }, 0);
    }, section);

    return () => ctx.revert();
  }, [stacked, blocks]);

  // ── Mobile / reduced motion: full image above stacked captions ──
  if (stacked) {
    return (
      <section id={id} className="relative w-full" style={{ background: bg }} aria-label={label}>
        {/* eslint-disable-next-line @next/next/no-img-element -- full world canvas */}
        <img src={image} alt="" className="block h-auto w-full select-none" draggable={false} />
        <div className="flex flex-col gap-12 px-7 py-16">
          {blocks.map((b, i) => (
            <Caption key={i} b={b} tone={tone} total={blocks.length} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative h-screen w-full overflow-hidden"
      style={{ background: bg }}
      aria-label={label}
    >
      {/* Image lane — the panned canvas. */}
      <div
        ref={trackRef}
        className="absolute inset-y-0 left-0 z-0 h-full will-change-transform"
        style={{ width: `${zoomW}vw` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- single panned canvas */}
        <img
          src={image}
          alt=""
          draggable={false}
          className="pointer-events-none absolute left-0 top-1/2 h-auto w-full max-w-none -translate-y-1/2 select-none"
          style={{ WebkitMaskImage: EDGE_FEATHER, maskImage: EDGE_FEATHER }}
        />
      </div>

      {/* Screen-fixed blend — feathers the viewport edges into the world bg so
          the centred object reads with more space; sits under the captions. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: `radial-gradient(72% 110% at 50% 50%, rgba(0,0,0,0) 52%, ${bg} 100%)`,
        }}
      />

      {/* Caption lane — panned in lock-step with the image (so each caption stays
          glued to its object) but layered above the blend. One legible at a time. */}
      <div
        ref={capTrackRef}
        className="pointer-events-none absolute inset-y-0 left-0 z-20 h-full will-change-transform"
        style={{ width: `${zoomW}vw` }}
      >
        {blocks.map((b, i) => (
          <div
            key={i}
            ref={(el) => {
              capRefs.current[i] = el;
            }}
            className="absolute w-[min(27rem,30vw)] will-change-[opacity,filter]"
            style={{ left: b.left, ...b.v, opacity: 0 }}
          >
            <Caption b={b} tone={tone} total={blocks.length} />
          </div>
        ))}
      </div>

      <RunwayRule
        ref={ruleRef}
        total={blocks.length}
        label={label}
        placement={rulePlacement}
        tone={tone}
      />
    </section>
  );
}
