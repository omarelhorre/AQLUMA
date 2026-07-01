"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";
import CtaButton from "@/components/CtaButton";

/**
 * ACT · THE DOOR — the opening, re-choreographed (§1 of the refinement).
 *
 *   1. The LEFT composition (the problem — « Une réponse propre… » + programme +
 *      CTA) is present from the first frame and never animates in.
 *   2. On scroll the RIGHT writes the promise: « Ici, votre adolescent apprend à
 *      devenir » fades in then out, then the four traits — Créatif · Lucide ·
 *      Méthodique · Concentré — appear SCATTERED (the original positions), one at
 *      a time, and clear.
 *   3. « AQLUMA est là pour ça » arrives while the LEFT is STILL there; then the
 *      climax and the left composition dissolve TOGETHER, the door scrubs open,
 *      and the parallax hand-off carries into the Briefing.
 *
 * Single DOM structure, responsive by CSS only (md: scatter ↔ mobile stack via
 * `md:contents` / `md:absolute` — never a JS media-query state that flips the
 * tree under a pin; that was the old mobile removeChild crash). Reduced motion →
 * a calm static hero (the problem shown, door at its poster).
 */

// The four traits, scattered on the right at md+ (original ActDoor positions);
// a centred stack below md. Positions/sizes recovered from git (commit c70db4d).
const TRAITS = [
  { word: "Créatif", pos: "md:top-[28%] md:right-[9vw] md:text-[clamp(2.1rem,4.9vw,4.2rem)]" },
  { word: "Lucide", pos: "md:top-[43%] md:right-[18vw] md:text-[clamp(1.7rem,3.7vw,3.2rem)]" },
  { word: "Méthodique", pos: "md:top-[57%] md:right-[7vw] md:text-[clamp(1.95rem,4.3vw,3.8rem)]" },
  { word: "Concentré", pos: "md:top-[70%] md:right-[15vw] md:text-[clamp(1.7rem,3.8vw,3.3rem)]" },
];

const BLUR_HIDDEN = { opacity: 0, filter: "blur(14px)", y: 22 };
const BLUR_SHOWN = { opacity: 1, filter: "blur(0px)", y: 0 };

