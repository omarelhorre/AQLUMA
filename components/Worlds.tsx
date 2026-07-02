"use client";

import { type CSSProperties } from "react";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import Kicker from "@/components/Kicker";
import { fr } from "@/lib/typo";

/**
 * LES MONDES — the three AQLUMA worlds as a row of tall image cards, ported
 * verbatim from the AQLUMA-lite site (its answer to the reference case-study
 * cards): a tall visual per world, the world name, and a short descriptive
 * paragraph. This replaces the horizontal-scroll ribbon.
 *
 * Faithful to the lite implementation — same layout, same tilt-to-straighten
 * hover, same parallax — with two site-level adaptations: the lite
 * `SectionMarker` (a hairline eyebrow the main site deliberately dropped) maps to
 * the shared `<Kicker>`, and each card's blurb uses THIS site's world paragraphs
 * (« lumière douce » &c.) rather than the lite copy.
 */

type World = {
  numeral: string;
  name: string;
  blurb: string;
  image: string;
  /** Theme colour — the same trio that runs through the programme. */
  color: string;
};

// Terracotta · gold · creamy — tuned to read on the dark surface. Blurbs are the
// current site's per-world paragraphs (lib/worldsData.ts → world.intro.text).
const WORLDS: World[] = [
  {
    numeral: "I",
    name: "Le Briefing",
    blurb:
      "Un espace de lumière douce. Repères, questions, orientation. On définit l'intention avant d'ouvrir la machine. Chaque session commence ici.",
    image: "/worlds/briefing.svg",
    color: "#D8753F",
  },
  {
    numeral: "II",
    name: "Le Musée des Erreurs",
    blurb:
      "Un silence de galerie. Les réponses inexactes sont exposées sur des piédestaux. On apprend à observer ce que les autres ignorent.",
    image: "/worlds/musee.svg",
    color: "#E8B23A",
  },
  {
    numeral: "III",
    name: "Le Studio des Créateurs",
    blurb:
      "L'atelier de création. Papier, table, intention. Ici, l'IA n'est qu'un pinceau parmi d'autres. L'œuvre finale appartient à l'adolescent.",
    image: "/worlds/studio.svg",
    color: "#EBDCB4",
  },
];

function Card({ w, tilt }: { w: World; tilt: number }) {
  return (
    <article className="flex h-full flex-col">
      <div
        style={{ "--tilt": `${tilt}deg` } as CSSProperties}
        className="group/card relative aspect-[3/4] overflow-hidden rounded-[1.4rem] border border-cream/10 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-out [transform:rotate(var(--tilt))] hover:[transform:rotate(0deg)]"
      >
        <Parallax speed={0.08} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- editorial art, fixed slot */}
          <img
            src={w.image}
            alt={w.name}
            className="absolute left-0 top-[-14%] h-[128%] w-full object-cover"
          />
        </Parallax>
        <span
          aria-hidden
          className="absolute right-6 top-5 font-didot text-[2.4rem] font-normal leading-none"
          style={{ color: w.color, opacity: 0.55 }}
        >
          {w.numeral}
        </span>
      </div>

      <div className="mt-7">
        <h3
          className="font-didot text-[clamp(1.15rem,1.5vw,1.4rem)] font-normal leading-none"
          style={{ color: w.color }}
        >
          {fr(w.name)}
        </h3>
        <p className="mt-3 font-satoshi text-[clamp(0.98rem,1.1vw,1.08rem)] leading-relaxed text-cream/65">
          {fr(w.blurb)}
        </p>
      </div>
    </article>
  );
}

export default function Worlds() {
  return (
    <section
      id="mondes"
      className="relative w-full overflow-hidden border-t border-cream/[0.06] py-28 md:py-40"
      aria-label="AQLUMA, les trois mondes"
    >
      <div className="shell relative">
        <div className="mb-6">
          <Kicker>Les mondes</Kicker>
        </div>

        <div className="max-w-[44ch]">
          <Reveal delay={60}>
            <h2 className="font-didot text-[clamp(2.4rem,5vw,4.2rem)] font-normal leading-[1.04] tracking-[-0.02em] text-cream">
              Trois mondes à{" "}
              <span className="underline decoration-2 underline-offset-[8px] decoration-gold">
                explorer
              </span>
              .
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 font-satoshi text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-cream/65">
              {fr(
                "Chaque monde a son atmosphère et son intention : on y entre pour découvrir, on apprend à le questionner, on en ressort en créant.",
              )}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
          {WORLDS.map((w, i) => (
            <Reveal key={w.name} delay={80 * i}>
              <Card w={w} tilt={[-2, 1.5, 2.5][i] ?? 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
