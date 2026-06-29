"use client";

import { useEffect, useRef, useState } from "react";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
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
  const gridRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setNarrow(mq.matches);
  }, []);

  // Fire the gold light sweep once, when the cards scroll into view.
  useEffect(() => {
    const grid = gridRef.current;
    const sweep = sweepRef.current;
    if (!grid || !sweep || narrow) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          sweep.style.animation = "methode-sweep 1.5s cubic-bezier(0.16,1,0.3,1) forwards";
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(grid);
    return () => io.disconnect();
  }, [narrow]);

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
                <h3 className="font-didot text-[clamp(1.7rem,3.4vw,2.9rem)] font-normal leading-[1.1] tracking-[-0.02em] text-cream">
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
            <div className="mb-6 flex items-center justify-center gap-3.5">
              <span
                aria-hidden
                className="h-px w-10"
                style={{ background: "linear-gradient(90deg, rgba(232,178,58,0), rgba(232,178,58,0.7))" }}
              />
              <span className="font-satoshi text-[0.9rem] font-bold tracking-tight text-gold">
                Le cadre
              </span>
              <span
                aria-hidden
                className="h-px w-10"
                style={{ background: "linear-gradient(90deg, rgba(232,178,58,0.7), rgba(232,178,58,0))" }}
              />
            </div>
            <h2 className="font-didot text-[clamp(2.2rem,4.6vw,3.9rem)] font-normal leading-[1.06] tracking-[-0.02em] text-cream">
              {fr("Ce qu'AQLUMA n'est pas")}
            </h2>
          </Reveal>

          {/* Card grid with the single gold light pass. */}
          <div ref={gridRef} className="relative mt-14">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {NEST.map((t, i) => (
                <Reveal key={t} delay={i * 70}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-cream/12 bg-ink/60 px-7 py-7">
                    <span
                      aria-hidden
                      className="mb-4 block h-5 w-5 rounded-full border border-cream/20 text-cream/30"
                    >
                      <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden>
                        <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    <p className="font-satoshi text-[clamp(1.02rem,1.2vw,1.18rem)] leading-snug text-cream/80">
                      {fr(t)}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Soft gold light — one left→right pass over the whole grid. */}
            <div
              ref={sweepRef}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 z-10 w-1/3"
              style={{
                left: "-40%",
                opacity: 0,
                background:
                  "linear-gradient(90deg, rgba(232,178,58,0) 0%, rgba(232,178,58,0.10) 50%, rgba(232,178,58,0) 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
