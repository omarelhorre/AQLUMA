"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fr } from "@/lib/typo";
import RunwayRule, { type RunwayRuleHandle } from "./RunwayRule";

// Layout effect on the client (runs before paint), plain effect on the server
// (where useLayoutEffect only warns). Resolves the viewport BEFORE the pinning
// passive-effect runs, so a phone/tablet/reduced-motion visitor renders the
// static carousel and the pin is never created — never reconciling a flipped
// structure against a GSAP-moved node (the removeChild blank-page crash).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
 * Mobile / tablet / reduced motion: a swipeable scroll-snap carousel, one object
 * per slide (the flat-lay cropped to each object via its `fx` anchor).
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
  /** Hero treatment: a wider block with larger type, for a caption that sits in a
   *  big open negative space and should dominate the frame. */
  wide?: boolean;
  /** Optional override for the note's max-width (e.g. "max-w-[50ch]") so a caption
   *  can read on fewer lines when its pocket is wide enough. */
  noteClass?: string;
  /** Horizontal alignment of the caption block. Default "left" (text sits to the
   *  right of its object). "center" centres the block over an isolated object. */
  align?: "left" | "center";
  /** Override the caption block's width (e.g. "w-[min(96rem,88vw)]") — useful for a
   *  wall-spanning caption whose paragraph should read on fewer lines. */
  widthClass?: string;
  /** Override the title's responsive font-size classes for a single block. */
  titleClass?: string;
  /** Dedicated image for the MOBILE/TABLET carousel slide. When set, the slide shows
   *  this picture (centred, object-cover) instead of cropping the wide panorama via
   *  `fx`. The desktop pan always uses the shared panorama. */
  img?: string;
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
  /** Inner transparent radius (%) of the edge blend. Lower = the image melts into
   *  the world bg sooner (more background showing around the scene). */
  frameBlend?: number;
  /** Fade a caption OUT (opacity + blur) as its object leaves the centre. When false
   *  each caption still fades IN as its object arrives, then stays fully solid and
   *  simply slides off the edge with the wall instead of fading away. */
  fadeOut?: boolean;
  /** Extra scroll held at the END of the pan, as a fraction of the pan distance.
   *  The last object stays centred and pinned (caption solid) for this stretch
   *  before the section unpins — so the final frame can be read without the next
   *  section pulling in. 0 = hand off immediately (default). */
  endHold?: number;
  /** Which fraction of the image HEIGHT sits at the viewport's vertical centre.
   *  0.5 centres the photo itself (default). Lower values pull the image DOWN so a
   *  band high in the photo (e.g. objects hung from a wire near the top) lands at
   *  centre instead of riding high with empty wall beneath. */
  focusY?: number;
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
  "linear-gradient(to right, transparent 0, #000 1.6%, #000 98.4%, transparent 100%)";

