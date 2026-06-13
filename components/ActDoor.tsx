"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * ACT I — The Door.
 *
 * The door clip is a STILL, dark, atmospheric backdrop — never scrubbed, never
 * flashed. One pinned ScrollTrigger drives a purely typographic choreography on
 * the left:
 *
 *   intro → four traits, one strictly after another (reveal · hold · clear,
 *   with an empty beat between each) → climax "AQLUMA est là".
 *
 * On the climax the brand name carries the most weight (large cream Didot), and
 * a terracotta brushstroke paints itself in above it via a stroke-dashoffset
 * sweep the instant the line reaches full opacity.
 *
 * All copy + progression markers are locked to the left gutter (ragged-left,
 * leaving the right free for the briefing media). Reveals are blur → sharp, no
 * clipping. Reduced motion: the climax shows statically, fully resolved.
 */

const TRAITS = [
  { num: "I", word: "Créativité" },
  { num: "II", word: "Esprit critique" },
  { num: "III", word: "Méthode" },
  { num: "IV", word: "Flow" },
];

const BLUR_HIDDEN = { opacity: 0, filter: "blur(14px)", y: 22 };
const BLUR_SHOWN = { opacity: 1, filter: "blur(0px)", y: 0 };

// Progress at which the door clip starts opening — it stays frozen on its first
// frame for the whole text choreography, then plays out as the closing beat.
const DOOR_START = 0.78;

export default function ActDoor() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const climaxRef = useRef<HTMLDivElement>(null);
  const traitsRef = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    if (video) video.pause();

    const traits = traitsRef.current.filter(Boolean) as HTMLDivElement[];

    const ctx = gsap.context(() => {
      // Initial states — line1 sharp on load, everything else in soft focus.
      gsap.set(line1Ref.current, BLUR_SHOWN);
      gsap.set([line2Ref.current, climaxRef.current], BLUR_HIDDEN);
      gsap.set(traits, BLUR_HIDDEN);

      // Eased scrub of the door clip toward scroll progress (final phase only).
      const seek = video
        ? gsap.quickTo(video, "currentTime", { duration: 0.25, ease: "power3.out" })
        : null;

      // ONE ScrollTrigger owns the pin; the timeline rides it. The video stays
      // frozen on frame 0 until DOOR_START, then opens out.
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
            const p = self.progress;
            const vp = p <= DOOR_START ? 0 : (p - DOOR_START) / (1 - DOOR_START);
            seek(vp * video.duration);
          },
        },
      });

      const reveal = (el: gsap.TweenTarget, at: number, dur = 0.035) =>
        tl.to(el, { ...BLUR_SHOWN, duration: dur }, at);
      const dissolve = (el: gsap.TweenTarget, at: number, dur = 0.04) =>
        tl.to(
          el,
          { opacity: 0, filter: "blur(14px)", y: -22, ease: "power2.in", duration: dur },
          at
        );

      // ── Intro ──
      dissolve(line1Ref.current, 0.04);
      reveal(line2Ref.current, 0.09);
      dissolve(line2Ref.current, 0.17);

      // ── Four traits, strictly sequential ──
      // Each owns a slot wide enough that it fully clears (plus an empty beat)
      // before the next one arrives — same on-screen position, never doubled.
      const tStart = 0.22;
      const tStep = 0.115;
      traits.forEach((t, i) => {
        const at = tStart + i * tStep;
        reveal(t, at);
        dissolve(t, at + 0.05); // clears ~0.03 before the next reveal
      });
      // trait IV ("Flow") is fully gone by ~0.65.

      // ── Climax: bring the destination frame in. ──
      reveal(climaxRef.current, 0.66, 0.05);

      // ── Exit: the door opens (video scrubs, see onUpdate) while the climax
      //    dissolves into it. ──
      dissolve(climaxRef.current, 0.9, 0.06);
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-void"
      aria-label="AQLUMA — introduction"
    >
      {/* Dark backdrop — the door clip is held on frame 0 through the whole
          text sequence, then scrubs open as the closing beat. */}
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

      {/* Left-weighted vignette so ragged-left copy reads on the dark frame. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,10,12,0.72) 0%, rgba(8,10,12,0.32) 32%, rgba(8,10,12,0) 60%), radial-gradient(120% 100% at 0% 50%, rgba(8,10,12,0) 40%, rgba(8,10,12,0.5) 100%)",
        }}
      />

      {/* All choreography locked to the left gutter. */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Intro line 1 (sharp on load). */}
        <LeftBeat innerRef={line1Ref} initialOpacity={reduced ? 0 : 1}>
          <p className="font-didot text-[clamp(1.7rem,3.6vw,3.2rem)] leading-[1.12] tracking-display text-cream">
            Bienvenu chez AQLUMA.
          </p>
        </LeftBeat>

        {/* Intro line 2. */}
        <LeftBeat innerRef={line2Ref} initialOpacity={0}>
          <p className="font-didot text-[clamp(1.55rem,3.3vw,2.95rem)] leading-[1.16] tracking-display text-cream/90">
            Ici votre adolescent apprend à devenir.
          </p>
        </LeftBeat>

        {/* The four traits — identical position + transition, one at a time.
            The roman-numeral marker + tick are locked to the left edge. */}
        {TRAITS.map((t, i) => (
          <LeftBeat
            key={t.word}
            innerRef={(el) => {
              traitsRef.current[i] = el;
            }}
            initialOpacity={0}
          >
            <span className="kicker mb-3 block text-[10px] tabular-nums text-clay/80">
              {t.num}
            </span>
            <span className="block h-px w-10 bg-cream/25" />
            <span className="mt-4 block font-didot text-[clamp(2rem,4.6vw,3.9rem)] leading-none tracking-display text-cream">
              {t.word}
            </span>
          </LeftBeat>
        ))}

        {/* Climax — the destination frame. AQLUMA carries the weight. */}
        <LeftBeat innerRef={climaxRef} initialOpacity={reduced ? 1 : 0}>
          <span className="block font-didot text-[clamp(2.9rem,7.4vw,6.2rem)] font-normal leading-[0.96] tracking-display text-cream">
            AQLUMA
          </span>
          <span className="mt-3 block font-didot text-[clamp(1.4rem,3vw,2.4rem)] leading-tight tracking-display text-cream/70">
            est là.
          </span>
        </LeftBeat>
      </div>
    </section>
  );
}

/**
 * A reveal locked to the left gutter, vertically centred — every beat shares
 * this position so the sequential transitions stay perfectly registered.
 */
function LeftBeat({
  innerRef,
  initialOpacity,
  children,
}: {
  innerRef: React.Ref<HTMLDivElement>;
  initialOpacity: number;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={innerRef}
      style={{ opacity: initialOpacity }}
      className="absolute left-[6vw] top-1/2 max-w-[min(86vw,38rem)] -translate-y-1/2 text-left will-change-[transform,opacity,filter]"
    >
      {children}
    </div>
  );
}
