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
import { WORLDS, type World } from "@/lib/worldsData";
import StatementPanel, { type StatementHandle } from "./worlds/StatementPanel";
import ClipCard from "./worlds/ClipCard";
import VideoLightbox from "./worlds/VideoLightbox";
import { Caption, WorldCarousel } from "./worlds/WorldCarousel";
import RunwayRule, { type RunwayRuleHandle } from "./RunwayRule";

/**
 * LES TROIS MONDES — one pinned horizontal ribbon, paced like a camera move.
 *
 * Each world is a run of beats laid left→right on one long track:
 *   [opening beat — statement copy (left) + clip card (right), side by side] ·
 *   [intro text] · [panorama gallery with glued captions] · world gap
 *
 * Vertical scroll no longer maps 1:1 to a flat slide. A ScrollTrigger scrub
 * drives a schedule of eased MOVES between named stops (each opening beat, each
 * gallery centre) separated by HOLD dwells — so the camera decelerates onto a
 * subject, rests while you read, then glides on. One canvas colour holds each
 * world's wall solid and cross-fades only in the gap between worlds (terracotta →
 * void → paper); the panorama edges are feathered + vignetted so every image
 * melts into the current wall. The clip card is a bordered, framed element beside
 * the copy — click it to watch the clip full-screen (VideoLightbox).
 *
 * Both the pinned ribbon and a stacked mobile/reduced-motion fallback are ALWAYS
 * mounted; only `display` toggles, and the pin is created only for the ribbon —
 * so React never adds/removes the GSAP-pinned subtree (the removeChild crash).
 */

// Layout effect on the client (before paint), plain effect on the server. Resolves
// the viewport BEFORE the pinning passive-effect runs, so a phone/tablet/reduced-
// motion visitor renders the stacked fallback and the pin is never created.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ── Beat spacing (viewport-widths) — the ribbon's rhythm lives here ──
const GAP_STMT_INTRO = 14; // breath between the opening beat and the intro
const INTRO_VW = 52; // intro buffer panel
const GAP_WORLD = 50; // approach/exit space between one world and the next

// Feather the panorama's far left/right edges into transparency so it dissolves
// into the canvas at each seam (no hard vertical edge against the flat beats).
const EDGE_FEATHER =
  "linear-gradient(to right, transparent 0, #000 3%, #000 97%, transparent 100%)";

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
// smootherstep (quintic) — gentler ends than smoothstep, for a soft colour dissolve
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// power2.inOut — decelerate onto a stop, accelerate away from it.
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
const RGBS = WORLDS.map((w) => hexToRgb(w.bg));
const RGB0 = `${RGBS[0][0]} ${RGBS[0][1]} ${RGBS[0][2]}`;

// Colour of the clip card's thick hover border, chosen per world to pop against
// its wall: white on terracotta (Briefing), gold on the void (Musée), ink on
// paper (Studio).
const CLIP_HOVER: Record<string, string> = {
  briefing: "#F7F4EF",
  musee: "#E8B23A",
  studio: "#1A1714",
};

type Span = { l: number; r: number; c: number };
type Seg = { d: number; a: number; b: number; io: boolean };
type Cap = { el: HTMLElement; c: number }; // caption element + its focus centre (track px)
type Geo = {
  innerW: number;
  stmts: Span[];
  galls: Span[];
  ranges: { s: number; e: number }[]; // solid-colour range per world
  caps: Cap[]; // every gallery caption, for the distance-fade
  segs: Seg[];
  total: number; // schedule length in px (== pin scroll length)
};

