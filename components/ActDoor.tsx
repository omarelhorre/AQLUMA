"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

// Descriptive adjectives completing "…apprend à devenir." — scattered on the
// right with a little jitter in position + scale so they don't read as a list.
const TRAITS = [
  { word: "Créatif",    top: "28%", right: "9vw",  size: "clamp(2.1rem,4.9vw,4.2rem)" },
  { word: "Lucide",     top: "43%", right: "18vw", size: "clamp(1.7rem,3.7vw,3.2rem)" },
  { word: "Méthodique", top: "57%", right: "7vw",  size: "clamp(1.95rem,4.3vw,3.8rem)" },
  { word: "Concentré",  top: "70%", right: "15vw", size: "clamp(1.7rem,3.8vw,3.3rem)" },
];

// Right-hand intro statement, reformatted in the Dala hierarchy (gold kicker →
// big stacked Didot headline (consistent with the rest of the site) → a calm
// descriptive paragraph). It scrolls
// up + reveals line-by-line while "Bienvenu chez AQLUMA" and the CTA hold.
// Theme: in the AI revolution most people get lost — the tool is everywhere but
// almost no one knows how to use it; AQLUMA builds the method (professionalism)
// so nothing ever feels like mere repetition.
type IntroLine =
  | { kind: "kicker"; text: string }
  | { kind: "head"; text: string }
  | { kind: "body"; text: string };

const DESC: IntroLine[] = [
  { kind: "kicker", text: "À l’ère de l’IA" },
  { kind: "head", text: "L’IA partout." },
  { kind: "head", text: "La méthode," },
  { kind: "head", text: "nulle part." },
  {
    kind: "body",
    text:
      "Dans cette révolution, beaucoup se sont perdus : l’outil est partout, sans qu’on sache vraiment l’utiliser. AQLUMA n’est pas un cours d’informatique, mais une école du jugement : lire une réponse sans la croire, vérifier, reformuler, garder sa voix. Une méthode calme, qui tient dans le temps, pour que plus rien ne ressemble à de la simple répétition.",
  },
];

const BLUR_HIDDEN = { opacity: 0, filter: "blur(14px)", y: 22 };
const BLUR_SHOWN  = { opacity: 1, filter: "blur(0px)",  y: 0  };

// Timeline position (seconds) where the climax dissolve completes.
const DOOR_START = 0.78;
// Timeline position where the video begins — a clear beat AFTER the climax text
// has fully dissolved, so the screen is empty before the clip plays.
const VIDEO_START = 0.86;

