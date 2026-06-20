"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import RunwayRule, { type RunwayRuleHandle } from "./RunwayRule";

/**
 * ACT II — Le Briefing runway (master-canvas pan).
 *
 * One ultra-wide master image (a single continuous terracotta desk with five
 * object setups) is treated like a cinema camera panning left→right. A single
 * pinned ScrollTrigger converts vertical scroll into the horizontal pan; the
 * five copy beats fade/slide in as the camera reaches each setup, then fall
 * away into shadow. The architect's measuring rule tracks position.
 *
 * The master asset lives at /worlds/briefing/master-desk-canvas.jpg. Until it
 * exists, a terracotta fallback strip + labelled setup markers keep the pan
 * and copy working so the section is fully testable.
 *
 * Responsive / reduced motion: no pin/pan. The five beats stack vertically and
 * read as normal scrolling copy (parents can read calmly on a phone).
 */

const MASTER_SRC = "/worlds/briefing/master-desk-canvas.jpg";

type Setup = { header: string; body: string };

// EDIT freely — sequenced left→right along the master canvas.
const SETUPS: Setup[] = [
  {
    header: "Le problème n’est pas l’IA.",
    body: "Le problème, c’est ce qu’on en fait sans méthode.",
  },
  {
    header: "Votre ado croise déjà l’IA.",
    body: "La vraie question n’est pas s’il la croise, c’est comment.",
  },
  {
    header: "L’outil gratuit donne des réponses.",
    body: "Il ne donne pas la méthode.",
  },
  {
    header: "Est-ce que l’IA, c’est tricher ?",
    body: "La ligne ne passe pas par l’outil. Elle passe par ce qui reste dans la tête.",
  },
  {
    header: "Le Briefing AQLUMA.",
    body: "15 élèves maximum. Une méthode d’usage calme et durable.",
  },
];

const TERRACOTTA = "#8B3A1A";

// The master is a 16:9 frame, so to get a real horizontal pan it's zoomed in:
// the canvas is ZOOM viewport-widths wide (the empty terracotta top/bottom is
// cropped; the objects live in the safe centre band). Higher = more pan + more
// crop. This is the single tuning knob for the pan's length.
const ZOOM = 2.1;

export default function ActWorlds() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const beatsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRef = useRef<RunwayRuleHandle>(null);

  const reduced = useReducedMotion();
  const [narrow, setNarrow] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Horizontal panning is only worth it on a real pointer + wide viewport.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const stacked = reduced || narrow;

  // If the image is already cached/complete before React attaches onLoad, the
  // load event never fires — detect that here so it isn't stuck hidden.
  useEffect(() => {
    if (stacked) return;
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, [stacked]);

  useEffect(() => {
    if (stacked) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    const beats = beatsRef.current.filter(Boolean) as HTMLDivElement[];
    const total = SETUPS.length;
    // CSS-deterministic (track width is ZOOM * 100vw), so the pan is correct
    // even before the image's natural size is known.
    const distance = () => Math.max(0, track.offsetWidth - window.innerWidth);

    const ctx = gsap.context(() => {
      gsap.set(beats, { opacity: 0, y: 30 });

      // ONE ScrollTrigger owns the pin; the timeline rides it (scrub: 1 gives
      // the panning that premium, weighted lag).
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

      // The pan spans `total` time-units, so setup i is centred at time i + 0.5.
      tl.to(track, { x: () => -distance(), ease: "none", duration: total }, 0);

      // Copy beats: rise in as the camera reaches each setup, then fall away.
      beats.forEach((beat, i) => {
        const c = i + 0.5;
        tl.fromTo(
          beat,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, ease: "power3.out", duration: 0.35 },
          c - 0.5
        ).to(
          beat,
          { opacity: 0, y: -24, ease: "power2.in", duration: 0.35 },
          c + 0.15
        );
      });
    }, section);

    return () => ctx.revert();
  }, [stacked]);

  // Recompute the pan distance once the master image's real width is known.
  const onImgLoad = () => {
    setLoaded(true);
    if (!stacked) ScrollTrigger.refresh();
  };

  // ── Reduced motion / narrow: vertical stack, native scroll ──
  if (stacked) {
    return (
      <section
        ref={sectionRef}
        id="mondes"
        className="relative w-full"
        style={{ backgroundColor: TERRACOTTA }}
        aria-label="AQLUMA, Le Briefing"
      >
        {SETUPS.map((s, i) => (
          <div
            key={i}
            className="flex min-h-[68vh] flex-col justify-center gap-4 px-7 py-16"
          >
            <span className="font-satoshi text-[11px] tabular-nums tracking-tight text-cream/40">
              {String(i + 1).padStart(2, "0")} / {String(SETUPS.length).padStart(2, "0")}
            </span>
            <h2 className="max-w-[18ch] font-didot text-[clamp(2rem,8vw,3rem)] leading-[1.08] tracking-display text-cream">
              {s.header}
            </h2>
            <p className="max-w-[42ch] font-satoshi text-[15px] leading-relaxed text-cream/70">
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
      id="mondes"
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: TERRACOTTA }}
      aria-label="AQLUMA, Le Briefing"
    >
      {/* The panning master canvas. The track defines a fallback width so the
          pan works before the real asset is dropped in. */}
      <div
        ref={trackRef}
        className="absolute left-0 top-0 h-screen will-change-transform"
        style={{ width: `${ZOOM * 100}vw` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- intrinsic-width
            panned canvas; next/image's layout fill doesn't fit a measured pan. */}
        <img
          ref={imgRef}
          src={MASTER_SRC}
          alt=""
          onLoad={onImgLoad}
          style={{ opacity: loaded ? 1 : 0 }}
          className="pointer-events-none absolute left-0 top-1/2 h-auto w-full -translate-y-1/2 select-none transition-opacity duration-700"
          draggable={false}
        />

        {/* Pre-asset setup markers (hidden once the image loads). */}
        {!loaded &&
          SETUPS.map((s, i) => (
            <div
              key={i}
              aria-hidden
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 text-center"
              style={{ left: `${((i + 0.5) / SETUPS.length) * 100}%` }}
            >
              <span className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-cream/20 font-satoshi text-[11px] text-cream/40">
                Setup {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
      </div>

      {/* Legibility scrim under the copy zone (lower-left). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(105deg, rgba(8,10,12,0.62) 0%, rgba(8,10,12,0.28) 34%, rgba(8,10,12,0) 62%), linear-gradient(0deg, rgba(8,10,12,0.5) 0%, rgba(8,10,12,0) 40%)",
        }}
      />

      {/* Copy beats — overlaid, anchored lower-left, one visible at a time. */}
      <div className="pointer-events-none absolute bottom-[16vh] left-[7vw] z-20">
        <div className="relative h-[40vh] w-[34rem] max-w-[80vw]">
          {SETUPS.map((s, i) => (
            <div
              key={i}
              ref={(el) => {
                beatsRef.current[i] = el;
              }}
              className="absolute bottom-0 left-0 will-change-[transform,opacity]"
            >
              <h2 className="max-w-[20ch] font-didot text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.06] tracking-display text-cream">
                {s.header}
              </h2>
              <p className="mt-5 max-w-[36ch] font-satoshi text-[clamp(0.95rem,1.2vw,1.1rem)] leading-relaxed text-cream/75">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress — architect's measuring rule (fades in while pinned). */}
      <RunwayRule ref={ruleRef} total={SETUPS.length} label="Le Briefing" />
    </section>
  );
}
