"use client";

import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import Kicker from "@/components/Kicker";
import { fr } from "@/lib/typo";

/**
 * POURQUOI → CE QU'AQLUMA N'EST PAS.
 *
 * A normal-scroll section. Two "Pourquoi…" arguments enter in a zig-zag (left,
 * then right) on parallax, then everything converges on the centred title
 * « Ce qu'AQLUMA n'est pas » and six negative-space cards. As the cards scroll
 * into view a soft gold light sweeps across them left → right — a single, quiet
 * pass, not a loop. Reduced motion: the cards are simply shown, no sweep.
 */

const POURQUOI = [
  {
    q: "Pourquoi 15 adolescents ?",
    body: "Le jugement ne s'enseigne pas à la chaîne. Chaque élève reçoit une attention particulière. Chaque doute est exploré. Chaque production est examinée individuellement. Ce n'est pas de la rareté artificielle : c'est une décision pédagogique.",
  },
  {
    q: "Pourquoi payer si l'IA est gratuite ?",
    body: "L'IA est gratuite. La méthode est rare. Vous payez pour un cadre, une discipline et un accompagnement humain qui transforme un outil en compétence durable. Ce que l'adolescent apprend ici, aucune interface ne peut l'enseigner.",
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

// lg+ orbit stations around the centred title — six points on a wide ellipse,
// each drifting on a slow, phase-offset path (see globals `aq-orbit-*`).
const ORBIT = [
  { left: "50%", top: "11%", anim: "aq-orbit-a 17s ease-in-out 0s infinite" },
  { left: "87%", top: "30%", anim: "aq-orbit-b 21s ease-in-out -5s infinite" },
  { left: "87%", top: "70%", anim: "aq-orbit-a 19s ease-in-out -11s infinite" },
  { left: "50%", top: "89%", anim: "aq-orbit-b 20s ease-in-out -3s infinite" },
  { left: "13%", top: "70%", anim: "aq-orbit-a 22s ease-in-out -8s infinite" },
  { left: "13%", top: "30%", anim: "aq-orbit-b 18s ease-in-out -14s infinite" },
];

/** One negative-space card — unchanged design; the warm paper stock + quiet ✕. */
function NestCard({ t }: { t: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 rounded-2xl border border-black/[0.06] bg-paper px-8 py-12 text-center shadow-[0_24px_60px_-32px_rgba(0,0,0,0.7)]">
      <span
        aria-hidden
        className="block h-6 w-6 rounded-full border border-void/15 text-void/30"
      >
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
  return (
    <section
      data-loupe
      className="relative w-full overflow-hidden border-t border-cream/[0.06] bg-void py-28 md:py-40"
      aria-label="Pourquoi AQLUMA"
    >
      <div className="shell flex flex-col gap-28 md:gap-40">
        {/* ── Zig-zag arguments ── */}
        <div className="flex flex-col gap-24 md:gap-32">
          {POURQUOI.map((item, i) => (
            <Parallax
              key={item.q}
              speed={0.1}
              className={i % 2 === 1 ? "md:ml-auto md:text-right" : ""}
            >
              <Reveal className="max-w-[46ch]">
                <h3 className="font-didot text-[clamp(1.75rem,3.4vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.02em] text-cream">
                  {fr(item.q)}
                </h3>
                <p
                  className={[
                    "mt-6 text-pretty font-satoshi text-[clamp(1.05rem,1.4vw,1.3rem)] leading-relaxed text-cream/65",
                    i % 2 === 1 ? "md:ml-auto" : "",
                  ].join(" ")}
                >
                  {fr(item.body)}
                </p>
              </Reveal>
            </Parallax>
          ))}
        </div>

        {/* ── Convergence → Ce qu'AQLUMA n'est pas ──
            lg+: the title holds dead-centre while the six cards orbit it on slow,
            phase-offset paths. Below lg (and under reduced motion, which freezes
            the drift) the cards fall back to the calm static grid. */}
        <div>
          {/* lg+ · orbit */}
          <div className="relative mx-auto hidden h-[46rem] max-w-[72rem] lg:block">
            {/* faint centre light — the gravitational middle of the system */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(232,178,58,0.08), rgba(8,10,12,0) 70%)",
              }}
            />

            {/* centred title */}
            <div className="absolute left-1/2 top-1/2 z-10 w-[min(28rem,60%)] -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="mb-6 flex justify-center">
                <Kicker>Le cadre</Kicker>
              </div>
              <h2 className="section-title text-cream">
                {fr("Ce qu'AQLUMA n'est pas")}
              </h2>
            </div>

            {/* orbiting cards */}
            {NEST.map((t, i) => {
              const o = ORBIT[i];
              return (
                <div
                  key={t}
                  className="absolute w-[clamp(15rem,19vw,17rem)] -translate-x-1/2 -translate-y-1/2 will-change-transform"
                  style={{ left: o.left, top: o.top }}
                >
                  <div style={{ animation: o.anim }} className="will-change-transform">
                    <NestCard t={t} />
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
              <h2 className="section-title text-cream">
                {fr("Ce qu'AQLUMA n'est pas")}
              </h2>
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
      </div>
    </section>
  );
}
