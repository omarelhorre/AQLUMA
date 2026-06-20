"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fr } from "@/lib/typo";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Parallax from "@/components/Parallax";

/**
 * AVIS — social proof between the programme and the FAQ. A premium, minimalist
 * reviewer SELECTOR in AQLUMA's dark register: a row of reviewer "bubbles"
 * (parents + adolescents) held to the right; click one and its quote writes
 * itself in with the signature per-character fill sweep, above the reviewer and
 * their rating. One voice at a time, so the section reads composed rather than as
 * a noisy wall of cards. The left column holds the title + the honest aggregate.
 *
 * To add a real photo: drop a square image at /avatars/{slug}.(jpg|png|svg) and
 * point `avatar` at it. If the file is missing, the bubble falls back to the
 * neutral default avatar automatically.
 */

const DEFAULT_AVATAR = "/avatars/default.svg";

// The signature AQLUMA reveal: each glyph goes from a faint impression to solid
// as a left→right sweep crosses it. Reused for the chosen testimonial so a picked
// review writes itself in like the hero statements (per-character fill).
const Q_FILL = "#F7F4EF"; // cream ink
const Q_GHOST = "rgba(247,244,239,0.12)"; // faint impression before the sweep
function quoteFill(f: number): string {
  if (f >= 1) return `linear-gradient(90deg, ${Q_FILL}, ${Q_FILL})`;
  if (f <= 0) return `linear-gradient(90deg, ${Q_GHOST}, ${Q_GHOST})`;
  const pct = f * 100;
  return `linear-gradient(90deg, ${Q_FILL} 0%, ${Q_FILL} ${pct - 4}%, ${Q_GHOST} ${pct + 4}%, ${Q_GHOST} 100%)`;
}

/** Split a quote into unbreakable words of fillable characters (global index). */
function buildQuote(quote: string) {
  let i = 0;
  const words = fr(quote)
    .split(" ")
    .filter(Boolean)
    .map((w) => ({ chars: [...w].map((ch) => ({ ch, i: i++ })) }));
  return { words, total: i };
}

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

