"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";
import PaperArtifact from "@/components/PaperArtifact";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Section 2 — a pinned cinematic stage. The viewport holds still while the
 * narrative moves through it on scroll (the elements scroll, not the page):
 *   1. Le constat            — the scene (left)
 *   2. Une nouvelle réalité   — narration (left) + the library note sliding in
 *                              from the right (the paper-artifact pattern)
 *   3. La fausse solution     — centred, bold; sentence 1 blur-morphs into
 *                              sentence 2 ("accepter" greyed — a bad acceptance)
 *   4. Il faut une troisième voie — resolves in vivid gold, a warm glow blooming
 *                              up: AQLUMA arriving to save the situation.
 *
 * Crash-safe mount (GSAP-pin × React-removeChild lesson): both the static and
 * the pinned subtrees stay mounted, only `display` toggles, and the SSR default
 * is the STATIC branch. The pin only runs ≥1024px with motion allowed.
 */

const BLUR_HIDDEN = { opacity: 0, filter: "blur(14px)", y: 36 };
const BLUR_SHOWN = { opacity: 1, filter: "blur(0px)", y: 0 };

function Label({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`mb-7 flex items-center gap-3.5 ${align === "center" ? "justify-center" : ""}`}
    >
      <span
        aria-hidden
        className="h-px w-10 flex-shrink-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(232,178,58,0.75), rgba(232,178,58,0))",
        }}
      />
      <span className="font-satoshi text-[0.95rem] font-semibold tracking-tight text-gold/90">
        {children}
      </span>
    </div>
  );
}

