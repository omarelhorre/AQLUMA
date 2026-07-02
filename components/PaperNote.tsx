"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

/**
 * PAPER NOTE — the constat quote as a real handwritten note pinned to the wall.
 *
 * The sheet is a genuine paper scan (/textures/paper-note.jpg — Wikimedia
 * Commons « Old paper4.jpg », public domain; cropped past its stained top and
 * toned toward the site's cream with a CSS filter), hung from a small brass
 * push pin, over layered shadows (a tight contact shadow + a soft ambient one).
 * The quote is set in Caveat (self-hosted, `font-hand`) with a hair of per-line
 * rotation, uneven indents and irregular line gaps, plus per-word baseline drift,
 * cant and ink pressure (see JITTER) — and the ink multiplies into the scan so
 * the grain shows through the strokes. An aged-edge vignette and a soft fold
 * crease finish the sheet, so it reads as written by hand, not typeset.
 *
 * On enter the pin sets and the sheet swings the last few degrees into place
 * (soft, no bounce, one tiny settle) — once. The quote then writes itself
 * SCRUBBED BY SCROLL: a pen-pace model (per-character costs — wide glyphs slow,
 * thin ones quick — a breath between words, a longer travel at line ends, and a
 * sine-eased velocity inside each word so the pen accelerates mid-word) maps
 * scroll progress to left→right wipes; the soft scrub catch-up keeps the nib
 * moving between scroll ticks. Stop scrolling and the pen rests mid-sentence.
 * When the last word lands, a single warm light passes across the sheet — once.
 * On desktop the sheet holds an almost-imperceptible cursor parallax (<1° tilt,
 * the ambient shadow + sheen shifting with it). Reduced motion → at rest, fully
 * written.
 */

// Pre-wrapped lines with hand-set imperfection: a small per-line rotation, an
// uneven left indent — handwriting never sits on one perfect left edge — and a
// slightly irregular gap above each line, because no hand rules its own paper.
const LINES: { t: string; rot: number; indent: number; gap: number }[] = [
  { t: "« C'est comme", rot: -0.8, indent: 0, gap: 0 },
  { t: "donner les clés d'une", rot: 0.4, indent: 14, gap: 3 },
  { t: "bibliothèque immense", rot: -0.3, indent: 6, gap: 1 },
  { t: "à quelqu'un qui n'a", rot: 0.5, indent: 18, gap: 4 },
  { t: "pas appris à lire. »", rot: -0.5, indent: 9, gap: 2 },
];

// Per-word imperfection, cycled deterministically (SSR-stable, no Math.random):
// the baseline drifts a pixel, each word cants a fraction of a degree, and the
// ink density varies like pen pressure. Together with the per-line rotation this
// keeps any two words from sitting on the same digital grid.
const JITTER = [
  { y: 0.6, r: 0.5, o: 0.94 },
  { y: -0.9, r: -0.4, o: 1 },
  { y: 0.3, r: 0.8, o: 0.88 },
  { y: -0.5, r: -0.7, o: 0.97 },
  { y: 1.1, r: 0.3, o: 0.9 },
  { y: -0.3, r: -0.9, o: 1 },
  { y: 0.8, r: 0.6, o: 0.92 },
  { y: -1.1, r: 0.2, o: 0.96 },
  { y: 0.2, r: -0.5, o: 1 },
  { y: -0.7, r: 0.7, o: 0.9 },
  { y: 0.9, r: -0.2, o: 0.95 },
];
const jitterFor = (li: number, wi: number) => JITTER[(li * 3 + wi) % JITTER.length];