function Caption({
  b,
  tone,
  total,
  compact = false,
}: {
  b: GalleryBlock;
  tone: "dark" | "light";
  total: number;
  /** Phone-card sizing for the mobile carousel (smaller type, full-width note). */
  compact?: boolean;
}) {
  const light = tone === "light";
  const titleC = light ? "text-ink" : "text-cream";
  const bodyC = light ? "text-ink/85" : "text-cream/75";
  const mutedC = light ? "text-ink/45" : "text-cream/45";
  const wide = b.wide;
  // `align: "center"` is a desktop-pan treatment (a caption owning a wide stretch
  // of wall). In the compact carousel every card is the same width, so centring
  // one note while the others read left looks inconsistent — force left there.
  const center = !compact && b.align === "center";

  return (
    <div className={`relative ${center ? "flex flex-col items-center text-center" : ""}`}>
      <span className="mb-4 flex items-center gap-3">
        <span className={`font-satoshi text-[12px] font-medium tabular-nums tracking-tight ${mutedC}`}>
          {`${String(b.n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
        </span>
        <span
          className={`h-px ${wide ? "w-16" : "w-12"}`}
          style={{
            background: light
              ? "linear-gradient(90deg, rgba(15,20,23,0.5), rgba(15,20,23,0))"
              : "linear-gradient(90deg, rgba(247,244,239,0.55), rgba(247,244,239,0))",
          }}
        />
      </span>
      <h2
        className={`font-didot leading-[1.08] tracking-[-0.02em] ${titleC} ${
          compact
            ? "text-[clamp(1.9rem,6.4vw,2.5rem)]"
            : b.titleClass ??
              (wide ? "text-[clamp(2.8rem,4.6vw,5.4rem)]" : "text-[clamp(2.6rem,4.4vw,4.9rem)]")
        }`}
      >
        {fr(b.title)}
      </h2>
      <p
        className={`font-satoshi leading-relaxed ${bodyC} ${
          compact
            ? "mt-3 max-w-none text-[clamp(1rem,3.6vw,1.18rem)]"
            : `${
                wide
                  ? "mt-6 text-[clamp(1.15rem,1.55vw,1.72rem)]"
                  : "mt-5 text-[clamp(1.1rem,1.5vw,1.55rem)]"
              } ${b.noteClass ?? (wide ? "max-w-[34ch]" : "max-w-[28ch]")}`
        }`}
      >
        {fr(b.note)}
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
  rulePlacement = "bottom",
  frameBlend = 52,
  fadeOut = true,
  endHold = 0,
  focusY = 0.5,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const panRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const capTrackRef = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRef = useRef<RunwayRuleHandle>(null);

  // `stacked` decides which presentation is VISIBLE (carousel vs pan) and whether
  // the GSAP pin is created — but BOTH are always mounted (see render), so flipping
  // it only toggles `display` and never adds/removes the pinned subtree. That is
  // what makes this crash-proof: React 19 unmounts a conditionally-rendered branch
  // BEFORE the effect cleanup can revert GSAP, so it tears down DOM that the pin
  // has reparented → `removeChild`/`insertBefore` blank page (in prod too, not just
  // dev StrictMode). Keeping the pan permanently mounted sidesteps that entirely.
  const [stacked, setStacked] = useState(false);

  useIsoLayoutEffect(() => {
    const mqWidth = window.matchMedia("(min-width: 1024px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setStacked(!mqWidth.matches || mqMotion.matches);
    apply();
    mqWidth.addEventListener("change", apply);
    mqMotion.addEventListener("change", apply);
    return () => {
      mqWidth.removeEventListener("change", apply);
      mqMotion.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    // Authoritative viewport check, read synchronously at run time. The `stacked`
    // STATE drives which branch is visible, but this passive effect can run with a
    // stale closure (render-1 `stacked=false`) before the resolving layout effect's
    // update commits — which would create the pin on a phone and leave a stale
    // pin-spacer over the carousel. Re-reading matchMedia here means the pin is
    // never created below 1024px / under reduced motion, whatever React's timing.
    if (stacked) return;
    if (
      !window.matchMedia("(min-width: 1024px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const pan = panRef.current;
    const track = trackRef.current;
    if (!pan || !track) return;

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
    const panDist = () => Math.abs(startX() - endX());
    // Total scroll = the pan + a held tail (endHold × pan). The pan completes over
    // the first `panFrac` of that range; the tail keeps the last frame pinned.
    const distance = () => panDist() * (1 + endHold);
    const panFrac = 1 / (1 + endHold);

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
        // Fade OUT as the next object takes over — skipped when fadeOut=false, so the
        // caption holds at full strength and slides off the edge with the wall instead.
        if (fadeOut && i < last)
          op *= 1 - clamp01((p - (bound(ats[i], ats[i + 1]) - FADE)) / (2 * FADE));
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
          trigger: pan,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Remap so the pan reaches its end at `panFrac`; the tail holds at 1.
            const pp = clamp01(self.progress / panFrac);
            ruleRef.current?.setProgress(pp);
            paint(pp);
          },
          onToggle: (self) => ruleRef.current?.setActive(self.isActive),
        },
      });

      tl.fromTo(lanes, { x: startX }, { x: endX, ease: "none", duration: 1 }, 0);
      // Held tail: the lanes stay at endX while this empty stretch of scroll plays,
      // keeping the last object centred and pinned before the section hands off.
      if (endHold > 0) tl.to(lanes, { x: endX, duration: endHold });
    }, pan);

    return () => ctx.revert();
  }, [stacked, blocks, fadeOut, endHold]);

  // Both presentations are ALWAYS mounted — only `display` toggles between them —
  // so the GSAP-pinned pan subtree is never added/removed by React (no removeChild
  // crash). The pin is created only while the pan is the visible branch.
  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative w-full"
      style={{ background: bg }}
      aria-label={label}
    >
      {/* ── DESKTOP PAN (≥1024px, motion allowed) ── */}
      <div
        ref={panRef}
        className="relative h-screen w-full overflow-hidden"
        style={{ display: stacked ? "none" : "block" }}
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
            className="pointer-events-none absolute left-0 top-1/2 h-auto w-full max-w-none select-none"
            style={{
              transform: `translateY(${-focusY * 100}%)`,
              WebkitMaskImage: EDGE_FEATHER,
              maskImage: EDGE_FEATHER,
            }}
          />
        </div>

        {/* Screen-fixed blend — feathers the viewport edges into the world bg so
            the centred object reads with more space; sits under the captions. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `radial-gradient(88% 155% at 50% 50%, rgba(0,0,0,0) ${frameBlend}%, ${bg} 100%)`,
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
              className={`absolute will-change-[opacity,filter] ${
                b.widthClass ?? (b.wide ? "w-[min(42rem,46vw)]" : "w-[min(27rem,30vw)]")
              }`}
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
      </div>

      {/* ── MOBILE / TABLET / REDUCED MOTION — swipeable carousel ── */}
      <div style={{ display: stacked ? "block" : "none" }}>
        <WorldCarousel
          label={label}
          image={image}
          tone={tone}
          blocks={blocks}
        />
      </div>
    </section>
  );
}

// Mobile / tablet presentation of a world: a native horizontal scroll-snap
// carousel. One slide per object — the wide flat-lay is cropped to that object via
// its `fx` anchor (object-position) — caption beneath, a peek of the next slide to
// invite the swipe. No GSAP, no pin: robust on touch and safe under reduced motion.
function WorldCarousel({
  label,
  image,
  tone,
  blocks,
}: {
  label: string;
  image: string;
  tone: "dark" | "light";
  blocks: GalleryBlock[];
}) {
  const light = tone === "light";
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // Track the centred slide for the dot indicator.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = slideRefs.current.indexOf(e.target as HTMLElement);
            if (i >= 0) setActive(i);
          }
        }
      },
      { root: track, threshold: 0.6 },
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [blocks.length]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const el = slideRefs.current[i];
    if (!track || !el) return;
    track.scrollTo({
      left: el.offsetLeft - (track.clientWidth - el.clientWidth) / 2,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full overflow-hidden py-14">
      <div className="mb-6 flex items-baseline justify-between px-6">
        <span
          className={`font-satoshi text-[11px] font-medium uppercase tracking-[0.2em] ${
            light ? "text-ink/55" : "text-cream/55"
          }`}
        >
          {label}
        </span>
        <span
          className={`font-satoshi text-[11px] ${light ? "text-ink/40" : "text-cream/40"}`}
          aria-hidden
        >
          Glissez&nbsp;→
        </span>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {blocks.map((b, i) => (
          <article
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="w-[86%] shrink-0 snap-center sm:w-[23rem]"
          >
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.25rem]"
              style={{
                boxShadow: light
                  ? "inset 0 0 0 1px rgba(15,20,23,0.08)"
                  : "inset 0 0 0 1px rgba(247,244,239,0.08)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- flat-lay crop */}
              <img
                src={b.img ?? image}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full select-none object-cover"
                style={{ objectPosition: b.img ? "50% 50%" : `${b.fx * 100}% 50%` }}
              />
            </div>
            <div className="mt-5 px-0.5">
              <Caption b={b} tone={tone} total={blocks.length} compact />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5">
        {blocks.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Aller à l’objet ${i + 1} sur ${blocks.length}`}
            className="flex h-10 w-6 items-center justify-center"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? `w-6 ${light ? "bg-ink/80" : "bg-cream/85"}`
                  : `w-1.5 ${light ? "bg-ink/25" : "bg-cream/30"}`
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