export default function ActDoor() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const line1Ref   = useRef<HTMLDivElement>(null);
  const line2Ref   = useRef<HTMLDivElement>(null);
  const itemsRef   = useRef<(HTMLDivElement | null)[]>([]);
  const climaxRef  = useRef<HTMLDivElement>(null);
  const veilRef    = useRef<HTMLDivElement>(null);
  const descRef    = useRef<HTMLDivElement>(null);
  const descLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const reduced    = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    const video   = videoRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    // Scroll drives the video: it's paused and SEEKED per frame. The clip is encoded
    // all-intra (every frame a keyframe) so this scrubbing stays smooth at full quality.
    if (video) video.pause();

    const items = itemsRef.current.filter(Boolean) as HTMLDivElement[];

    const ctx = gsap.context(() => {
      const descLines = descLineRefs.current.filter(Boolean) as HTMLElement[];

      gsap.set(line1Ref.current, BLUR_SHOWN);
      gsap.set([line2Ref.current, climaxRef.current], BLUR_HIDDEN);
      gsap.set(items, BLUR_HIDDEN);
      gsap.set(descLines, BLUR_HIDDEN);
      gsap.set(descRef.current, { y: 30 });

      const seek = video
        ? gsap.quickTo(video, "currentTime", { duration: 0.25, ease: "power3.out" })
        : null;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=560%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      const reveal = (el: gsap.TweenTarget, at: number, dur = 0.04) =>
        tl.to(el, { ...BLUR_SHOWN, duration: dur }, at);
      const dissolve = (el: gsap.TweenTarget, at: number, dur = 0.04) =>
        tl.to(el, { opacity: 0, filter: "blur(14px)", y: -22, ease: "power2.in", duration: dur }, at);

      // ── Intro: "Bienvenu chez AQLUMA" holds while ONLY the right side scrolls
      //    up and reveals the six-line description, then it fades out. ──
      tl.to(descRef.current, { y: -30, ease: "none", duration: 0.26 }, 0);
      descLines.forEach((el, i) => reveal(el, 0.02 + i * 0.028, 0.05));
      dissolve(descLines, 0.27, 0.05);

      // Bienvenu hands off to the existing sequence.
      dissolve(line1Ref.current, 0.31);

      // "…apprend à devenir" reveals and LOCKS at full opacity (no early exit).
      reveal(line2Ref.current, 0.37);

      // ── Traits (scattered, right side): fade in one after another while
      //    "à devenir" stays on screen. ──
      const tStart = 0.40;
      const tStep  = 0.045;
      items.forEach((it, i) => reveal(it, tStart + i * tStep, 0.05));

      // ── …then the whole block ("à devenir" + the 4 traits) fades out together
      //    as one unified block, before the climax. ──
      dissolve([line2Ref.current, ...items], 0.59, 0.06);

      // ── Climax ── "AQLUMA est là pour ça" reads, then is fully cleared by the
      //    time the door video starts playing — the dissolve COMPLETES at
      //    DOOR_START so nothing lingers over the very first opening frame.
      reveal(climaxRef.current, 0.64, 0.05);
      dissolve(climaxRef.current, DOOR_START - 0.06, 0.06);

      // ── The opening video ── scrubbed ON THE TIMELINE (same clock as the text),
      //    so it can only begin once the climax dissolve has fully completed
      //    (VIDEO_START, a beat past DOOR_START). A proxy carries the playhead.
      if (seek && video) {
        const proxy = { t: 0 };
        tl.to(
          proxy,
          {
            t: 1,
            duration: 0.7,
            ease: "none",
            onUpdate: () => {
              if (video.duration) seek(proxy.t * video.duration);
            },
          },
          VIDEO_START
        );
      }

      // ── Parallax handoff into the Briefing ──────────────────────────────────
      // Once the door has mostly opened, the corridor drifts up + pushes in on a
      // slower plane while a void veil rises over it, so the corridor RECEDES into
      // depth and the cut to the dark Briefing hero becomes a soft parallax
      // dissolve instead of a hard horizontal edge. Ends exactly as the pin
      // releases, so ActDoor hands off on black → Briefing opens on black.
      tl.fromTo(
        videoRef.current,
        { yPercent: 0, scale: 1 },
        { yPercent: -12, scale: 1.06, ease: "none", duration: 0.2 },
        1.36
      );
      tl.to(veilRef.current, { opacity: 1, ease: "power1.in", duration: 0.18 }, 1.38);
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-void"
      aria-label="AQLUMA, introduction"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        src="/video/opening.mp4"
        poster="/video/opening-poster.jpg"
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
      />

      {/* Vignette weighted to both gutters so left + right copy read on frame. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,10,12,0.72) 0%, rgba(8,10,12,0.28) 30%, rgba(8,10,12,0) 50%, rgba(8,10,12,0.28) 70%, rgba(8,10,12,0.7) 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-20">

        {/* Line 1 — on load (left), with the programme CTA (opens the form modal). */}
        <Beat side="left" innerRef={line1Ref} initialOpacity={reduced ? 0 : 1}>
          <p className="font-didot text-[clamp(1.7rem,3.6vw,3.2rem)] leading-[1.12] tracking-[-0.015em] text-cream">
            Bienvenu chez AQLUMA.
          </p>
          <p className="mt-5 max-w-[34ch] font-satoshi text-[clamp(0.92rem,1.15vw,1.05rem)] leading-relaxed text-cream/60">
            {fr("Places limitées à chaque session. Recevez le programme avant qu’il ne soit complet.")}
          </p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("aqluma:program"))}
            className="group/cta pointer-events-auto mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 font-satoshi text-[13px] font-semibold tracking-tight text-void outline-none transition-all duration-300 ease-editorial hover:-translate-y-[1px] hover:bg-white hover:shadow-[0_12px_30px_-8px_rgba(247,244,239,0.45)] focus-visible:ring-2 focus-visible:ring-cream/40"
          >
            Demander le programme
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              aria-hidden
              className="translate-x-0 transition-transform duration-300 ease-editorial group-hover/cta:translate-x-[3px]"
            >
              <path
                d="M2.5 7h9M8 3.5L11.5 7 8 10.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </Beat>

        {/* Right-hand intro — Dala hierarchy (gold kicker → stacked Satoshi-black
            headline → calm paragraph). Scrolls up + reveals line-by-line, then
            fades; only this side moves while the left copy holds. */}
        <div className="absolute inset-y-0 right-[6vw] z-20 flex items-center">
          <div ref={descRef} className="ml-auto max-w-[min(88vw,36rem)] text-right will-change-transform">
            {DESC.map((line, i) => (
              <p
                key={i}
                ref={(el) => {
                  descLineRefs.current[i] = el;
                }}
                style={{ opacity: 0 }}
                className={
                  line.kind === "kicker"
                    ? "mb-5 font-satoshi text-[clamp(0.72rem,0.95vw,0.85rem)] font-bold uppercase tracking-kicker text-gold will-change-[transform,opacity,filter]"
                    : line.kind === "head"
                      ? "block font-didot text-[clamp(2.4rem,5.6vw,5rem)] font-normal leading-[1.06] tracking-[-0.02em] text-cream will-change-[transform,opacity,filter]"
                      : "ml-auto mt-7 max-w-[44ch] font-satoshi text-[clamp(0.95rem,1.3vw,1.2rem)] font-normal leading-relaxed text-cream/70 will-change-[transform,opacity,filter]"
                }
              >
                {fr(line.text)}
              </p>
            ))}
          </div>
        </div>

        {/* Line 2 — editorial two-line treatment (left) */}
        <Beat side="left" innerRef={line2Ref} initialOpacity={0}>
          <p className="font-didot leading-[1.16] tracking-[-0.015em]">
            <span className="block text-[clamp(1rem,2vw,1.6rem)] text-cream/50">
              Ici, votre adolescent
            </span>
            <span className="block text-[clamp(1.7rem,3.8vw,3.4rem)] text-cream">
              apprend à devenir
            </span>
          </p>
        </Beat>

        {/* The 4 traits — scattered on the right, staggered in, group fade-out */}
        {TRAITS.map((t, i) => (
          <div
            key={t.word}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            style={{
              opacity: reduced ? 1 : 0,
              top: t.top,
              right: t.right,
              fontSize: t.size,
            }}
            className="absolute font-didot leading-[1.04] tracking-[-0.015em] text-cream will-change-[transform,opacity,filter]"
          >
            {t.word}
          </div>
        ))}

        {/* Climax — AQLUMA in brand clay/orange (left) */}
        <Beat side="left" innerRef={climaxRef} initialOpacity={reduced ? 1 : 0}>
          <span
            className="block font-didot text-[clamp(2.9rem,7.4vw,6.2rem)] font-normal leading-[1.0] tracking-[-0.025em]"
            style={{ color: "#C9612E" }}
          >
            AQLUMA
          </span>
          <span className="mt-3 block font-didot text-[clamp(1.4rem,3vw,2.4rem)] leading-tight tracking-[-0.01em] text-cream/70">
            est là pour ça.
          </span>
        </Beat>

      </div>

      {/* Parallax handoff veil — the corridor melts into the void as the door
          finishes opening, dissolving the hard cut to the dark Briefing hero. */}
      <div
        ref={veilRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 bg-void"
        style={{ opacity: 0 }}
      />
    </section>
  );
}

function Beat({
  side,
  innerRef,
  initialOpacity,
  children,
}: {
  side: "left" | "right";
  innerRef: React.Ref<HTMLDivElement> | null;
  initialOpacity: number;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={innerRef ?? undefined}
      style={{ opacity: initialOpacity }}
      className={[
        "absolute top-1/2 max-w-[min(86vw,40rem)] -translate-y-1/2 will-change-[transform,opacity,filter]",
        side === "left" ? "left-[6vw] text-left" : "right-[6vw] text-right",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
