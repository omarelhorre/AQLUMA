"use client";

import { useEffect, useRef, useState } from "react";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import Kicker from "@/components/Kicker";
import ScrollFill from "@/components/ScrollFill";
import { AnnotationMark } from "@/components/Annotate";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

/**
 * POURQUOI → CE QU'AQLUMA N'EST PAS.
 *
 * Two "Pourquoi…" arguments enter in a zig-zag on parallax; their bodies use the
 * site's signature write-in (ScrollFill), so the fill follows the reading. Then
 * everything converges on « Ce qu'AQLUMA n'est pas » with six negative-space cards
 * that slowly orbit the centred title like satellites — a true circular path
 * (rotating arm + counter-rotation to stay upright), each on its own radius, depth
 * and period, so nothing loops in lockstep. Reduced motion / narrow: static grid.
 */

const CREAM_65 = "rgba(247,244,239,0.65)";
const GHOST = "rgba(247,244,239,0.12)";

const POURQUOI: { q: string; body: string; mark?: RegExp }[] = [
  {
    q: "Pourquoi 15 adolescents ?",
    body: "Le jugement ne s'enseigne pas à la chaîne. Chaque élève reçoit une attention particulière. Chaque doute est exploré. Chaque production est examinée individuellement. Ce n'est pas de la rareté artificielle : c'est une décision pédagogique.",
  },
  {
    q: "Pourquoi payer si l'IA est gratuite ?",
    body: "L'IA est gratuite. La méthode est rare. Vous payez pour un cadre, une discipline et un accompagnement humain qui transforme un outil en compétence durable. Ce que l'adolescent apprend ici, aucune interface ne peut l'enseigner.",
    // « rare » is highlighted as the fill front reaches it (same signal as « copier »).
    mark: /rare/i,
  },
];

const NEST = [
  "Un cours de codage ou de programmation.",
  "Une formation de « prompt engineer ».",
  "Une plateforme d'accès à des outils IA.",
  "Une promesse de meilleures notes.",
  "Un service de devoir assisté.",
  "Une application ou un abonnement numérique.",
];

// lg+ orbit stations around the centred title. Each card slowly revolves its own
// small circle (r), on its own period (dur), direction (cw) and apparent depth
// (scale) — see globals `aq-spin` / `aq-spin-rev`. `enter` is the radial arrival.
const ORBIT = [
  { left: "50%", top: "12%", r: 9, dur: 74, cw: true, depth: 1.02, enter: { x: 0, y: -48, rot: -3 } },
  { left: "86%", top: "31%", r: 12, dur: 92, cw: false, depth: 0.96, enter: { x: 54, y: -26, rot: 4 } },
  { left: "86%", top: "69%", r: 8, dur: 84, cw: true, depth: 1.04, enter: { x: 54, y: 26, rot: -4 } },
  { left: "50%", top: "88%", r: 11, dur: 100, cw: false, depth: 0.98, enter: { x: 0, y: 48, rot: 3 } },
  { left: "14%", top: "69%", r: 10, dur: 88, cw: true, depth: 1.0, enter: { x: -54, y: 26, rot: 4 } },
  { left: "14%", top: "31%", r: 13, dur: 96, cw: false, depth: 0.94, enter: { x: -54, y: -26, rot: -3 } },
];

/** One negative-space card — unchanged design; the warm paper stock + quiet ✕. */
function NestCard({ t }: { t: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 rounded-2xl border border-black/[0.06] bg-paper px-8 py-12 text-center shadow-[0_24px_60px_-32px_rgba(0,0,0,0.7)]">
      <span aria-hidden className="block h-6 w-6 rounded-full border border-void/15 text-void/30">
        <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden>
          <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <p className="max-w-[22ch] font-satoshi text-[clamp(1.05rem,1.2vw,1.2rem)] leading-snug text-void/75">
        {fr(t)}
      </p>
    </div>
  );
}

