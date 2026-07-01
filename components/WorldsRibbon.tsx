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
import { Caption, WorldCarousel } from "./worlds/WorldCarousel";
import RunwayRule, { type RunwayRuleHandle } from "./RunwayRule";

/**
 * LES TROIS MONDES — one pinned horizontal ribbon.
 *
 * Vertical scroll pans a single flex track left→right through three worlds, each
 * a run of three panels: [statement + bleeding clip] → [intro text on flat bg] →
 * [panorama gallery with glued captions]. One canvas colour cross-fades between
 * worlds (terracotta → void → paper); the flat-colour intro/statement panels are
 * the buffer between a world's clip and its photos, and every image + clip is
 * edge-feathered so it melts into the current canvas — no fades, one continuous
 * wall.
 *
 * Both the pinned ribbon and a stacked mobile/reduced-motion fallback are ALWAYS
 * mounted; only `display` toggles, and the pin is created only for the ribbon —
 * so React never adds/removes the GSAP-pinned subtree (the removeChild crash).
 */

// Layout effect on the client (before paint), plain effect on the server. Resolves
// the viewport BEFORE the pinning passive-effect runs, so a phone/tablet/reduced-
// motion visitor renders the stacked fallback and the pin is never created.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const INTRO_VW = 62; // width of each intro buffer panel

// Feather the panorama's far left/right edges into transparency so it dissolves
// into the canvas at each seam (no hard vertical edge against the flat panels).
const EDGE_FEATHER =
  "linear-gradient(to right, transparent 0, #000 2%, #000 98%, transparent 100%)";

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

type Span = { c: number; l: number; r: number };
type Geo = { innerW: number; panDist: number; stmts: Span[]; galls: Span[] };

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
function GalleryPanel({ world }: { world: World }) {
  const focusY = world.focusY ?? 0.5;
  return (
    <div className="relative h-full w-full overflow-hidden">
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
      {world.blocks.map((b, i) => (
        <div
          key={i}
          className={`absolute z-10 ${
            b.widthClass ?? (b.wide ? "w-[min(42rem,46vw)]" : "w-[min(27rem,30vw)]")
          }`}
          style={{ left: b.left, ...b.v }}
        >
          <Caption b={b} tone={world.tone} total={world.blocks.length} />
        </div>
      ))}
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

  const [stacked, setStacked] = useState(false);
  const [activeWorld, setActiveWorld] = useState(0);

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

    const measure = (): Geo => {
      const innerW = window.innerWidth;
      const panDist = Math.max(1, track.offsetWidth - innerW);
      const span = (el: HTMLDivElement): Span => ({
        l: el.offsetLeft,
        r: el.offsetLeft + el.offsetWidth,
        c: el.offsetLeft + el.offsetWidth / 2,
      });
      return {
        innerW,
        panDist,
        stmts: stmtEls.map((e) => span(e!)),
        galls: gallEls.map((e) => span(e!)),
      };
    };

    const playing = new Array(WORLDS.length).fill(false);
    let geo = measure();
    let tl: gsap.core.Timeline | undefined;

    const applyBg = (centerX: number) => {
      const gs = geo.galls;
      const n = gs.length;
      let rgb: number[];
      if (centerX <= gs[0].c) rgb = RGBS[0];
      else if (centerX >= gs[n - 1].c) rgb = RGBS[n - 1];
      else {
        let i = 0;
        while (i < n - 1 && !(centerX >= gs[i].c && centerX < gs[i + 1].c)) i++;
        const t = smooth((centerX - gs[i].c) / (gs[i + 1].c - gs[i].c));
        rgb = [
          lerp(RGBS[i][0], RGBS[i + 1][0], t),
          lerp(RGBS[i][1], RGBS[i + 1][1], t),
          lerp(RGBS[i][2], RGBS[i + 1][2], t),
        ];
      }
      pan.style.setProperty("--worlds-bg", `${rgb[0] | 0} ${rgb[1] | 0} ${rgb[2] | 0}`);
    };

    // The vignette (which melts the panorama edges into the canvas) is only wanted
    // over a gallery — fade it out across the flat statement/intro panels.
    const applyVignette = (centerX: number) => {
      let op = 0;
      for (const g of geo.galls) {
        const d = centerX < g.l ? g.l - centerX : centerX > g.r ? centerX - g.r : 0;
        op = Math.max(op, clamp01(1 - d / (geo.innerW * 0.55)));
      }
      if (vignetteRef.current) vignetteRef.current.style.opacity = String(op);
    };

    const applyStatements = (centerX: number) => {
      for (let w = 0; w < geo.stmts.length; w++) {
        const s = geo.stmts[w];
        // Write on as the panel travels from its left edge (entering right) to centre.
        const g = clamp01((centerX - s.l) / Math.max(1, s.c - s.l));
        statementRefs.current[w]?.setFill(g);
        const play = Math.abs(centerX - s.c) < geo.innerW * 0.72;
        if (play !== playing[w]) {
          playing[w] = play;
          statementRefs.current[w]?.setPlaying(play);
        }
      }
    };

    let lastWorld = -1;
    const applyActiveWorld = (centerX: number) => {
      let aw = 0;
      for (let w = 0; w < geo.stmts.length; w++) if (centerX >= geo.stmts[w].l) aw = w;
      if (aw !== lastWorld) {
        lastWorld = aw;
        setActiveWorld(aw);
      }
    };

    const render = () => {
      if (!tl) return;
      const p = tl.progress();
      const centerX = p * geo.panDist + geo.innerW / 2;
      applyBg(centerX);
      applyVignette(centerX);
      applyStatements(centerX);
      applyActiveWorld(centerX);
      ruleRef.current?.setProgress(p);
    };

    const ctx = gsap.context(() => {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: pan,
          start: "top top",
          end: () => "+=" + geo.panDist,
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
      tl.to(track, { x: () => -geo.panDist, ease: "none", onUpdate: render }, 0);
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
        {/* The translating ribbon — statements, intros, galleries, one long row. */}
        <div
          ref={trackRef}
          className="absolute inset-y-0 left-0 z-10 flex h-full w-max will-change-transform"
        >
          {WORLDS.map((world, w) => (
            <div key={world.id} className="relative flex h-full">
              {/* Statement + bleeding clip */}
              <div
                ref={(el) => {
                  stmtWrapRefs.current[w] = el;
                }}
                id={stacked ? undefined : world.id}
                className="relative h-full w-screen shrink-0"
              >
                <StatementPanel
                  ref={(el) => {
                    statementRefs.current[w] = el;
                  }}
                  s={world.statement}
                />
              </div>
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
                <GalleryPanel world={world} />
              </div>
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
    </section>
  );
}