// ── Intro buffer panel — the world's opening writing on the flat canvas ──
function IntroPanel({ world, stacked = false }: { world: World; stacked?: boolean }) {
  const light = world.tone === "light";
  const kicker = (
    <p
      className={`mb-7 font-satoshi text-[0.9rem] font-bold tracking-tight ${
        light ? "text-clay" : "text-gold"
      }`}
    >
      {fr(world.intro.kicker)}
    </p>
  );
  const body = (
    <p
      className={`max-w-[26ch] text-balance font-didot text-[clamp(1.7rem,3.6vw,3.1rem)] font-normal leading-[1.16] tracking-[-0.015em] ${
        light ? "text-ink" : "text-cream"
      }`}
    >
      {fr(world.intro.text)}
    </p>
  );

  if (stacked) {
    return (
      <div className="px-6 pb-2 pt-8 text-left">
        {kicker}
        {body}
      </div>
    );
  }
  return (
    <div className="relative flex h-full w-full items-center">
      <div className="w-full px-[min(8vw,6rem)] text-left md:w-[80%]">
        {kicker}
        {body}
      </div>
    </div>
  );
}

// ── Gallery panel — the panned panorama with persistent, glued captions ──
// The panorama IMAGE is clipped to the panel; the captions live in a sibling
// layer that is NOT clipped, so a caption can sit in the negative space beside
// the panorama (in the world gap) instead of overlapping a busy photo.
function GalleryPanel({
  world,
  capRef,
}: {
  world: World;
  /** Register each caption wrapper so the ribbon can drive its distance-fade. */
  capRef?: (i: number, el: HTMLDivElement | null) => void;
}) {
  const focusY = world.focusY ?? 0.5;
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- single panned canvas */}
        <img
          src={world.image}
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
      {world.blocks.map((b, i) => {
        // A centred caption is glued directly ABOVE its object: anchor it by its
        // own centre on the object's `fx`, so the copy sits square over the
        // pedestal instead of being offset to one side. Side captions keep their
        // hand-placed `left` anchor in the negative space.
        const centered = b.align === "center";
        return (
          <div
            key={i}
            ref={(el) => capRef?.(i, el)}
            className={`absolute z-10 ${
              b.widthClass ?? (b.wide ? "w-[min(42rem,46vw)]" : "w-[min(27rem,30vw)]")
            }`}
            style={{
              left: centered ? `${b.fx * 100}%` : b.left,
              ...(centered ? { transform: "translateX(-50%)" } : null),
              ...b.v,
            }}
          >
            <Caption b={b} tone={world.tone} total={world.blocks.length} />
          </div>
        );
      })}
    </div>
  );
}