// ── Pen-pace model ───────────────────────────────────────────────────────────
// Each word's writing time is the sum of its characters' costs: wide glyphs
// (loops, capitals, guillemets) slow the pen, thin strokes are quick, and a
// cycled wobble keeps the speed human. Between words the pen breathes (+0.85);
// at line ends it travels to the next line (+2.4). Costs are normalised into
// [0,1] thresholds so scroll progress can drive the whole quote.
const PACE = [1, 1.18, 0.86, 1.08, 0.78, 1.22, 0.94, 1.12];
const charCost = (ch: string, k: number) =>
  (/[mwMWGOQ«»bhq]/.test(ch) ? 1.35 : /[iljt'’.,;:  ]/.test(ch) ? 0.6 : 1) *
  PACE[k % PACE.length];

const WRITE = (() => {
  let acc = 0;
  let k = 0;
  const words: { start: number; cost: number }[] = [];
  LINES.forEach((line) => {
    fr(line.t)
      .split(" ")
      .forEach((w) => {
        const cost = [...w].reduce((s, ch) => s + charCost(ch, k++), 0);
        words.push({ start: acc, cost });
        acc += cost + 0.85;
      });
    acc += 2.4;
  });
  return { words, total: acc };
})();

// sine in-out — the nib accelerates through the middle of a word and eases at
// its first and last strokes.
const penEase = (v: number) => 0.5 - Math.cos(Math.PI * v) / 2;

const TILT = -2.2; // resting tilt of the pinned sheet (deg)
const PIN_X = "47%"; // the pin is a touch off-centre — nobody pins dead-centre

// Write-on clip resting state — generous vertical overshoot so ascenders,
// descenders and the per-line rotation are never clipped mid-wipe. The scrubbed
// paint() sweeps the right inset 102% → -3% as the pen crosses each word.
const WORD_HIDDEN = "inset(-30% 102% -30% -3%)";

// Layered shadow: tight contact + mid + soft ambient — believable depth, not one blur.
const PAPER_SHADOW =
  "0 1px 2px rgba(0,0,0,0.30)," +
  "0 8px 18px -8px rgba(0,0,0,0.34)," +
  "0 34px 66px -26px rgba(0,0,0,0.62)," +
  "inset 0 1px 0 rgba(255,255,255,0.35)," +
  "inset 0 -1px 3px rgba(0,0,0,0.05)";

export default function PaperNote({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  // words grouped per line, so the writing rhythm can pause at line ends
  const wordRefs = useRef<(HTMLSpanElement | null)[][]>([]);

  // ── Fit the script to the sheet ──
  // The handwriting must OCCUPY the sheet: measure every line's true width in
  // the loaded Caveat face (canvas, no layout thrash) and size the font so the
  // widest line — indent included — spans the writing width. Runs at mount, when
  // the webfont's real metrics land, and on any resize of the sheet.
  useEffect(() => {
    const quote = quoteRef.current;
    const paper = paperRef.current;
    if (!quote || !paper) return;

    const ctx2d = document.createElement("canvas").getContext("2d");
    if (!ctx2d) return;
    const PROBE = 100;

    const fit = () => {
      const cs = getComputedStyle(quote);
      const inner =
        quote.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (inner <= 0) return;
      ctx2d.font = `${cs.fontWeight} ${PROBE}px ${cs.fontFamily}`;
      let size = Infinity;
      for (const line of LINES) {
        const em = ctx2d.measureText(fr(line.t)).width / PROBE;
        if (em > 0) size = Math.min(size, (inner - line.indent) / em);
      }
      if (!isFinite(size)) return;
      // 0.965 leaves the hair of right margin a hand would; clamp for sanity.
      quote.style.fontSize = `${Math.min(Math.max(size * 0.965, 18), 72)}px`;
    };

    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    const ro = new ResizeObserver(fit);
    ro.observe(paper);
    return () => ro.disconnect();
  }, []);

  // ── Entrance (once) ──
  useEffect(() => {
    if (reduced) return;
    const paper = paperRef.current;
    const wrap = wrapRef.current;
    if (!paper || !wrap) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const words = wordRefs.current
        .flatMap((l) => l || [])
        .filter(Boolean) as HTMLSpanElement[];
      gsap.set(paper, { rotation: TILT + 4.5, transformOrigin: `${PIN_X} 18px` });
      gsap.set(pinRef.current, { opacity: 0, scale: 0.55, transformOrigin: "50% 50%" });
      gsap.set(words, { clipPath: WORD_HIDDEN });
      gsap.set(sweepRef.current, { xPercent: -140, opacity: 0 });

      // ── The physical entrance — once. The pin sets, the sheet swings in. ──
      const hang = gsap.timeline({ paused: true });
      hang
        .to(pinRef.current, { opacity: 1, scale: 1, duration: 0.32, ease: "power2.out" }, 0)
        .to(paper, { rotation: TILT - 0.6, duration: 0.95, ease: "power3.out" }, 0.1)
        .to(paper, { rotation: TILT, duration: 0.55, ease: "power2.inOut" }, 1.05);
      ScrollTrigger.create({ trigger: wrap, start: "top 80%", once: true, onEnter: () => hang.play() });

      // ── The writing — scrubbed by scroll at the pen's pace. ──
      const { words: model, total } = WRITE;
      const prev: number[] = new Array(words.length).fill(-1);
      let swept = false;
      const paint = (p: number) => {
        for (let i = 0; i < words.length; i++) {
          const m = model[i];
          if (!m) break;
          const v = Math.min(1, Math.max(0, (p * total - m.start) / m.cost));
          if (v === prev[i]) continue;
          prev[i] = v;
          const e = v <= 0 ? 0 : v >= 1 ? 1 : penEase(v);
          words[i].style.clipPath = `inset(-30% ${102 - e * 105}% -30% -3%)`;
        }
        // the last word lands → one warm light passes across the sheet, once
        if (p > 0.995 && !swept) {
          swept = true;
          gsap
            .timeline()
            .to(sweepRef.current, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0)
            .to(sweepRef.current, { xPercent: 240, duration: 1.9, ease: "power1.inOut" }, 0)
            .to(sweepRef.current, { opacity: 0, duration: 0.6, ease: "power1.in" }, 1.3);
        }
      };

      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: wrap, start: "top 72%", end: "center 40%", scrub: 0.45 },
        onUpdate: () => paint(proxy.p),
      });
      paint(0);
    }, wrap);

    return () => ctx.revert();
  }, [reduced]);

  // ── Cursor parallax (desktop, fine pointer) — almost imperceptible ──
  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const paper = paperRef.current;
    const shadow = shadowRef.current;
    const sheen = sheenRef.current;
    if (!paper) return;

    const rx = gsap.quickTo(paper, "rotationX", { duration: 0.7, ease: "power2.out" });
    const ry = gsap.quickTo(paper, "rotationY", { duration: 0.7, ease: "power2.out" });
    const shx = shadow ? gsap.quickTo(shadow, "x", { duration: 0.8, ease: "power2.out" }) : null;
    const shy = shadow ? gsap.quickTo(shadow, "y", { duration: 0.8, ease: "power2.out" }) : null;
    const shn = sheen ? gsap.quickTo(sheen, "x", { duration: 0.9, ease: "power2.out" }) : null;
    const shny = sheen ? gsap.quickTo(sheen, "y", { duration: 0.9, ease: "power2.out" }) : null;

    const onMove = (e: MouseEvent) => {
      const r = paper.getBoundingClientRect();
      const nx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2));
      const ny = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2));
      ry(nx * 0.9); // < 1°
      rx(-ny * 0.9);
      if (shx) shx(-nx * 7);
      if (shy) shy(-ny * 5);
      if (shn) shn(nx * 9);
      if (shny) shny(ny * 9);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      className={`relative isolate ${className}`}
      // inline-size container: the handwriting is sized in cqi against the
      // SHEET's width (below), so the script keeps one proportion at any note
      // size instead of growing with the viewport until lines wrap.
      style={{ perspective: "1100px", containerType: "inline-size" }}
    >
      {/* soft ambient shadow — shifts with the parallax to sell depth */}
      <div
        ref={shadowRef}
        aria-hidden
        className="absolute inset-x-2 bottom-0 top-6 -z-10"
        style={{
          background: "radial-gradient(58% 54% at 50% 66%, rgba(0,0,0,0.55), rgba(0,0,0,0) 72%)",
          filter: "blur(26px)",
          willChange: "transform",
        }}
      />

      {/* brass push pin — the sheet hangs from this point */}
      <div
        ref={pinRef}
        aria-hidden
        className="absolute top-[8px] z-30 h-[19px] w-[19px] -translate-x-1/2"
        style={{ left: PIN_X }}
      >
        {/* shadow the head casts onto the paper (light sits high-left) */}
        <span
          className="absolute left-[38%] top-[62%] h-[10px] w-[16px] rounded-full bg-black/35"
          style={{ filter: "blur(3px)", transform: "rotate(24deg)" }}
        />
        {/* the head — domed brass, one specular point */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 34% 30%, #F6D98A 0%, #D9A83C 40%, #8C6420 78%, #6B4A14 100%)",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.5), 0 4px 8px -2px rgba(0,0,0,0.45)," +
              "inset 0 -2px 3px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.55)",
          }}
        />
        <span className="absolute left-[28%] top-[22%] h-[4px] w-[4px] rounded-full bg-white/90" style={{ filter: "blur(0.5px)" }} />
      </div>

      {/* the sheet */}
      <figure
        ref={paperRef}
        className="relative overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
          borderRadius: "2px 3px 2px 3px",
          // paper-coloured fallback while the scan streams in
          backgroundColor: "#F0E7D4",
          boxShadow: PAPER_SHADOW,
        }}
      >
        {/* the scan — cropped past its stained top third, desaturated + lifted
            toward the site's cream so it sits in the palette */}
        <img
          src="/textures/paper-note.jpg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "50% 78%", filter: "saturate(0.5) brightness(1.24) contrast(0.96)" }}
        />

        {/* aged-edge vignette — a handled sheet darkens toward its edges; keeps
            the centre (where the ink lives) clean */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(115% 100% at 50% 44%, rgba(0,0,0,0) 58%, rgba(56,44,24,0.14) 90%, rgba(56,44,24,0.22) 100%)",
            mixBlendMode: "multiply",
          }}
        />

        {/* an old fold across the sheet — shadow settling into the crease, a kiss
            of light where the paper breaks back toward the wall */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[57%] h-[16px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(58,46,26,0.28) 44%, rgba(255,255,255,0.5) 64%, rgba(255,255,255,0) 100%)",
            mixBlendMode: "soft-light",
          }}
        />

        {/* studio sheen — soft light pooled top-left; drifts a hair on parallax */}
        <div
          ref={sheenRef}
          aria-hidden
          className="pointer-events-none absolute inset-[-15%]"
          style={{
            background: "radial-gradient(42% 38% at 30% 22%, rgba(255,255,255,0.5), rgba(255,255,255,0) 60%)",
            mixBlendMode: "soft-light",
            willChange: "transform",
          }}
        />

        <blockquote
          ref={quoteRef}
          className="relative z-10 px-9 pb-10 pt-12 font-semibold"
          style={{
            // Inline var (not Tailwind's `font-hand`): utilities from a config
            // edit only exist after a dev-server restart; the next/font variable
            // is always on <html>, so the handwriting can never fall back.
            fontFamily: "var(--font-hand)",
            // Pre-JS fallback only — the fit effect above replaces this with a
            // measured size so the widest line spans the sheet's writing width.
            fontSize: "clamp(1.35rem, 8.1cqi, 2.6rem)",
            lineHeight: 1.3,
            // warm ink + a sub-pixel bleed halo — pen soaked into fibre. Multiply
            // lets the paper grain show through the strokes, so the writing sits
            // IN the sheet rather than printed over it.
            color: "#2A251C",
            textShadow: "0 0 0.6px rgba(42,37,28,0.55)",
            mixBlendMode: "multiply",
          }}
        >
          {LINES.map((line, li) => {
            const words = fr(line.t).split(" ");
            return (
              <span
                key={li}
                className="block"
                style={{
                  transform: `rotate(${line.rot}deg)`,
                  paddingLeft: line.indent,
                  marginTop: line.gap,
                }}
              >
                {words.map((w, wi) => {
                  const j = jitterFor(li, wi);
                  return (
                    <span key={wi}>
                      <span
                        ref={(el) => { (wordRefs.current[li] ||= [])[wi] = el; }}
                        className="inline-block will-change-[clip-path]"
                        style={{
                          transform: `translateY(${j.y}px) rotate(${j.r}deg)`,
                          opacity: j.o,
                          ...(reduced ? null : { clipPath: WORD_HIDDEN }),
                        }}
                      >
                        {w}
                      </span>
                      {wi < words.length - 1 ? " " : null}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </blockquote>

        {/* one-time warm light sweep — ambient light on the fibres, not a shine */}
        <div
          ref={sweepRef}
          aria-hidden
          className="pointer-events-none absolute inset-y-[-12%] left-0 w-[46%]"
          style={{
            background: "linear-gradient(100deg, rgba(255,247,226,0) 0%, rgba(255,246,222,0.5) 50%, rgba(255,247,226,0) 100%)",
            mixBlendMode: "soft-light",
            willChange: "transform, opacity",
          }}
        />
      </figure>
    </div>
  );
}