function Avatar({
  src,
  name,
  className = "h-11 w-11",
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed ? src : DEFAULT_AVATAR;
  return (
    <span
      className={`block shrink-0 overflow-hidden rounded-full bg-cream/[0.04] ring-1 ring-cream/10 ${className}`}
    >
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

/**
 * Bubble — one reviewer, as a clickable photo. Reads as a tab: the active
 * bubble lifts, brightens and gains a gold ring; the rest sit quietly dimmed.
 */
function Bubble({
  r,
  active,
  onClick,
  onKeyDown,
  tabRef,
}: {
  r: Review;
  active: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  tabRef: (el: HTMLButtonElement | null) => void;
}) {
  const [failed, setFailed] = useState(false);
  const show = r.avatar && !failed ? r.avatar : DEFAULT_AVATAR;
  return (
    <button
      ref={tabRef}
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={`${r.name} — ${r.role}`}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={[
        "relative h-[3.4rem] w-[3.4rem] shrink-0 overflow-hidden rounded-full outline-none transition-all duration-300 ease-editorial md:h-[3.75rem] md:w-[3.75rem]",
        "focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void",
        active
          ? "scale-[1.06] ring-2 ring-gold"
          : "opacity-50 ring-1 ring-cream/10 grayscale hover:scale-[1.03] hover:opacity-100 hover:grayscale-0",
      ].join(" ")}
      style={
        active
          ? { boxShadow: "0 0 0 4px rgba(232,178,58,0.12)" }
          : undefined
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- see Avatar */}
      <img
        src={show}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </button>
  );
}

export default function Reviews() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const r = REVIEWS[active];

  // The chosen quote writes itself in with the per-character fill sweep each time
  // a reviewer is picked. Reduced motion shows it solid at once.
  const quoteModel = useMemo(() => buildQuote(r.quote), [r.quote]);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    const els = charRefs.current;
    const total = quoteModel.total;
    if (reduced) {
      for (let i = 0; i < total; i++)
        if (els[i]) els[i]!.style.backgroundImage = quoteFill(1);
      return;
    }
    for (let i = 0; i < total; i++)
      if (els[i]) els[i]!.style.backgroundImage = quoteFill(0);
    let raf = 0;
    const DURATION = 680;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const sweep = p * total;
      for (let i = 0; i < total; i++) {
        const el = els[i];
        if (!el) continue;
        el.style.backgroundImage = quoteFill(Math.min(1, Math.max(0, sweep - i)));
      }
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, quoteModel]);

  // Roving keyboard nav across the bubble row (proper tablist behaviour).
  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = REVIEWS.length;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section
      id="avis"
      data-loupe
      className="relative w-full overflow-hidden bg-void px-[min(6vw,5rem)] py-32 md:py-48"
      aria-label="AQLUMA, avis"
    >
      {/* Decorative glow on a slow plane — drifts behind the panel for depth. */}
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

      <div className="relative grid gap-16 lg:grid-cols-2 lg:gap-24">
        {/* LEFT — the section title + aggregate. Sticky on desktop so it holds
            beside the testimonial, like the act intros. */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-satoshi text-[0.8rem] font-bold uppercase tracking-kicker text-gold">
            Ils ont vécu AQLUMA
          </p>
          <h2 className="mt-5 max-w-[15ch] font-didot text-[clamp(2.6rem,5vw,4.6rem)] font-normal leading-[1.04] tracking-[-0.02em] text-cream">
            {fr("Ce qu'en disent les familles.")}
          </h2>

          {/* Aggregate rating — the figure, the stars, the basis. */}
          <div className="mt-9 flex flex-col items-start gap-3">
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

        {/* RIGHT — the testimonial, held to the right: a row of reviewer bubbles
            over the chosen quote, which writes itself in with the scroll-fill. */}
        <div className="flex flex-col items-start gap-12 md:gap-16">
          <div
            role="tablist"
            aria-label="Choisir un témoignage"
            aria-orientation="horizontal"
            className="flex flex-wrap items-center justify-start gap-3.5 md:gap-4"
          >
            {REVIEWS.map((rev, i) => (
              <Bubble
                key={rev.name}
                r={rev}
                active={i === active}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                tabRef={(el) => {
                  tabRefs.current[i] = el;
                }}
              />
            ))}
          </div>

          {/* The chosen testimonial — a big quote mark, the quote written in with
              the per-character fill sweep, then the reviewer with their rating. */}
          <figure role="tabpanel" className="w-full max-w-[46rem]">
            <span
              aria-hidden
              className="block font-didot text-[clamp(3.5rem,5vw,5rem)] leading-[0.5] text-gold/70"
            >
              “
            </span>
            <blockquote
              key={active}
              className="mt-4 font-didot text-[clamp(1.6rem,2.7vw,2.3rem)] font-normal leading-[1.42] text-cream/90"
            >
              {quoteModel.words.map((word, wi) => (
                <span key={wi} className="mr-[0.26em] inline-block whitespace-nowrap">
                  {word.chars.map((c) => (
                    <span
                      key={c.i}
                      ref={(el) => {
                        charRefs.current[c.i] = el;
                      }}
                      style={
                        reduced
                          ? { color: Q_FILL }
                          : {
                              backgroundImage: quoteFill(0),
                              WebkitBackgroundClip: "text",
                              backgroundClip: "text",
                              color: "transparent",
                              WebkitTextFillColor: "transparent",
                            }
                      }
                    >
                      {c.ch}
                    </span>
                  ))}
                </span>
              ))}
              <span className="sr-only">{fr(r.quote)}</span>
            </blockquote>
            <figcaption className="mt-10 flex items-center gap-4">
              <Avatar src={r.avatar} name={r.name} className="h-12 w-12" />
              <span className="font-satoshi text-[0.92rem] leading-snug">
                <span className="block font-semibold text-cream">{r.name}</span>
                <span className="block text-cream/45">{fr(r.role)}</span>
              </span>
              <span className="ml-auto self-start">
                <Stars rating={r.rating} />
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
