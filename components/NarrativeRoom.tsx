"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";
import PaperNote from "@/components/PaperNote";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import ScrollFill from "@/components/ScrollFill";
import CopierCue from "@/components/CopierCue";
import { AnnotationMark } from "@/components/Annotate";
import MacContextMenu from "@/components/MacContextMenu";

/**
 * SECTION 1 — Le constat → Une nouvelle réalité → La fausse solution → la voie.
 *
 * Normal vertical-scroll scrollytelling: each beat is a full-height, centred
 * moment, so the reader meets ONE idea at a time. The two "fausse solution"
 * clauses are centred and stacked, each pulling into focus from a blur as it
 * scrolls in. The finale « Il faut une troisième voie » lands word-by-word
 * (rise + blur, the ProgramManifesto mechanic) beneath a pulsing gold journey-
 * orb. No pin. Reduced motion → everything static.
 */

const VOIE = "Il faut une troisième voie.";

// Fill targets = each paragraph's own resting colour, so the write-in changes the
// motion, never the design. GHOST is the faint impression before the sweep.
const CREAM = "rgb(247,244,239)";
const CREAM_60 = "rgba(247,244,239,0.6)";
const GHOST = "rgba(247,244,239,0.12)";
// Stable (module-scoped) so ScrollFill's memo/effect don't churn on re-render.
const COPIER_RE = /copier/i;

const CLAUSES: [string, string][] = [
  ["Lui interdire l'accès ?", "C'est le couper du monde qui vient."],
  ["Lui donner un accès libre ?", "C'est accepter qu'il arrête de penser."],
];

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function Label({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`mb-8 flex items-center ${center ? "justify-center" : ""}`}>
      <span className="font-satoshi text-[1.05rem] font-semibold tracking-tight text-gold/90">
        {children}
      </span>
    </div>
  );
}

