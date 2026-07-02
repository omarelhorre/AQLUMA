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
 * rotation and uneven indents, so it reads as written by hand, not typeset.
 *
 * On enter it plays ONCE, physically: the pin sets, the sheet swings the last few
 * degrees into place from the pin (soft, no bounce, one tiny settle), then the
 * quote WRITES itself — each word wipes on left→right at a pen-like pace
 * (duration ∝ word length, a beat between words, a longer one at line ends) —
 * and a single warm light passes across the sheet. Then everything is still.
 * On desktop the sheet holds an almost-imperceptible cursor parallax (<1° tilt,
 * the ambient shadow + sheen shifting with it). Reduced motion → at rest, fully
 * written.
 */

// Pre-wrapped lines with hand-set imperfection: a small per-line rotation and an
// uneven left indent — handwriting never sits on one perfect left edge.
const LINES: { t: string; rot: number; indent: number }[] = [
  { t: "« C'est comme", rot: -0.8, indent: 0 },
  { t: "donner les clés d'une", rot: 0.4, indent: 14 },
  { t: "bibliothèque immense", rot: -0.3, indent: 6 },
  { t: "à quelqu'un qui n'a", rot: 0.5, indent: 18 },
  { t: "pas appris à lire. »", rot: -0.5, indent: 9 },
];

const TILT = -2.2; // resting tilt of the pinned sheet (deg)
const PIN_X = "47%"; // the pin is a touch off-centre — nobody pins dead-centre

// Write-on clip states — generous vertical overshoot so ascenders/descenders and
// the per-line rotation are never clipped mid-wipe.
const WORD_HIDDEN = "inset(-30% 102% -30% -3%)";
const WORD_SHOWN = "inset(-30% -3% -30% -3%)";

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
  const shadowRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  // words grouped per line, so the writing rhythm can pause at line ends
  const wordRefs = useRef<(HTMLSpanElement | null)[][]>([]);

  // ── Entrance (once) ──
  useEffect(() => {
    if (reduced) return;
    const paper = paperRef.current;
    const wrap = wrapRef.current;
    if (!paper || !wrap) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const lineWords = wordRefs.current.map(
        (l) => (l || []).filter(Boolean) as HTMLSpanElement[],
      );
      gsap.set(paper, { rotation: TILT + 4.5, transformOrigin: `${PIN_X} 18px` });
      gsap.set(pinRef.current, { opacity: 0, scale: 0.55, transformOrigin: "50% 50%" });
      gsap.set(lineWords.flat(), { clipPath: WORD_HIDDEN });
      gsap.set(sweepRef.current, { xPercent: -140, opacity: 0 });

      const tl = gsap.timeline({ paused: true });

      // the pin sets first…
      tl.to(pinRef.current, { opacity: 1, scale: 1, duration: 0.32, ease: "power2.out" }, 0);
      // …the sheet swings into place from it, then one tiny settle (no bounce)
      tl.to(paper, { rotation: TILT - 0.6, duration: 0.95, ease: "power3.out" }, 0.1)
        .to(paper, { rotation: TILT, duration: 0.55, ease: "power2.inOut" }, 1.05);

      // …then the quote writes itself, word by word, at a pen's pace
      let t = 1.0;
      lineWords.forEach((words) => {
        words.forEach((w) => {
          const len = (w.textContent || "").length;
          const d = Math.max(0.16, len * 0.04);
          tl.to(w, { clipPath: WORD_SHOWN, duration: d, ease: "power1.inOut" }, t);
          t += d + 0.055;
        });
        t += 0.1; // the pen travels to the next line
      });

      // one warm light passes across the sheet, then stops
      const sweepAt = t + 0.35;
      tl.to(sweepRef.current, { opacity: 1, duration: 0.4, ease: "power1.out" }, sweepAt)
        .to(sweepRef.current, { xPercent: 240, duration: 1.9, ease: "power1.inOut" }, sweepAt)
        .to(sweepRef.current, { opacity: 0, duration: 0.6, ease: "power1.in" }, sweepAt + 1.3);

      ScrollTrigger.create({ trigger: wrap, start: "top 80%", once: true, onEnter: () => tl.play() });
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
    <div ref={wrapRef} className={`relative isolate ${className}`} style={{ perspective: "1100px" }}>
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
          className="relative z-10 px-9 pb-10 pt-12 font-semibold"
          style={{
            // Inline var (not Tailwind's `font-hand`): utilities from a config
            // edit only exist after a dev-server restart; the next/font variable
            // is always on <html>, so the handwriting can never fall back.
            fontFamily: "var(--font-hand)",
            fontSize: "clamp(1.7rem, 2.6vw, 2.65rem)",
            lineHeight: 1.22,
            // warm ink + a sub-pixel bleed halo — pen soaked into fibre
            color: "#2A251C",
            textShadow: "0 0 0.6px rgba(42,37,28,0.55)",
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
                }}
              >
                {words.map((w, wi) => (
                  <span key={wi}>
                    <span
                      ref={(el) => { (wordRefs.current[li] ||= [])[wi] = el; }}
                      className="inline-block will-change-[clip-path]"
                      style={reduced ? undefined : { clipPath: WORD_HIDDEN }}
                    >
                      {w}
                    </span>
                    {wi < words.length - 1 ? " " : null}
                  </span>
                ))}
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