export default function NarrativeRoom() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const constatRef = useRef<HTMLDivElement>(null);
  const realiteRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const fs1Ref = useRef<HTMLDivElement>(null);
  const fs2Ref = useRef<HTMLDivElement>(null);
  const voieRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const [canAnimate, setCanAnimate] = useState(false);
  useIsoLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setCanAnimate(mq.matches && !rm.matches);
    apply();
    mq.addEventListener("change", apply);
    rm.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      rm.removeEventListener("change", apply);
    };
  }, []);
  const still = !canAnimate;

  useEffect(() => {
    if (
      !canAnimate ||
      !window.matchMedia("(min-width: 1024px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const stage = stageRef.current;
    if (!stage) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(constatRef.current, BLUR_SHOWN);
      gsap.set([realiteRef.current, fs1Ref.current, fs2Ref.current, voieRef.current], BLUR_HIDDEN);
      gsap.set(noteRef.current, { opacity: 0, x: 110, filter: "blur(14px)" });
      gsap.set(glowRef.current, { opacity: 0 });

      const reveal = (el: gsap.TweenTarget, at: number, dur = 0.05) =>
        tl.to(el, { ...BLUR_SHOWN, duration: dur }, at);
      const dissolve = (el: gsap.TweenTarget, at: number, dur = 0.05) =>
        tl.to(
          el,
          { opacity: 0, filter: "blur(14px)", y: -36, ease: "power2.in", duration: dur },
          at,
        );

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=520%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // 1 · Le constat holds, then lifts away.
      dissolve(constatRef.current, 0.12);

      // 2 · Une nouvelle réalité rises; the note slides in from the right.
      reveal(realiteRef.current, 0.16);
      tl.to(noteRef.current, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.08 }, 0.18);
      dissolve(realiteRef.current, 0.34);
      tl.to(noteRef.current, { opacity: 0, x: -48, filter: "blur(10px)", ease: "power2.in", duration: 0.06 }, 0.34);

      // 3 · La fausse solution — sentence 1 blur-morphs into sentence 2.
      reveal(fs1Ref.current, 0.42);
      dissolve(fs1Ref.current, 0.56);
      reveal(fs2Ref.current, 0.58);
      dissolve(fs2Ref.current, 0.74);

      // 4 · Il faut une troisième voie — vivid, with the warm glow blooming up.
      tl.to(glowRef.current, { opacity: 1, ease: "power1.out", duration: 0.12 }, 0.76);
      reveal(voieRef.current, 0.78, 0.08);
    }, stage);

    return () => ctx.revert();
  }, [canAnimate]);

  // Shared copy fragments.
  const fausse2 = (
    <>
      {fr("Lui donner un accès libre ? C'est ")}
      <span className="text-stone">accepter</span>
      {fr(" qu'il arrête de penser.")}
    </>
  );

  return (
    <section ref={sectionRef} id="constat" className="relative w-full bg-void" aria-label="Le constat">
      {/* ── STATIC — SSR / phones-tablets / reduced motion: vertical stack ── */}
      <div
        className="shell flex-col gap-28 py-32 md:gap-40"
        style={{ display: still ? "flex" : "none" }}
      >
        <div className="max-w-3xl">
          <Label>Le constat</Label>
          <h2 className="text-balance font-didot text-[clamp(1.9rem,4vw,3.3rem)] font-normal leading-[1.12] tracking-[-0.015em] text-cream">
            {fr("Vous voyez votre adolescent copier-coller des réponses sans même les lire.")}
          </h2>
          <p className="mt-8 max-w-[52ch] text-pretty font-satoshi text-[clamp(1.05rem,1.4vw,1.3rem)] leading-relaxed text-cream/65">
            {fr("L'IA est devenue un raccourci qui éteint l'effort. On croit qu'il travaille. Il ne fait que déléguer.")}
          </p>
        </div>

        <div className="grid items-center gap-14 md:grid-cols-2">
          <div className="max-w-xl">
            <Label>Une nouvelle réalité</Label>
            <p className="text-pretty font-satoshi text-[clamp(1.1rem,1.5vw,1.45rem)] leading-relaxed text-cream/75">
              {fr("Ces outils sont déjà dans sa chambre. Il les utilise pour ses devoirs, ses exposés, ses questions. La question n'est plus s'il les utilisera, mais comment.")}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <PaperArtifact variant="note" fastener="tape" tilt={-2.2} className="max-w-[25rem]">
              <blockquote className="text-balance font-didot text-[clamp(1.35rem,2vw,1.7rem)] font-normal leading-[1.32]">
                {fr('"C\'est comme donner les clés d\'une bibliothèque immense à quelqu\'un qui n\'a pas appris à lire."')}
              </blockquote>
            </PaperArtifact>
          </div>
        </div>

        <div className="mx-auto max-w-4xl text-center font-didot text-[clamp(1.6rem,3vw,2.5rem)] font-normal leading-[1.2] text-cream/85">
          <p><span className="font-[700]">{fr("Lui interdire l'accès ?")}</span><br />{fr("C'est le couper du monde qui vient.")}</p>
          <p className="mt-7">{fausse2}</p>
          <p className="mt-10 font-[700]" style={{ color: "#E8B23A" }}>{fr("Il faut une troisième voie.")}</p>
        </div>
      </div>

      {/* ── PINNED STAGE (≥1024px, motion allowed) ── */}
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden"
        style={{ display: still ? "none" : "block" }}
      >
        {/* warm salvation glow, blooms in under the troisième voie */}
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 52%, rgba(232,178,58,0.20), rgba(201,97,46,0.10) 38%, rgba(8,10,12,0) 72%)",
            opacity: 0,
          }}
        />

        {/* 1 · Le constat (left) */}
        <div ref={constatRef} className="absolute inset-0 z-10 flex items-center will-change-[transform,opacity,filter]">
          <div className="shell">
            <div className="max-w-3xl">
              <Label>Le constat</Label>
              <h2 className="text-balance font-didot text-[clamp(2rem,4vw,3.6rem)] font-normal leading-[1.12] tracking-[-0.015em] text-cream">
                {fr("Vous voyez votre adolescent copier-coller des réponses sans même les lire.")}
              </h2>
              <p className="mt-8 max-w-[52ch] text-pretty font-satoshi text-[clamp(1.05rem,1.4vw,1.3rem)] leading-relaxed text-cream/65">
                {fr("L'IA est devenue un raccourci qui éteint l'effort. On croit qu'il travaille. Il ne fait que déléguer.")}
              </p>
            </div>
          </div>
        </div>

        {/* 2 · Une nouvelle réalité — text left, note sliding from the right */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="shell flex w-full items-center justify-between gap-12">
            <div ref={realiteRef} className="max-w-xl will-change-[transform,opacity,filter]">
              <Label>Une nouvelle réalité</Label>
              <p className="text-pretty font-satoshi text-[clamp(1.1rem,1.5vw,1.45rem)] leading-relaxed text-cream/75">
                {fr("Ces outils sont déjà dans sa chambre. Il les utilise pour ses devoirs, ses exposés, ses questions. La question n'est plus s'il les utilisera, mais comment.")}
              </p>
            </div>
            <div ref={noteRef} className="hidden flex-shrink-0 will-change-[transform,opacity,filter] md:block">
              <PaperArtifact variant="note" fastener="tape" tilt={-2.2} className="max-w-[24rem]">
                <blockquote className="text-balance font-didot text-[clamp(1.3rem,1.9vw,1.65rem)] font-normal leading-[1.32]">
                  {fr('"C\'est comme donner les clés d\'une bibliothèque immense à quelqu\'un qui n\'a pas appris à lire."')}
                </blockquote>
              </PaperArtifact>
            </div>
          </div>
        </div>

        {/* 3a · La fausse solution — sentence 1 (centred, bold) */}
        <div ref={fs1Ref} className="absolute inset-0 z-10 flex items-center justify-center px-8 text-center will-change-[transform,opacity,filter]">
          <p className="max-w-4xl font-didot text-[clamp(2rem,4vw,3.4rem)] font-normal leading-[1.2] tracking-[-0.012em] text-cream">
            <span className="font-[700]">{fr("Lui interdire l'accès ?")}</span>
            <br />
            <span className="text-cream/80">{fr("C'est le couper du monde qui vient.")}</span>
          </p>
        </div>

        {/* 3b · La fausse solution — sentence 2 (accepter greyed) */}
        <div ref={fs2Ref} className="absolute inset-0 z-10 flex items-center justify-center px-8 text-center will-change-[transform,opacity,filter]">
          <p className="max-w-4xl font-didot text-[clamp(2rem,4vw,3.4rem)] font-normal leading-[1.2] tracking-[-0.012em] text-cream">
            <span className="font-[700]">{fr("Lui donner un accès libre ?")}</span>
            <br />
            <span className="text-cream/80">{fr("C'est ")}<span className="text-stone">accepter</span>{fr(" qu'il arrête de penser.")}</span>
          </p>
        </div>

        {/* 4 · Il faut une troisième voie — vivid resolution */}
        <div ref={voieRef} className="absolute inset-0 z-20 flex items-center justify-center px-8 text-center will-change-[transform,opacity,filter]">
          <p
            className="font-didot text-[clamp(2.4rem,5vw,4.4rem)] font-normal leading-[1.08] tracking-[-0.015em]"
            style={{ color: "#F0C04A", textShadow: "0 0 40px rgba(232,178,58,0.45)" }}
          >
            {fr("Il faut une troisième voie.")}
          </p>
        </div>
      </div>
    </section>
  );
}