function Beat({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-[88vh] w-full items-center ${className}`}>
      <div className="w-full">{children}</div>
    </div>
  );
}

export default function NarrativeRoom() {
  const reduced = useReducedMotion();
  const clauseRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const clauseRegionRef = useRef<HTMLDivElement>(null);
  const voieLineRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const words = fr(VOIE).split(" ").filter(Boolean);

  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Clauses — a sticky stage holds them centred while scroll drives a
      // HORIZONTAL hand-off: clause 1 slides fully off the left as clause 2
      // arrives from the right. The two sit exactly one viewport apart, so the
      // outgoing sentence leaves the page completely (no gap, no blur).
      const region = clauseRegionRef.current;
      const c1 = clauseRefs.current[0];
      const c2 = clauseRefs.current[1];
      if (region && c1 && c2) {
        // Progress → a single left shift shared by both clauses. clause 1 travels
        // 0 → -100vw (fully off the left edge); clause 2 travels +100vw → 0 (in
        // from the right). Eased ends give each sentence a beat to read before /
        // after it moves. The section's `overflow-x-clip` clips the exit.
        const apply = (p: number) => {
          const s = smoothstep(0.1, 0.9, p);
          const w = window.innerWidth || 1200;
          c1.style.transform = `translate3d(${-s * w}px,0,0)`;
          c2.style.transform = `translate3d(${(1 - s) * w}px,0,0)`;
        };
        ScrollTrigger.create({
          trigger: region,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
          invalidateOnRefresh: true,
        });
        apply(0);
      }

      // « voie » — word-by-word rise + blur, staggered as the line scrolls in.
      const els = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
      const line = voieLineRef.current;
      if (line && els.length) {
        gsap.set(els, { opacity: 0 });
        const n = els.length;
        const spread = 0.55; // how staggered the words are (0 = together)
        const apply = () => {
          const vh = window.innerHeight;
          const r = line.getBoundingClientRect();
          const center = (r.top + r.bottom) / 2 / vh;
          const prog = gsap.utils.clamp(0, 1, (0.9 - center) / 0.42);
          for (let i = 0; i < n; i++) {
            const start = (i / n) * spread;
            const v = gsap.utils.clamp(0, 1, (prog - start) / (1 - spread));
            const dir = i % 2 === 0 ? -1 : 1;
            els[i].style.opacity = String(v);
            els[i].style.transform = `translateY(${(1 - v) * dir * 64}px)`;
            els[i].style.filter = v < 1 ? `blur(${(1 - v) * 7}px)` : "blur(0px)";
          }
          // The compass / orb itself is the shared <JourneyThread> (a fixed mark
          // that flies from here onto La Méthode's rail); this section only owns
          // the words and the #journey-voie anchor it homes to.
        };
        ScrollTrigger.create({
          trigger: line,
          start: "top bottom",
          end: "bottom top",
          onUpdate: apply,
          onRefresh: apply,
          invalidateOnRefresh: true,
        });
        apply();
      }
    });

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="constat" className="relative w-full overflow-x-clip">
      <div className="shell">
        {/* ── Le constat — signature write-in; « copier » reads as a selected word
            (CopierCue), with the native macOS menu resting in the right negative
            space of the headline (xl+), pointer poised over « Copier ». ── */}
        <Beat>
          <div className="relative">
            <div className="max-w-4xl">
              <Reveal>
                <Label>Le constat</Label>
              </Reveal>
            <ScrollFill
              as="h2"
              className="text-balance font-didot text-[clamp(2.4rem,5.4vw,4.6rem)] font-normal leading-[1.06] tracking-[-0.02em]"
              fill={CREAM}
              ghost={GHOST}
              highlight={COPIER_RE}
              renderHighlight={(active) => <CopierCue active={active} />}
              text="Vous voyez votre adolescent copier-coller des réponses sans même les lire."
            />
            <ScrollFill
              as="p"
              className="mt-8 max-w-[46ch] text-pretty font-satoshi text-[clamp(1.08rem,1.45vw,1.32rem)] leading-relaxed"
              fill={CREAM_60}
              ghost={GHOST}
              text="L'IA est devenue un raccourci qui éteint l'effort. On croit qu'il travaille. Il ne fait que déléguer."
            />
            </div>
            {/* The OS menu lives in the headline's right negative space — bigger
                and pushed further into the space on wide (2xl) screens (xl stays
                modest — 1280 is too tight for the 4xl headline + a large menu
                without clipping). Sat a little below centre with a whisper of
                tilt, so it reads as placed on the page rather than pinned to it. */}
            <MacContextMenu className="absolute left-[61rem] top-[56%] hidden origin-left -translate-y-1/2 rotate-[-1.5deg] xl:block 2xl:scale-[2]" />
          </div>
        </Beat>

        {/* ── Une nouvelle réalité — card LEFT, statement RIGHT (write-in) ── */}
        <Beat>
          <div className="grid items-start gap-16 md:grid-cols-[0.9fr_1.1fr]">
            {/* Paper drops to the statement's baseline (past the label) so the note
                and the copy sit on one shared editorial line, not two. A whisper of
                parallax lets the paper drift against the statement for depth. */}
            <div className="flex justify-center md:justify-start md:pt-[3.75rem]">
              {/* w-full capped by max-w (not a fixed w + max-w-full): a fixed
                  width sets the grid track's min-content floor to 31rem, which
                  overflows narrow viewports — the track ignores % max-widths
                  while sizing itself. */}
              <Parallax speed={0.06} className="w-full max-w-[31rem]">
                <PaperNote className="w-full" />
              </Parallax>
            </div>

            <div className="max-w-3xl">
              <Reveal>
                <Label>Une nouvelle réalité</Label>
              </Reveal>
              {/* Same statement recipe as « Le constat » so the two narrative
                  beats carry equal weight (matched size, leading, tracking). */}
              <ScrollFill
                as="p"
                className="text-balance font-didot text-[clamp(2.4rem,5.4vw,4.6rem)] font-normal leading-[1.06] tracking-[-0.02em]"
                fill={CREAM}
                ghost={GHOST}
                highlight={/comment/i}
                renderHighlight={(active) => <AnnotationMark active={active} />}
                text="Ces outils sont déjà dans sa chambre. La question n'est plus s'il les utilisera, mais comment."
              />
              <ScrollFill
                as="p"
                className="mt-8 max-w-[46ch] text-pretty font-satoshi text-[clamp(1.08rem,1.45vw,1.32rem)] leading-relaxed"
                fill={CREAM_60}
                ghost={GHOST}
                text="Il les utilise pour ses devoirs, ses exposés, ses questions."
              />
            </div>
          </div>
        </Beat>

        {/* ── La fausse solution — both clauses share one centred spot; scroll
            crossfades clause 1 → clause 2 in place (sticky stage, no pin). ── */}
        {reduced ? (
          <Beat className="justify-center text-center">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
              <Label center>La fausse solution</Label>
              {CLAUSES.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-3.5">
                  <p className="font-didot text-[clamp(1.7rem,4.6vw,3.6rem)] font-normal leading-[1.1] text-cream sm:whitespace-nowrap">
                    {fr(c[0])}
                  </p>
                  <p className="font-didot text-[clamp(1.7rem,4.6vw,3.6rem)] font-normal leading-[1.2] text-cream/55 sm:whitespace-nowrap">
                    {fr(c[1])}
                  </p>
                </div>
              ))}
            </div>
          </Beat>
        ) : (
          <div ref={clauseRegionRef} className="relative h-[200vh]">
            <div className="sticky top-0 flex h-screen flex-col items-center justify-center text-center">
              <Label center>La fausse solution</Label>
              <div className="relative mt-10 flex min-h-[5em] w-full max-w-6xl items-center justify-center">
                {CLAUSES.map((c, i) => (
                  <p
                    key={i}
                    ref={(el) => { clauseRefs.current[i] = el; }}
                    className="absolute inset-0 mx-auto flex flex-col items-center justify-center gap-3.5 font-didot text-[clamp(1.7rem,4.6vw,3.6rem)] font-normal leading-[1.2] will-change-transform"
                    style={{ transform: i === 0 ? "translateX(0)" : "translateX(105vw)" }}
                  >
                    <span className="leading-[1.1] text-cream sm:whitespace-nowrap">{fr(c[0])}</span>
                    <span className="text-cream/55 sm:whitespace-nowrap">{fr(c[1])}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── La voie — pulsing orb + word-by-word reveal ── */}
        <Beat className="justify-center text-center">
          <div className="mx-auto flex max-w-5xl flex-col items-center">
            <p
              ref={voieLineRef}
              aria-label={fr(VOIE)}
              className="flex flex-wrap justify-center font-didot text-[clamp(3rem,8vw,7rem)] font-normal leading-[1.0] tracking-[-0.03em] text-cream"
            >
              {words.map((w, i) => {
                const isVoie = /voie/i.test(w);
                return (
                  <span
                    key={i}
                    ref={(el) => { wordRefs.current[i] = el; }}
                    aria-hidden
                    className={`mx-[0.22em] inline-block will-change-[transform,filter,opacity] ${isVoie ? "text-gold" : ""}`}
                    style={reduced ? undefined : { opacity: 0 }}
                  >
                    {w}
                  </span>
                );
              })}
            </p>

            {/* Anchor — the shared <JourneyThread> mark homes here, BELOW « voie »
                (the compass that searches for the third way), so its search→settle
                →morph plays in the visible mid-viewport — not jammed up behind the
                header — before the orb flies onto La Méthode's rail. */}
            <span id="journey-voie" aria-hidden className="mt-14 block h-[104px] w-[104px]" />
          </div>
        </Beat>
      </div>
    </section>
  );
}