export default function ActDoor() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const leftRef = useRef<HTMLDivElement>(null); // the problem — holds through the climax
  const devenirRef = useRef<HTMLParagraphElement>(null); // « …apprend à devenir »
  const traitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const climaxRef = useRef<HTMLDivElement>(null); // « AQLUMA est là pour ça »
  const veilRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    if (video) video.pause();

    const traits = traitRefs.current.filter(Boolean) as HTMLDivElement[];

    const ctx = gsap.context(() => {
      gsap.set(leftRef.current, BLUR_SHOWN); // present from the first frame
      gsap.set([devenirRef.current, climaxRef.current, ...traits], BLUR_HIDDEN);

      const seek = video
        ? gsap.quickTo(video, "currentTime", { duration: 0.25, ease: "power3.out" })
        : null;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=600%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      const reveal = (el: gsap.TweenTarget, at: number, dur = 0.05) =>
        tl.to(el, { ...BLUR_SHOWN, duration: dur }, at);
      const dissolve = (el: gsap.TweenTarget, at: number, dur = 0.06) =>
        tl.to(el, { opacity: 0, filter: "blur(14px)", y: -22, ease: "power2.in", duration: dur }, at);

      // ── « Ici, votre adolescent apprend à devenir » — in, then out. ──
      reveal(devenirRef.current, 0.06, 0.06);
      dissolve(devenirRef.current, 0.22, 0.06);

      // ── The scattered traits appear one after another, then clear. ──
      traits.forEach((t, i) => reveal(t, 0.3 + i * 0.06, 0.05));
      dissolve(traits, 0.62, 0.07);

      // ── AQLUMA arrives — the LEFT is still there. Then « est là » and the
      //    problem dissolve TOGETHER, and the door opens. ──
      reveal(climaxRef.current, 0.68, 0.06);
      dissolve(climaxRef.current, 0.86, 0.07);
      dissolve(leftRef.current, 0.86, 0.08);

      if (seek && video) {
        const proxy = { t: 0 };
        tl.to(
          proxy,
          {
            t: 1,
            duration: 0.5,
            ease: "none",
            onUpdate: () => {
              if (video.duration) seek(proxy.t * video.duration);
            },
          },
          0.94,
        );
      }

      // ── Parallax hand-off into the Briefing. ──
      tl.fromTo(
        videoRef.current,
        { yPercent: 0, scale: 1 },
        { yPercent: -12, scale: 1.06, ease: "none", duration: 0.18 },
        1.46,
      );
      tl.to(veilRef.current, { opacity: 1, ease: "power1.in", duration: 0.16 }, 1.48);
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

      {/* Mobile-only legibility scrim (copy is centred over the clip on phones). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 md:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,10,12,0.84) 0%, rgba(8,10,12,0.5) 30%, rgba(8,10,12,0.42) 50%, rgba(8,10,12,0.5) 70%, rgba(8,10,12,0.86) 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Left — the problem. Present from the first frame, holds through the
            climax, then dissolves with it. */}
        <div
          ref={leftRef}
          style={{ opacity: 1 }}
          className="absolute inset-x-0 top-[12%] px-6 text-center will-change-[transform,opacity,filter] md:inset-x-auto md:left-[6vw] md:top-1/2 md:max-w-[46%] md:-translate-y-1/2 md:px-0 md:text-left"
        >
          <h1 className="font-didot text-[clamp(2rem,4.5vw,3.9rem)] leading-[1.08] tracking-[-0.018em] text-cream">
            {fr("Une réponse propre ne")}
            <br className="hidden md:block" />{" "}
            {fr("veut pas dire qu’il a")}
            <br className="hidden md:block" />{" "}
            {fr("compris.")}
          </h1>
          <p className="mx-auto mt-8 max-w-[44ch] text-pretty font-satoshi text-[clamp(1.05rem,1.4vw,1.3rem)] font-medium leading-relaxed text-cream/75 md:mx-0">
            {fr("AQLUMA apprend aux adolescents de 13 à 17 ans à utiliser l’IA avec jugement.")}
          </p>
          <div className="mt-9">
            <CtaButton className="pointer-events-auto" />
          </div>
        </div>

        {/* Right — « Ici, votre adolescent apprend à devenir ». */}
        <p
          ref={devenirRef}
          style={{ opacity: reduced ? 0 : 0 }}
          className="absolute inset-x-0 top-[52%] px-6 text-center font-didot leading-[1.16] tracking-[-0.015em] will-change-[transform,opacity,filter] md:inset-x-auto md:left-auto md:right-[6vw] md:top-[42%] md:max-w-[38%] md:px-0 md:text-right"
        >
          <span className="block text-[clamp(1rem,1.9vw,1.55rem)] text-cream/55">
            Ici, votre adolescent
          </span>
          <span className="block text-[clamp(1.7rem,3.6vw,3.2rem)] text-cream">
            apprend à devenir
          </span>
        </p>

        {/* The four traits — scattered on the right at md+, a centred stack below. */}
        <div className="absolute inset-x-0 top-[50%] z-20 flex flex-col items-center gap-1.5 px-6 md:contents">
          {TRAITS.map((t, i) => (
            <div
              key={t.word}
              ref={(el) => {
                traitRefs.current[i] = el;
              }}
              style={{ opacity: reduced ? 0 : 0 }}
              className={`font-didot text-[clamp(1.6rem,6.5vw,2.5rem)] leading-[1.04] tracking-[-0.015em] text-cream will-change-[transform,opacity,filter] md:absolute ${t.pos}`}
            >
              {t.word}
            </div>
          ))}
        </div>

        {/* Climax — « AQLUMA est là pour ça », arriving while the problem holds. */}
        <div
          ref={climaxRef}
          style={{ opacity: 0 }}
          className="absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 px-6 text-center will-change-[transform,opacity,filter] md:inset-x-auto md:left-auto md:right-[6vw] md:max-w-[44%] md:px-0 md:text-right"
        >
          <span className="block font-didot text-[clamp(2.9rem,7.4vw,6.2rem)] font-normal leading-[1.0] tracking-[-0.025em] text-clay">
            AQLUMA
          </span>
          <span className="mt-3 block font-didot text-[clamp(1.4rem,3vw,2.4rem)] leading-tight tracking-[-0.01em] text-cream/70">
            est là pour ça.
          </span>
        </div>
      </div>

      {/* Parallax hand-off veil — corridor melts into the void. */}
      <div
        ref={veilRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 bg-void"
        style={{ opacity: 0 }}
      />
    </section>
  );
}
