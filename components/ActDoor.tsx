"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";
import CtaButton from "@/components/CtaButton";
import { CTA_SUPPORT } from "@/lib/contact";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Descriptive adjectives completing "…apprend à devenir." — scattered on the
// right with a little jitter in position + scale so they don't read as a list.
const TRAITS = [
  { word: "Créatif",    top: "28%", right: "9vw",  size: "clamp(2.1rem,4.9vw,4.2rem)" },
  { word: "Lucide",     top: "43%", right: "18vw", size: "clamp(1.7rem,3.7vw,3.2rem)" },
  { word: "Méthodique", top: "57%", right: "7vw",  size: "clamp(1.95rem,4.3vw,3.8rem)" },
  { word: "Concentré",  top: "70%", right: "15vw", size: "clamp(1.7rem,3.8vw,3.3rem)" },
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
  // Hero reveals that stagger in on scroll while the headline holds.
  const heroParaRef = useRef<HTMLDivElement>(null); // right-hand subtitle
  const heroProgRef = useRef<HTMLParagraphElement>(null); // left programme line
  const heroCtaRef  = useRef<HTMLDivElement>(null); // CTA + microcopy
  const reduced    = useReducedMotion();
  // Below md the desktop two-column scatter (left copy ‖ right description, plus
  // the right-scattered traits) collapses into the same centre band and overlaps.
  // `narrow` keeps the pinned scroll story but reflows the blocks into separate
  // vertical zones (left copy → upper, description + traits → lower). Resolved in a
  // layout effect for SSR-safety, like MindReveal / ProgramManifesto.
  const [narrow, setNarrow] = useState(false);
  useIsoLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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
      gsap.set(line1Ref.current, BLUR_SHOWN);
      gsap.set([line2Ref.current, climaxRef.current], BLUR_HIDDEN);
      gsap.set(items, BLUR_HIDDEN);
      gsap.set(
        [heroParaRef.current, heroProgRef.current, heroCtaRef.current],
        BLUR_HIDDEN,
      );

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

      // ── Intro: the headline holds over the closed door. On scroll, the
      //    right-hand subtitle fades in first, then the left programme line,
      //    then the CTA — a progressive reveal. The whole block then dissolves
      //    into beat 2. ──
      reveal(heroParaRef.current, 0.06, 0.05);
      reveal(heroProgRef.current, 0.13, 0.05);
      reveal(heroCtaRef.current, 0.20, 0.05);
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

      {/* Mobile-only legibility scrim. On phones the copy is CENTRED over the
          clip (not tucked in the dark side-gutters like desktop), so bright video
          details — e.g. the door's frame molding — bleed through the text. This
          darkens the top + bottom bands where the copy sits while keeping the
          middle clearer so the door reveal still reads. md+: side vignette only. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 md:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,10,12,0.84) 0%, rgba(8,10,12,0.5) 30%, rgba(8,10,12,0.42) 50%, rgba(8,10,12,0.5) 70%, rgba(8,10,12,0.86) 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-20">

        {/* Line 1 — the hero hold, spread across the full frame: the insight on
            the LEFT, the closed door standing as a threshold in the CENTRE, and
            the invitation (CTA) anchored on the RIGHT, so the eye reads
            left → door → action. Collapses to a centred stack on mobile.
            NOTE: the program-request form modal (aqluma:program / ProgramModal)
            is intentionally kept in the codebase, stale, so the CTA can be
            switched back to it later. */}
        <div
          ref={line1Ref}
          style={{ opacity: reduced ? 0 : 1 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-12 px-[6vw] text-center will-change-[transform,opacity,filter] md:flex-row md:items-center md:justify-between md:gap-8 md:text-left"
        >
          {/* Left — headline holds; programme line + CTA fade in on scroll */}
          <div className="max-w-[min(92vw,38rem)] md:max-w-[46%]">
            <h1 className="text-balance font-didot text-[clamp(2rem,4.5vw,3.9rem)] leading-[1.08] tracking-[-0.018em] text-cream">
              {fr("Une réponse propre ne veut pas dire qu’il a compris.")}
            </h1>
            <p
              ref={heroProgRef}
              style={{ opacity: 0 }}
              className="mx-auto mt-8 max-w-[44ch] text-pretty font-satoshi text-[clamp(1.05rem,1.4vw,1.3rem)] font-medium leading-relaxed text-cream/75 will-change-[transform,opacity,filter] md:mx-0"
            >
              {fr("AQLUMA apprend aux adolescents de 13 à 17 ans à utiliser l’IA avec jugement.")}
            </p>
            <div
              ref={heroCtaRef}
              style={{ opacity: 0 }}
              className="mt-9 will-change-[transform,opacity,filter]"
            >
              <CtaButton className="pointer-events-auto" />
              <p className="mx-auto mt-4 max-w-[40ch] text-pretty font-satoshi text-[0.82rem] leading-relaxed text-cream/60 md:mx-0">
                {fr(CTA_SUPPORT)}
              </p>
            </div>
          </div>

          {/* Right — the descriptive line fades in on scroll, echoing the old
              right-hand reveal. */}
          <div
            ref={heroParaRef}
            style={{ opacity: 0 }}
            className="max-w-[min(92vw,34rem)] text-left will-change-[transform,opacity,filter]"
          >
            <p className="text-pretty font-satoshi text-[clamp(1.35rem,2.1vw,2rem)] font-normal leading-relaxed text-cream/85">
              {fr("Un programme en ligne, au Maroc, pour apprendre à vérifier, reformuler, expliquer et créer.")}
            </p>
          </div>
        </div>

        {/* Line 2 — editorial two-line treatment (left) */}
        <Beat side="left" innerRef={line2Ref} initialOpacity={0} mtop="top-[26%]">
          <p className="font-didot leading-[1.16] tracking-[-0.015em]">
            <span className="block text-[clamp(1rem,2vw,1.6rem)] text-cream/50">
              Ici, votre adolescent
            </span>
            <span className="block text-[clamp(1.7rem,3.8vw,3.4rem)] text-cream">
              apprend à devenir
            </span>
          </p>
        </Beat>

        {/* The 4 traits — md+: scattered on the right (absolute, per-item top/right).
            Mobile: a centred stack in the lower zone (clear of line2 in the upper
            zone). The wrapper is `display:contents` at md+ so the children keep
            their original absolute scatter relative to the section. */}
        <div className="absolute inset-x-0 bottom-0 top-[50%] z-20 flex flex-col items-center justify-center gap-1.5 px-6 md:contents">
          {TRAITS.map((t, i) => (
            <div
              key={t.word}
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
              style={
                narrow
                  ? { opacity: reduced ? 1 : 0, fontSize: "clamp(1.7rem,7vw,2.6rem)" }
                  : { opacity: reduced ? 1 : 0, top: t.top, right: t.right, fontSize: t.size }
              }
              className={[
                "font-didot leading-[1.04] tracking-[-0.015em] text-cream will-change-[transform,opacity,filter]",
                narrow ? "" : "absolute",
              ].join(" ")}
            >
              {t.word}
            </div>
          ))}
        </div>

        {/* Climax — AQLUMA in brand clay/orange (left). Lone on mobile, so it sits
            lower toward the vertical centre rather than up in the header band. */}
        <Beat side="left" innerRef={climaxRef} initialOpacity={reduced ? 1 : 0} mtop="top-[40%]">
          <span className="block font-didot text-[clamp(2.9rem,7.4vw,6.2rem)] font-normal leading-[1.0] tracking-[-0.025em] text-clay">
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
  mtop = "top-[16%]",
  children,
}: {
  side: "left" | "right";
  innerRef: React.Ref<HTMLDivElement> | null;
  initialOpacity: number;
  /** Mobile vertical anchor (Tailwind `top-*`). Tuned per beat so a beat paired
   *  with a large lower block sits higher, a lone/small-paired beat sits lower. */
  mtop?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={innerRef ?? undefined}
      style={{ opacity: initialOpacity }}
      className={[
        // Mobile: full-width, centred, anchored in the upper zone (the right-side
        // description + traits get the lower zone) so the two never overlap.
        `absolute left-0 right-0 ${mtop} px-6 text-center will-change-[transform,opacity,filter]`,
        // md+: the original left/right column, vertically centred.
        "md:top-1/2 md:max-w-[min(86vw,40rem)] md:-translate-y-1/2 md:px-0",
        side === "left"
          ? "md:left-[6vw] md:right-auto md:text-left"
          : "md:left-auto md:right-[6vw] md:text-right",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