export default function WorldsRibbon() {
  const sectionRef = useRef<HTMLElement>(null);
  const panRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<RunwayRuleHandle>(null);
  const stmtWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gallWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statementRefs = useRef<(StatementHandle | null)[]>([]);
  const clipRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[][]>([]);

  const [stacked, setStacked] = useState(false);
  const [activeWorld, setActiveWorld] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

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
    // The stacked STATE drives which branch is visible; re-read matchMedia here so
    // the pin is never created below 1024px / under reduced motion, whatever the
    // React timing — keeps the pinned subtree crash-safe.
    if (stacked) return;
    if (
      !window.matchMedia("(min-width: 1024px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const pan = panRef.current;
    const track = trackRef.current;
    if (!pan || !track) return;
    const stmtEls = stmtWrapRefs.current;
    const gallEls = gallWrapRefs.current;
    if (stmtEls.length < WORLDS.length || gallEls.length < WORLDS.length) return;
    if (stmtEls.some((e) => !e) || gallEls.some((e) => !e)) return;

    gsap.registerPlugin(ScrollTrigger);

    // Absolute left of an element ALONG the track: sum offsetLeft up the
    // offsetParent chain to the track. (Each world group is `position: relative`,
    // so a child's own offsetLeft is group-relative — reading it directly is the
    // bug that used to lock every world to the same coordinates.)
    const absLeft = (el: HTMLElement): number => {
      let x = 0;
      let n: HTMLElement | null = el;
      while (n && n !== track) {
        x += n.offsetLeft;
        n = n.offsetParent as HTMLElement | null;
      }
      return x;
    };
    const span = (el: HTMLElement): Span => {
      const l = absLeft(el);
      const w = el.offsetWidth;
      return { l, r: l + w, c: l + w / 2 };
    };

    const measure = (): Geo => {
      const innerW = window.innerWidth;
      const stmts = stmtEls.map((e) => span(e!));
      const galls = gallEls.map((e) => span(e!));
      const ranges = stmts.map((s, i) => ({ s: s.l, e: galls[i].r }));

      // Focus centre (track px) of every caption, for the distance-fade. A centred
      // caption fades around the object it sits over (its `fx`); a side caption
      // fades around its own measured centre.
      const caps: Cap[] = [];
      for (let w = 0; w < WORLDS.length; w++) {
        const gw = galls[w].r - galls[w].l;
        WORLDS[w].blocks.forEach((b, i) => {
          const el = captionRefs.current[w]?.[i];
          if (!el) return;
          const c = b.align === "center" ? galls[w].l + b.fx * gw : span(el).c;
          caps.push({ el, c });
        });
      }

      // Stops the camera visits, in order: each world's opening beat, then its
      // gallery centre.
      const xOf = (c: number) => -(c - innerW / 2);
      const xs: number[] = [];
      for (let i = 0; i < stmts.length; i++) {
        xs.push(xOf(stmts[i].c));
        xs.push(xOf(galls[i].c));
      }
      // For every gallery EXCEPT the last, the move to the next world's beat pans
      // the gallery's right half (and its final object) into view. The last
      // gallery has no such follow-on, so its last object would stay cut at the
      // section's close — add a stop that centres it before the pin releases.
      const lastW = WORLDS.length - 1;
      const lastBlocks = WORLDS[lastW].blocks;
      const lastFx = lastBlocks[lastBlocks.length - 1].fx;
      const lg = galls[lastW];
      // Frame the last object AND its caption (which sits in the wall to its
      // right); bias the centre slightly right, clamped so we never pan past the
      // end of the track.
      const maxReach = track.offsetWidth - innerW / 2;
      const finalCx = Math.min(lg.l + (lastFx + 0.08) * (lg.r - lg.l), maxReach);
      xs.push(xOf(finalCx));

      const READ = Math.round(innerW * 0.5); // dwell to read the opening beat
      const LOOK = Math.round(innerW * 0.22); // dwell on a gallery centre
      const segs: Seg[] = [];
      // Open on the first beat, already centred — hold to read.
      segs.push({ d: READ, a: xs[0], b: xs[0], io: false });
      for (let i = 1; i < xs.length; i++) {
        segs.push({ d: Math.abs(xs[i] - xs[i - 1]), a: xs[i - 1], b: xs[i], io: true });
        const isStmt = i % 2 === 0; // even index → an opening-beat stop
        segs.push({ d: isStmt ? READ : LOOK, a: xs[i], b: xs[i], io: false });
      }
      const total = segs.reduce((sum, s) => sum + s.d, 0);
      return { innerW, stmts, galls, ranges, caps, segs, total };
    };

    let geo = measure();
    const playing = new Array(WORLDS.length).fill(false);
    let tl: gsap.core.Timeline | undefined;
    const proxy = { p: 0 };

    // Map linear scrub progress (0..1) → track x through the eased schedule.
    const progressToX = (p: number): number => {
      const t = clamp01(p) * geo.total;
      let acc = 0;
      const segs = geo.segs;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        if (t <= acc + s.d || i === segs.length - 1) {
          const lt = s.d > 0 ? clamp01((t - acc) / s.d) : 1;
          return lerp(s.a, s.b, s.io ? easeInOut(lt) : lt);
        }
        acc += s.d;
      }
      return segs[segs.length - 1].b;
    };

    // Solid world wall that cross-fades between two worlds over a LONG, gentle
    // dissolve — the transition starts inside the outgoing gallery's tail and
    // finishes inside the incoming beat, so the colour change is spread across
    // ~1.2 viewports instead of snapping across the narrow gap.
    const applyBg = (cx: number) => {
      const r = geo.ranges;
      const n = r.length;
      const pad = geo.innerW * 0.4; // reach beyond the gap into both neighbours
      let rgb: number[] | null = null;
      for (let w = 0; w < n - 1; w++) {
        const bStart = r[w].e - pad;
        const bEnd = r[w + 1].s + pad;
        if (cx >= bStart && cx <= bEnd) {
          const t = smoother(clamp01((cx - bStart) / (bEnd - bStart)));
          rgb = [
            lerp(RGBS[w][0], RGBS[w + 1][0], t),
            lerp(RGBS[w][1], RGBS[w + 1][1], t),
            lerp(RGBS[w][2], RGBS[w + 1][2], t),
          ];
          break;
        }
      }
      if (!rgb) {
        let idx = 0;
        for (let w = 0; w < n; w++) if (cx >= r[w].s) idx = w;
        rgb = RGBS[idx];
      }
      pan.style.setProperty("--worlds-bg", `${rgb[0] | 0} ${rgb[1] | 0} ${rgb[2] | 0}`);
    };

    // The vignette (which melts the panorama edges into the canvas) is only wanted
    // over a gallery — fade it out across the flat opening/intro beats.
    const applyVignette = (cx: number) => {
      let op = 0;
      for (const g of geo.galls) {
        const d = cx < g.l ? g.l - cx : cx > g.r ? cx - g.r : 0;
        op = Math.max(op, clamp01(1 - d / (geo.innerW * 0.5)));
      }
      if (vignetteRef.current) vignetteRef.current.style.opacity = String(op);
    };

    // Write each statement on as the camera closes the last viewport-width onto
    // its opening beat; it holds full through the reading dwell.
    const applyStatements = (cx: number) => {
      for (let w = 0; w < geo.stmts.length; w++) {
        const s = geo.stmts[w];
        const start = s.c - geo.innerW * 0.92;
        const g = clamp01((cx - start) / Math.max(1, s.c - start));
        statementRefs.current[w]?.setFill(g);
      }
    };

    // Only the caption you're centred on stays lit. Its neighbours — the next /
    // previous paragraph bleeding in from the panorama's edges — fade out as they
    // leave the centre, so a gallery never crowds the frame with two or three
    // paragraphs at once. Two adjacent captions cross-fade (~half each) at the
    // midpoint between their objects, then the outgoing one is fully gone well
    // before its neighbour's object reaches centre.
    const applyCaptions = (cx: number) => {
      const hold = geo.innerW * 0.33; // full while the caption owns the frame
      const fade = geo.innerW * 0.19; // then a quick dissolve as it leaves centre
      for (const cap of geo.caps) {
        const dist = Math.abs(cap.c - cx);
        cap.el.style.opacity = String(clamp01(1 - (dist - hold) / fade));
      }
    };

    // Play each clip only while its opening beat is near the viewport centre.
    const applyClips = (cx: number) => {
      for (let w = 0; w < geo.stmts.length; w++) {
        const play = Math.abs(cx - geo.stmts[w].c) < geo.innerW * 0.6;
        if (play !== playing[w]) {
          playing[w] = play;
          const v = clipRefs.current[w];
          if (v) {
            if (play) void v.play().catch(() => {});
            else v.pause();
          }
        }
      }
    };

    let lastWorld = -1;
    const applyActiveWorld = (cx: number) => {
      let aw = 0;
      for (let w = 0; w < geo.stmts.length; w++) if (cx >= geo.stmts[w].l) aw = w;
      if (aw !== lastWorld) {
        lastWorld = aw;
        setActiveWorld(aw);
      }
    };

    const render = () => {
      const x = progressToX(proxy.p);
      gsap.set(track, { x });
      const cx = -x + geo.innerW / 2;
      applyBg(cx);
      applyVignette(cx);
      applyStatements(cx);
      applyCaptions(cx);
      applyClips(cx);
      applyActiveWorld(cx);
      ruleRef.current?.setProgress(proxy.p);
    };

    const ctx = gsap.context(() => {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: pan,
          start: "top top",
          end: () => "+=" + geo.total,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            geo = measure();
          },
          onRefresh: () => render(),
          onToggle: (self) => ruleRef.current?.setActive(self.isActive),
        },
      });
      // The scrub smooths this proxy 0→1; render() reshapes it into the eased,
      // dwelling camera move each tick.
      tl.to(proxy, { p: 1, ease: "none", onUpdate: render }, 0);
      render();
    }, pan);

    return () => ctx.revert();
  }, [stacked]);

  const active = WORLDS[activeWorld];

  return (
    <section ref={sectionRef} id="worlds" className="relative w-full" aria-label="Les trois mondes">
      {/* ── DESKTOP RIBBON (≥1024px, motion allowed) ── */}
      <div
        ref={panRef}
        className="relative h-screen w-full overflow-hidden"
        style={
          {
            display: stacked ? "none" : "block",
            background: "rgb(var(--worlds-bg))",
            ["--worlds-bg" as string]: RGB0,
          } as CSSProperties
        }
      >
        {/* The translating ribbon — opening beats, intros, galleries. */}
        <div
          ref={trackRef}
          className="absolute inset-y-0 left-0 z-10 flex h-full w-max will-change-transform"
        >
          {WORLDS.map((world, w) => (
            <div key={world.id} className="relative flex h-full">
              {/* Opening beat — statement copy (left) + clip card (right) */}
              <div
                ref={(el) => {
                  stmtWrapRefs.current[w] = el;
                }}
                id={stacked ? undefined : world.id}
                className="relative h-full w-screen shrink-0"
              >
                <div className="flex h-full w-full items-center gap-[clamp(2rem,5vw,6rem)] px-[min(8vw,7rem)]">
                  <div className="min-w-0 flex-1">
                    <StatementPanel
                      ref={(el) => {
                        statementRefs.current[w] = el;
                      }}
                      s={world.statement}
                    />
                  </div>
                  <div className="w-[44%] max-w-[44rem] shrink-0">
                    <ClipCard
                      ref={(el) => {
                        clipRefs.current[w] = el;
                      }}
                      video={world.statement.video}
                      tone={world.tone}
                      hoverBorder={CLIP_HOVER[world.id]}
                      onOpen={() => setLightbox(world.statement.video.src)}
                    />
                  </div>
                </div>
              </div>
              {/* Breath before the intro */}
              <div className="relative h-full shrink-0" style={{ width: `${GAP_STMT_INTRO}vw` }} />
              {/* Intro buffer */}
              <div className="relative h-full shrink-0" style={{ width: `${INTRO_VW}vw` }}>
                <IntroPanel world={world} />
              </div>
              {/* Gallery */}
              <div
                ref={(el) => {
                  gallWrapRefs.current[w] = el;
                }}
                className="relative h-full shrink-0"
                style={{ width: `${world.zoomW}vw` }}
              >
                <GalleryPanel
                  world={world}
                  capRef={(i, el) => {
                    if (!captionRefs.current[w]) captionRefs.current[w] = [];
                    captionRefs.current[w][i] = el;
                  }}
                />
              </div>
              {/* Approach/exit space to the next world */}
              <div className="relative h-full shrink-0" style={{ width: `${GAP_WORLD}vw` }} />
            </div>
          ))}
        </div>

        {/* Fixed vignette — melts the panorama edges into the current canvas; its
            opacity is driven to appear only over a gallery. */}
        <div
          ref={vignetteRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "radial-gradient(88% 155% at 50% 50%, rgba(0,0,0,0) 52%, rgb(var(--worlds-bg)) 100%)",
            opacity: 0,
          }}
        />

        <RunwayRule
          ref={ruleRef}
          total={WORLDS.length}
          label={active.label}
          placement="bottom"
          tone={active.tone}
        />
      </div>

      {/* ── MOBILE / TABLET / REDUCED MOTION — stacked fallback ── */}
      <div style={{ display: stacked ? "block" : "none" }}>
        {WORLDS.map((world) => (
          <section
            key={world.id}
            id={stacked ? world.id : undefined}
            className="w-full"
            style={{ background: world.bg }}
            aria-label={world.label}
          >
            <StatementPanel s={world.statement} stacked />
            <IntroPanel world={world} stacked />
            <WorldCarousel
              label={world.label}
              image={world.image}
              tone={world.tone}
              blocks={world.blocks}
            />
          </section>
        ))}
      </div>

      {/* Full-screen clip viewer (portalled to <body>) */}
      <VideoLightbox src={lightbox} open={!!lightbox} onClose={() => setLightbox(null)} />
    </section>
  );
}
