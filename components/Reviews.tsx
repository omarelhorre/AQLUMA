"use client";

import { useState } from "react";
import { fr } from "@/lib/typo";
import Parallax from "@/components/Parallax";

/**
 * AVIS — social proof between the programme and the FAQ. A premium, minimalist
 * grid of testimonial cards (parents + adolescents) in AQLUMA's dark register:
 * each card carries the reviewer's photo (a graceful default avatar when none is
 * set) and its own rating, so the wall reads honest rather than uniform.
 *
 * To add a real photo: drop a square image at /avatars/{slug}.(jpg|png|svg) and
 * point `avatar` at it. If the file is missing, the card falls back to the
 * neutral default avatar automatically.
 */

const DEFAULT_AVATAR = "/avatars/default.svg";

type Review = {
  quote: string;
  name: string;
  role: string;
  /** Per-reviewer rating out of 5 (supports half steps, e.g. 4.5). */
  rating: number;
  /** Optional profile photo; omitted reviewers use the default avatar. */
  avatar?: string;
};

const REVIEWS: Review[] = [
  {
    quote:
      "Ma fille ne recopie plus les réponses : elle les questionne, les vérifie et explique son raisonnement. C'est exactement ce qui manquait.",
    name: "Salma B.",
    role: "Maman d'une participante, 15 ans",
    rating: 5,
    avatar: "/avatars/salma.svg",
  },
  {
    quote:
      "J'ai compris que l'IA est un brouillon, pas une vérité. Mon projet final, un mini-documentaire, je l'ai vraiment créé moi-même.",
    name: "Yassine",
    role: "Participant, 16 ans",
    rating: 4.5,
    avatar: "/avatars/yassine.svg",
  },
  {
    quote:
      "Le Musée des Erreurs a tout changé. Mon fils repère maintenant une fausse source en quelques secondes.",
    name: "Karim E.",
    role: "Papa d'un participant, 14 ans",
    rating: 4,
  },
  {
    quote:
      "Une méthode, pas un cours de code. Mon ado parle à l'IA avec recul et garde sa propre voix. Bluffant.",
    name: "Nadia R.",
    role: "Maman d'un participant, 17 ans",
    rating: 5,
    avatar: "/avatars/nadia.svg",
  },
  {
    quote:
      "Le pitch final devant les familles m'a donné une confiance que je n'avais jamais eue à l'école.",
    name: "Lina",
    role: "Participante, 15 ans",
    rating: 4.5,
  },
  {
    quote:
      "Trois mois et un vrai portfolio à la clé. AQLUMA prépare nos enfants au monde qui vient.",
    name: "Omar T.",
    role: "Papa d'une participante, 16 ans",
    rating: 5,
  },
];

// Aggregate rating — computed from the cards so the headline figure stays honest
// as reviews change. French decimals use a comma.
const AVG_NUM =
  REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;
const AVG = AVG_NUM.toFixed(1).replace(".", ",");

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const cls =
    size === "lg"
      ? "text-[1.5rem] tracking-[0.2em]"
      : "text-[0.82rem] tracking-[0.16em]";
  return (
    <span
      role="img"
      aria-label={`${rating.toString().replace(".", ",")} sur 5`}
      className={`relative inline-flex select-none leading-none ${cls}`}
    >
      <span aria-hidden className="text-cream/15">
        ★★★★★
      </span>
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full overflow-hidden whitespace-nowrap text-gold"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

function Avatar({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed ? src : DEFAULT_AVATAR;
  return (
    <span className="block h-11 w-11 shrink-0 overflow-hidden rounded-full bg-cream/[0.04] ring-1 ring-cream/10">
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny avatar with
          runtime onError fallback; next/image's wrapper fights the circular crop */}
      <img
        src={show}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

/** One testimonial — grouped on a soft gradient panel (no hard borders). */
function Card({ r }: { r: Review }) {
  return (
    <figure className="rounded-[1.4rem] bg-gradient-to-b from-cream/[0.055] to-cream/[0.008] p-7 md:p-8">
      <Stars rating={r.rating} />
      <blockquote className="mt-4 font-satoshi text-[1.02rem] leading-relaxed text-cream/80">
        {fr(`« ${r.quote} »`)}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3.5">
        <Avatar src={r.avatar} name={r.name} />
        <span className="font-satoshi text-[0.86rem] leading-snug">
          <span className="block font-semibold text-cream">{r.name}</span>
          <span className="block text-cream/40">{fr(r.role)}</span>
        </span>
      </figcaption>
    </figure>
  );
}

// Show a curated four (the full six still back the average + family count).
const SHOWN = REVIEWS.slice(0, 4);

export default function Reviews() {
  return (
    <section
      id="avis"
      data-loupe
      className="relative w-full overflow-hidden bg-void px-6 py-28 md:px-10 md:py-36"
      aria-label="AQLUMA, avis"
    >
      {/* Decorative glow on a slow plane — drifts behind the cards for depth. */}
      <Parallax
        aria-hidden
        speed={0.06}
        className="pointer-events-none absolute inset-x-0 -inset-y-[22%] -z-0"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(50% 40% at 50% 30%, rgba(232,178,58,0.08), rgba(8,10,12,0) 70%)",
          }}
        />
      </Parallax>

      <div className="relative mx-auto grid max-w-[1340px] gap-14 lg:grid-cols-[0.66fr_1.34fr] lg:gap-16">
        {/* LEFT — the section title + aggregate. Sticky on desktop so it holds
            beside the comments, like the act intros. */}
        <div className="text-center lg:sticky lg:top-28 lg:self-start lg:text-left">
          <p className="font-satoshi text-[0.8rem] font-bold uppercase tracking-kicker text-gold">
            Ils ont vécu AQLUMA
          </p>
          <h2 className="mx-auto mt-5 max-w-[14ch] font-didot text-[clamp(2.2rem,4.4vw,3.8rem)] font-normal leading-[1.05] tracking-[-0.02em] text-cream lg:mx-0">
            {fr("Ce qu'en disent les familles.")}
          </h2>

          {/* Aggregate rating — the figure, the stars, the basis. */}
          <div className="mt-9 flex flex-col items-center gap-3 lg:items-start">
            <div className="flex items-baseline gap-2.5">
              <span className="font-didot text-[clamp(2.8rem,6vw,4.4rem)] font-normal leading-none text-cream">
                {AVG}
              </span>
              <span className="font-satoshi text-[1.1rem] font-medium text-cream/35">
                / 5
              </span>
            </div>
            <Stars rating={AVG_NUM} size="lg" />
            <p className="font-satoshi text-[0.82rem] uppercase tracking-[0.18em] text-cream/40">
              {fr(`Note moyenne · ${REVIEWS.length} familles accompagnées`)}
            </p>
          </div>
        </div>

        {/* RIGHT — four wide comments on soft panels, two columns with a light
            stagger (second column dropped a touch) so it reads alive, not gridded. */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-8">
          <div className="flex flex-col gap-8">
            <Card r={SHOWN[0]} />
            <Card r={SHOWN[2]} />
          </div>
          <div className="flex flex-col gap-8 sm:mt-14">
            <Card r={SHOWN[1]} />
            <Card r={SHOWN[3]} />
          </div>
        </div>
      </div>
    </section>
  );
}
