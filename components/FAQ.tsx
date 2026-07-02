"use client";

import { useEffect, useRef, useState } from "react";
import { fr } from "@/lib/typo";

/**
 * QUESTIONS FRÉQUENTES — closing FAQ, after the MindReveal CTA.
 *
 * AQLUMA's dark editorial register, not the generic light card stack: hairline-
 * separated rows (no boxes), a numbered accordion that expands via
 * grid-template-rows (not height), and the gold-diamond + Didot section header
 * reused from the world heroes. One answer open at a time. All French copy runs
 * through fr() (guillemets + thin no-break spaces). Reduced motion: globals.css
 * neutralises the transitions, so rows snap and every answer stays reachable.
 */

type QA = { q: string; a: string };

// Copy verbatim from the brief FAQ. Straight apostrophes are fine — fr() lifts
// them to ’ and adds the thin spaces before « » and ? at render.
const ITEMS: QA[] = [
  {
    q: "Mon enfant utilise déjà l'IA — est-ce encore utile ?",
    a: "C'est précisément parce qu'il l'utilise déjà qu'il en a besoin. AQLUMA remplace l'usage passif (consommation) par un usage actif (production, jugement, restitution). La différence est totale.",
  },
  {
    q: "Quel est l'engagement en temps pour l'adolescent ?",
    a: "Le programme est conçu pour s'intégrer à la vie scolaire sans la surcharger. Le détail complet des sessions, de la fréquence et de la durée est dans le document de programme.",
  },
  {
    q: "Faut-il un équipement spécifique ?",
    a: "Une connexion internet stable et un ordinateur standard suffisent. Aucun logiciel payant supplémentaire n'est requis.",
  },
  {
    q: "Le programme est-il compatible avec le lycée marocain ?",
    a: "Oui. AQLUMA n'est pas un programme scolaire concurrent. C'est une discipline complémentaire qui renforce les capacités de travail et de pensée, dans toutes les matières.",
  },
  {
    q: "Comment se déroule l'accompagnement des parents ?",
    a: "Chaque semaine, les parents reçoivent un carnet de bord et des questions spécifiques à poser. L'équipe pédagogique est accessible directement pour toute question.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0); // first answer open
  const [shown, setShown] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Reveal-on-enter: stagger the header + rows up once the section scrolls in.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.16 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const enter = (delay: number, y: number) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${y}px)`,
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <section
      ref={sectionRef}
      id="faq"
      data-loupe
      aria-label="Questions fréquentes"
      className="relative w-full overflow-hidden border-t border-cream/[0.06] py-28 md:py-40"
    >
      <div className="shell relative grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
        {/* LEFT — section header, sticky beside the questions like the act intros. */}
        <header className="lg:sticky lg:top-28 lg:self-start" style={enter(0, 16)}>
          <div className="mb-6 flex items-center gap-3.5">
            <span className="font-satoshi text-[0.95rem] font-bold tracking-tight text-gold">
              FAQ
            </span>
          </div>
          <h2 className="section-title text-cream">
            Questions fréquentes
          </h2>
          <p className="mt-6 max-w-[32ch] font-satoshi text-[clamp(0.98rem,1.2vw,1.12rem)] leading-relaxed text-cream/55">
            {fr("Tout ce qu'il faut savoir avant de commencer.")}
          </p>
        </header>

        {/* RIGHT — accordion: hairline-separated rows, no boxes. */}
        <ul className="border-b border-cream/[0.09]">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li
                key={i}
                className="border-t border-cream/[0.09]"
                style={enter(0.1 + i * 0.07, 14)}
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center gap-5 py-7 text-left outline-none focus-visible:ring-1 focus-visible:ring-gold/40 md:gap-8 md:py-8"
                  >
                    <span className="font-satoshi text-[12px] font-medium tabular-nums tracking-tight text-gold/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={[
                        "flex-1 font-satoshi text-[clamp(1.05rem,1.7vw,1.4rem)] font-bold leading-snug tracking-tight transition-colors duration-300 ease-editorial",
                        isOpen ? "text-cream" : "text-cream/80 group-hover:text-cream",
                      ].join(" ")}
                    >
                      {fr(item.q)}
                    </span>
                    <PlusMinus open={isOpen} />
                  </button>
                </h3>

                {/* Answer — collapses via grid-template-rows, not height. */}
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className="grid transition-[grid-template-rows,opacity] duration-500 ease-editorial"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-9 pl-9 pr-6 font-satoshi text-[clamp(0.98rem,1.25vw,1.12rem)] leading-relaxed text-cream/60 md:pl-[3.25rem] md:pr-16">
                      {fr(item.a)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/**
 * Plus that resolves to a minus: the horizontal stroke holds, the vertical one
 * collapses (scaleY → 0) when the row opens. Inherits the row's hover via group.
 */
function PlusMinus({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className="relative ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center"
    >
      <span className="absolute h-px w-[15px] bg-cream/45 transition-colors duration-300 group-hover:bg-cream" />
      <span
        className={[
          "absolute h-[15px] w-px origin-center bg-cream/45 transition-transform duration-300 ease-editorial group-hover:bg-cream",
          open ? "scale-y-0" : "scale-y-100",
        ].join(" ")}
      />
    </span>
  );
}
