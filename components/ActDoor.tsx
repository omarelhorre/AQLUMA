"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

const WORDS = ["Créativité", "Esprit critique", "Méthode", "Flow"];

// Progress fraction at which the door starts opening.
const DOOR_START = 0.5;

export default function ActDoor() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const bloomRef  = useRef<HTMLDivElement>(null);
  const line1Ref  = useRef<HTMLParagraphElement>(null);
  const line2Ref  = useRef<HTMLParagraphElement>(null);
  const brandRef  = useRef<HTMLHeadingElement>(null);
  const wordsRef  = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced   = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    const video   = videoRef.current;
    if (!section || !video) return;

    gsap.registerPlugin(ScrollTrigger);
    video.pause();

    const words = wordsRef.current.filter(Boolean) as HTMLSpanElement[];

    const ctx = gsap.context(() => {
      // Initial states — inside context so ctx.revert() cleans them up.
      // line1 is NOT hidden: it must be visible the moment the page loads.
      gsap.set([line2Ref.current, brandRef.current], { opacity: 0, y: 26 });
      gsap.set(words, { opacity: 0, y: 18 });
      gsap.set(bloomRef.current, { opacity: 0, scale: 0.55 });

      const seek = gsap.quickTo(video, "currentTime", {
        duration: 0.25,
        ease: "power3.out",
      });

      // ONE ScrollTrigger owns the pin. The timeline is attached to it so
      // there is no second competing trigger — that was the bug.
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=360%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const p  = self.progress;
            const vp = p <= DOOR_START ? 0 : (p - DOOR_START) / (1 - DOOR_START);
            if (video.duration) seek(vp * video.duration);
          },
        },
      });

      // line1 is already visible — first scroll action fades it out.
      tl.to(line1Ref.current,  { opacity: 0, y: -22, duration: 0.04 }, 0.12)
        .to(line2Ref.current,  { opacity: 1, y: 0,   duration: 0.05 }, 0.17)
        .to(line2Ref.current,  { opacity: 0, y: -22, duration: 0.04 }, 0.28);

      // Four traits: sequential fade-in / fade-out cadence.
      const wStart = 0.30;
      const wSpan  = 0.045;
      words.forEach((w, i) => {
        const at = wStart + i * wSpan;
        tl.to(w, { opacity: 1, y: 0,   duration: wSpan * 0.42 }, at)
          .to(w, { opacity: 0, y: -14, duration: wSpan * 0.42 }, at + wSpan * 0.55);
      });

      // Brand moment just before door opens.
      tl.to(brandRef.current, { opacity: 1, y: 0,   duration: 0.05 }, 0.46)
        .to(brandRef.current, { opacity: 0, y: -22, duration: 0.05 }, 0.58);

      // Terracotta bloom at the end — dissolves into BriefingHero.
      tl.to(bloomRef.current, {
        opacity: 1,
        scale: 1.55,
        ease: "power2.in",
        duration: 0.16,
      }, 0.86);
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-void"
      aria-label="AQLUMA — introduction"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/door.mp4"
        poster="/video/door-poster.jpg"
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
      />

      {/* Terracotta bloom that bridges into BriefingHero. */}
      <div
        ref={bloomRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 will-change-[transform,opacity]"
        style={{
          background:
            "radial-gradient(100% 100% at 50% 44%, rgba(232,178,58,0.55) 0%, rgba(201,97,46,0.5) 22%, rgba(139,58,26,0.4) 42%, rgba(8,10,12,0.88) 72%, rgba(8,10,12,1) 100%)",
        }}
      />

      {/* Legibility wash. */}
      <div className="pointer-events-none absolute inset-0 z-[15] bg-gradient-to-b from-void/55 via-void/20 to-void/65" />

      {/* Text reveals — stacked, one visible at a time. */}
      <div className="pointer-events-none relative z-10 flex h-full items-center justify-center px-6 text-center">
        {/* line1 starts at full opacity via CSS — no GSAP initial set */}
        <p
          ref={line1Ref}
          className="absolute max-w-[22ch] font-didot text-[clamp(1.9rem,4.6vw,3.6rem)] leading-[1.12] tracking-display text-cream"
        >
          Bienvenu chez AQLUMA.
        </p>

        <p
          ref={line2Ref}
          className="absolute max-w-[24ch] font-didot text-[clamp(1.7rem,4.2vw,3.2rem)] leading-[1.14] tracking-display text-cream/90"
        >
          Ici votre adolescent apprend à devenir.
        </p>

        <h1 ref={brandRef} className="absolute flex flex-col items-center gap-3">
          <span className="kicker text-[11px] text-gold/80">AQLUMA</span>
          <span className="font-didot text-[clamp(2.4rem,6vw,5rem)] leading-[1.02] tracking-display text-cream">
            est là.
          </span>
        </h1>

        {/* Four traits — each stacked absolutely, shown one at a time. */}
        <div className="absolute flex items-center justify-center">
          {WORDS.map((w, i) => (
            <span
              key={w}
              ref={(el) => { wordsRef.current[i] = el; }}
              className="absolute whitespace-nowrap font-didot text-[clamp(2rem,5vw,4rem)] leading-none tracking-display text-cream/95"
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
