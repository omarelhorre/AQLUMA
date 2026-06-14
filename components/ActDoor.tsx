"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

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

// Door stays frozen on frame 0 for the whole text sequence, then opens here.
const DOOR_START = 0.78;

export default function ActDoor() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const line1Ref   = useRef<HTMLDivElement>(null);
  const line2Ref   = useRef<HTMLDivElement>(null);
  const itemsRef   = useRef<(HTMLDivElement | null)[]>([]);
  const climaxRef  = useRef<HTMLDivElement>(null);
  const reduced    = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    const video   = videoRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    if (video) video.pause();

    const items = itemsRef.current.filter(Boolean) as HTMLDivElement[];

    const ctx = gsap.context(() => {
      gsap.set(line1Ref.current, BLUR_SHOWN);
      gsap.set([line2Ref.current, climaxRef.current], BLUR_HIDDEN);
      gsap.set(items, BLUR_HIDDEN);

      const seek = video
        ? gsap.quickTo(video, "currentTime", { duration: 0.25, ease: "power3.out" })
        : null;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=420%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate(self) {
            if (!seek || !video || !video.duration) return;
            const p  = self.progress;
            const vp = p <= DOOR_START ? 0 : (p - DOOR_START) / (1 - DOOR_START);
            seek(vp * video.duration);
          },
        },
      });

      const reveal = (el: gsap.TweenTarget, at: number, dur = 0.04) =>
        tl.to(el, { ...BLUR_SHOWN, duration: dur }, at);
      const dissolve = (el: gsap.TweenTarget, at: number, dur = 0.04) =>
        tl.to(el, { opacity: 0, filter: "blur(14px)", y: -22, ease: "power2.in", duration: dur }, at);

      // ── Intro ──
      dissolve(line1Ref.current, 0.04);

      // "…apprend à devenir" reveals and LOCKS at full opacity (no early exit).
      reveal(line2Ref.current, 0.09);

      // ── Traits (scattered, right side): fade in one after another while
      //    "à devenir" stays on screen. ──
      const tStart = 0.27;
      const tStep  = 0.07;
      items.forEach((it, i) => reveal(it, tStart + i * tStep, 0.05));

      // ── …then the whole 5-element block ("à devenir" + the 4 traits) fades
      //    out together as one unified block, before the climax. ──
      dissolve([line2Ref.current, ...items], 0.62, 0.06);

      // ── Climax ──
      reveal(climaxRef.current, 0.68, 0.05);
      dissolve(climaxRef.current, 0.90, 0.05);
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

        {/* Line 1 — on load (left) */}
        <Beat side="left" innerRef={line1Ref} initialOpacity={reduced ? 0 : 1}>
          <p className="font-didot text-[clamp(1.7rem,3.6vw,3.2rem)] leading-[1.12] tracking-display text-cream">
            Bienvenu chez AQLUMA.
          </p>
        </Beat>

        {/* Line 2 — editorial two-line treatment (left) */}
        <Beat side="left" innerRef={line2Ref} initialOpacity={0}>
          <p className="font-didot leading-[1.12] tracking-display">
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
            className="absolute font-didot leading-[1.04] tracking-display text-cream will-change-[transform,opacity,filter]"
          >
            {t.word}
          </div>
        ))}

        {/* Climax — AQLUMA in brand clay/orange (left) */}
        <Beat side="left" innerRef={climaxRef} initialOpacity={reduced ? 1 : 0}>
          <span
            className="block font-didot text-[clamp(2.9rem,7.4vw,6.2rem)] font-normal leading-[0.96] tracking-display"
            style={{ color: "#C9612E" }}
          >
            AQLUMA
          </span>
          <span className="mt-3 block font-didot text-[clamp(1.4rem,3vw,2.4rem)] leading-tight tracking-display text-cream/70">
            est là pour ça.
          </span>
        </Beat>

      </div>
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
