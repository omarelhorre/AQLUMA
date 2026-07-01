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

        {/* ── Convergence → Ce qu'AQLUMA n'est pas ── */}
        <div>
          <Reveal className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <Kicker>Le cadre</Kicker>
            </div>
            <h2 className="section-title text-cream">
              {fr("Ce qu'AQLUMA n'est pas")}
            </h2>
          </Reveal>

          {/* Negative-space cards — the SAME warm paper stock as the family deck,
              so "what AQLUMA is not" reads consistently with the rest of the site.
              Centred content, generous padding; a quiet ✕ keeps the negation cue. */}
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {NEST.map((t, i) => (
              <Reveal key={t} delay={i * 70}>
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
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
