"use client";

import { fr } from "@/lib/typo";

/**
 * AVIS — social proof between the programme and the FAQ. A simple grid of
 * testimonial cards (parents + adolescents) in AQLUMA's dark register. Copy is
 * placeholder for now — swap for real reviews. To be polished later.
 */

type Review = {
  quote: string;
  name: string;
  role: string;
};

const REVIEWS: Review[] = [
  {
    quote:
      "Ma fille ne recopie plus les réponses : elle les questionne, les vérifie et explique son raisonnement. C'est exactement ce qui manquait.",
    name: "Salma B.",
    role: "Maman d'une participante, 15 ans",
  },
  {
    quote:
      "J'ai compris que l'IA est un brouillon, pas une vérité. Mon projet final, un mini-documentaire, je l'ai vraiment créé moi-même.",
    name: "Yassine",
    role: "Participant, 16 ans",
  },
  {
    quote:
      "Le Musée des Erreurs a tout changé. Mon fils repère maintenant une fausse source en quelques secondes.",
    name: "Karim E.",
    role: "Papa d'un participant, 14 ans",
  },
  {
    quote:
      "Une méthode, pas un cours de code. Mon ado parle à l'IA avec recul et garde sa propre voix. Bluffant.",
    name: "Nadia R.",
    role: "Maman d'un participant, 17 ans",
  },
  {
    quote:
      "Le pitch final devant les familles m'a donné une confiance que je n'avais jamais eue à l'école.",
    name: "Lina",
    role: "Participante, 15 ans",
  },
  {
    quote:
      "Trois mois et un vrai portfolio à la clé. AQLUMA prépare nos enfants au monde qui vient.",
    name: "Omar T.",
    role: "Papa d'une participante, 16 ans",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 text-gold" aria-label="5 sur 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section
      id="avis"
      className="relative w-full bg-void px-6 py-28 md:px-10 md:py-36"
      aria-label="AQLUMA — avis"
    >
      <div className="mx-auto max-w-[1180px]">
        <header className="mx-auto max-w-[40ch] text-center">
          <p className="font-satoshi text-[0.8rem] font-bold uppercase tracking-kicker text-gold">
            Ils ont vécu AQLUMA
          </p>
          <h2 className="mt-5 font-didot text-[clamp(2.2rem,5vw,4rem)] font-normal leading-[1.05] tracking-[-0.02em] text-cream">
            {fr("Ce qu'en disent les familles.")}
          </h2>
        </header>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure
              key={r.name}
              className="flex flex-col rounded-2xl border border-cream/10 bg-ink/60 p-7 transition-colors duration-300 hover:border-cream/25"
            >
              <Stars />
              <blockquote className="mt-5 font-satoshi text-[1rem] leading-relaxed text-cream/85">
                {fr(`« ${r.quote} »`)}
              </blockquote>
              <figcaption className="mt-6 border-t border-cream/10 pt-4">
                <p className="font-satoshi text-[0.95rem] font-semibold text-cream">
                  {r.name}
                </p>
                <p className="mt-0.5 font-satoshi text-[0.82rem] text-cream/50">
                  {fr(r.role)}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