export default function PourquoiNest() {
  const reduced = useReducedMotion();
  const orbitRef = useRef<HTMLDivElement>(null);
  // `live` gates the arrival: cards settle in from `enter` once the system scrolls
  // into view, and the perpetual orbit is held paused until then.
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (reduced) {
      setLive(true);
      return;
    }
    const el = orbitRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.28 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <>
      {/* ── « Pourquoi » — the parti-pris arguments (id=pourquoi / « Le parti
          pris »). Its own section so the next beat's cards never bleed in. ── */}
      <section
        id="pourquoi"
        data-loupe
        className="relative w-full overflow-hidden border-t border-cream/[0.06] py-28 md:py-36"
        aria-label="Pourquoi AQLUMA"
      >
        <div className="shell flex flex-col gap-24 md:gap-32">
          {POURQUOI.map((item, i) => (
            <Parallax key={item.q} speed={0.1} className={i % 2 === 1 ? "md:ml-auto md:text-right" : ""}>
              <Reveal className="max-w-[46ch]">
                <h3 className="font-didot text-[clamp(1.75rem,3.4vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.02em] text-cream">
                  {fr(item.q)}
                </h3>
                <ScrollFill
                  as="p"
                  className={[
                    "mt-6 text-pretty font-satoshi text-[clamp(1.08rem,1.45vw,1.32rem)] leading-relaxed",
                    i % 2 === 1 ? "md:ml-auto" : "",
                  ].join(" ")}
                  fill={CREAM_65}
                  ghost={GHOST}
                  highlight={item.mark}
                  renderHighlight={item.mark ? (active) => <AnnotationMark active={active} /> : undefined}
                  text={item.body}
                />
              </Reveal>
            </Parallax>
          ))}
        </div>
      </section>

      {/* ── « Ce qu'AQLUMA n'est pas » — a distinct section (the header's « Nos
          bordures » beat), with the site's standard border divider + generous
          padding so the orbiting cards stay wholly inside their own screen and
          never bleed up into the « Pourquoi » questions above. ── */}
      <section
        id="cadre"
        data-loupe
        className="relative w-full overflow-hidden border-t border-cream/[0.06] py-36 md:py-52"
        aria-label="Ce qu'AQLUMA n'est pas"
      >
        <div className="shell">
          {/* lg+ · orbit, centred in its own tall stage */}
          <div ref={orbitRef} className="relative mx-auto hidden h-[46rem] max-w-[72rem] lg:block">
            {/* centred title */}
            <div className="absolute left-1/2 top-1/2 z-10 w-[min(28rem,60%)] -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="mb-6 flex justify-center">
                <Kicker>Le cadre</Kicker>
              </div>
              <h2 className="section-title text-cream">{fr("Ce qu'AQLUMA n'est pas")}</h2>
            </div>

            {/* orbiting cards — settle wrapper (arrival + depth) › arm (revolves the
                station) › offset (the radius) › counter (keeps the card upright) */}
            {NEST.map((t, i) => {
              const o = ORBIT[i];
              const armKf = o.cw ? "aq-spin" : "aq-spin-rev";
              const revKf = o.cw ? "aq-spin-rev" : "aq-spin";
              return (
                <div
                  key={t}
                  className="absolute w-[clamp(15rem,19vw,17rem)] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: o.left, top: o.top }}
                >
                  <div
                    className="will-change-transform"
                    style={{
                      transform: live
                        ? `translate3d(0,0,0) scale(${o.depth}) rotate(0deg)`
                        : `translate3d(${o.enter.x}px,${o.enter.y}px,0) scale(${o.depth * 0.9}) rotate(${o.enter.rot}deg)`,
                      opacity: live ? 1 : 0,
                      transition: `transform 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms, opacity 0.9s ease ${i * 90}ms`,
                    }}
                  >
                    <div
                      className="will-change-transform"
                      style={{ animation: `${armKf} ${o.dur}s linear infinite`, animationPlayState: live ? "running" : "paused" }}
                    >
                      <div style={{ transform: `translateX(${o.r}px)` }}>
                        <div
                          className="will-change-transform"
                          style={{ animation: `${revKf} ${o.dur}s linear infinite`, animationPlayState: live ? "running" : "paused" }}
                        >
                          <NestCard t={t} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* < lg · static grid (unchanged design) */}
          <div className="lg:hidden">
            <Reveal className="mx-auto max-w-3xl text-center">
              <div className="mb-6 flex justify-center">
                <Kicker>Le cadre</Kicker>
              </div>
              <h2 className="section-title text-cream">{fr("Ce qu'AQLUMA n'est pas")}</h2>
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2">
              {NEST.map((t, i) => (
                <Reveal key={t} delay={i * 70}>
                  <NestCard t={t} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
