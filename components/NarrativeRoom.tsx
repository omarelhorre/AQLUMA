"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";
import PaperArtifact from "@/components/PaperArtifact";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";

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
    <div className={`mb-8 flex items-center gap-3.5 ${center ? "justify-center" : ""}`}>
      <span
        aria-hidden
        className="h-px w-12 flex-shrink-0"
        style={{ background: "linear-gradient(90deg, rgba(232,178,58,0.75), rgba(232,178,58,0))" }}
      />
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
  const orbRef = useRef<HTMLSpanElement>(null);

  const words = fr(VOIE).split(" ").filter(Boolean);

  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Clauses — both occupy the SAME centred spot (a sticky stage holds them
      // in place); scroll crossfades clause 1 → clause 2 through a blur, so the
      // first transforms into the second without moving.
      const region = clauseRegionRef.current;
      const c1 = clauseRefs.current[0];
      const c2 = clauseRefs.current[1];
      if (region && c1 && c2) {
        // A single progress crossfades the two sentences in the SAME spot: as
        // clause 1 blurs + fades out, clause 2 sharpens + fades in (both ~50% at
        // the midpoint) — one sentence morphs into the other, no movement.
        const apply = (p: number) => {
          const s = smoothstep(0.22, 0.72, p);
          c1.style.opacity = String(1 - s);
          c1.style.filter = `blur(${s * 16}px)`;
          c2.style.opacity = String(s);
          c2.style.filter = `blur(${(1 - s) * 16}px)`;
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
          if (orbRef.current) {
            orbRef.current.style.opacity = String(gsap.utils.clamp(0, 1, prog * 1.6));
            orbRef.current.style.transform = `scale(${0.5 + Math.min(1, prog * 1.4) * 0.5})`;
          }
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
    <section id="constat" className="relative w-full overflow-hidden bg-void">
      <div className="shell">
        {/* ── Le constat ── */}
        <Beat>
          <Reveal className="max-w-4xl">
            <Label>Le constat</Label>
            <h2 className="text-balance font-didot text-[clamp(2.4rem,5.4vw,4.6rem)] font-normal leading-[1.06] tracking-[-0.02em] text-cream">
              {fr("Vous voyez votre adolescent copier-coller des réponses sans même les lire.")}
            </h2>
            <p className="mt-10 max-w-[46ch] text-pretty font-satoshi text-[clamp(1.2rem,1.7vw,1.65rem)] leading-relaxed text-cream/60">
              {fr("L'IA est devenue un raccourci qui éteint l'effort. On croit qu'il travaille. Il ne fait que déléguer.")}
            </p>
          </Reveal>
        </Beat>

        {/* ── Une nouvelle réalité — statement + the library note ── */}
        <Beat>
          <div className="grid items-center gap-16 md:grid-cols-[1.1fr_0.9fr]">
            <Reveal className="max-w-2xl">
              <Label>Une nouvelle réalité</Label>
              <p className="text-balance font-didot text-[clamp(1.9rem,3.4vw,3.1rem)] font-normal leading-[1.16] tracking-[-0.015em] text-cream">
                {fr("Ces outils sont déjà dans sa chambre. La question n'est plus s'il les utilisera, mais comment.")}
              </p>
              <p className="mt-8 max-w-[44ch] font-satoshi text-[clamp(1.1rem,1.5vw,1.4rem)] leading-relaxed text-cream/55">
                {fr("Il les utilise pour ses devoirs, ses exposés, ses questions.")}
              </p>
            </Reveal>

            <Parallax speed={0.22} className="flex justify-center md:justify-end">
              <Reveal y={48}>
                <PaperArtifact variant="note" fastener="tape" tilt={-2.2} className="max-w-[27rem]">
                  <blockquote className="text-balance font-didot text-[clamp(1.6rem,2.4vw,2.1rem)] font-normal leading-[1.3]">
                    {fr('"C\'est comme donner les clés d\'une bibliothèque immense à quelqu\'un qui n\'a pas appris à lire."')}
                  </blockquote>
                </PaperArtifact>
              </Reveal>
            </Parallax>
          </div>
        </Beat>

        {/* ── La fausse solution — both clauses share one centred spot; scroll
            crossfades clause 1 → clause 2 in place (sticky stage, no pin). ── */}
        {reduced ? (
          <Beat className="justify-center text-center">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-12">
              <Label center>La fausse solution</Label>
              {CLAUSES.map((c, i) => (
                <p key={i} className="mx-auto max-w-[22ch] font-didot text-[clamp(2rem,4.2vw,3.6rem)] font-normal leading-[1.18] text-cream/55">
                  <span className="text-cream">{fr(c[0])}</span> {fr(c[1])}
                </p>
              ))}
            </div>
          </Beat>
        ) : (
          <div ref={clauseRegionRef} className="relative h-[200vh]">
            <div className="sticky top-0 flex h-screen flex-col items-center justify-center text-center">
              <Label center>La fausse solution</Label>
              <div className="relative mt-10 flex min-h-[3.6em] w-full max-w-4xl items-center justify-center">
                {CLAUSES.map((c, i) => (
                  <p
                    key={i}
                    ref={(el) => { clauseRefs.current[i] = el; }}
                    className="absolute inset-0 mx-auto flex max-w-[22ch] items-center justify-center font-didot text-[clamp(2rem,4.2vw,3.6rem)] font-normal leading-[1.18] text-cream/55 will-change-[filter,transform,opacity]"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    <span>
                      <span className="text-cream">{fr(c[0])}</span> {fr(c[1])}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── La voie — pulsing orb + word-by-word reveal ── */}
        <Beat className="justify-center text-center">
          <div className="mx-auto flex max-w-5xl flex-col items-center">
            {/* Pulsing gold journey-orb. */}
            <span ref={orbRef} aria-hidden className="relative mb-12 block h-4 w-4" style={{ opacity: reduced ? 1 : 0 }}>
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, #FFF6DC 0%, #F0C25A 48%, rgba(232,178,58,0) 78%)",
                  boxShadow: "0 0 30px 10px rgba(232,178,58,0.55)",
                }}
              />
              {!reduced ? (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(240,194,90,0.6) 0%, rgba(232,178,58,0) 70%)",
                    animation: "voie-orb-pulse 2.4s cubic-bezier(0.16,1,0.3,1) infinite",
                  }}
                />
              ) : null}
            </span>

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
          </div>
        </Beat>
      </div>
    </section>
  );
}
