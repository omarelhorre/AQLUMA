"use client";

import { fr } from "@/lib/typo";

/**
 * LE PROGRAMME — distils the macro programme (assets/aqluma_macro_programme.txt)
 * into its key points: the three acts over three months, the skills + signature
 * experiences of each, the validated deliverable, then the certification axes and
 * the closing exposition.
 *
 * Layout follows the world-hero convention — media on the RIGHT, text on the
 * LEFT — but inverted into a reading section: the three acts are laid out as a
 * structured vertical stepper on the left, while the briefing clip rides along
 * in a sticky frame on the right (gold-diamond marker reused from StudioHero).
 *
 * AQLUMA-dark editorial register (gold kicker → Didot heading → Satoshi body).
 */

type Act = {
  month: string;
  act: string;
  title: string;
  question: string;
  objective: string;
  skills: string[];
  experiences: string[];
  livrables: string[];
};

const ACTS: Act[] = [
  {
    month: "Mois 1",
    act: "Acte I — Le Briefing",
    title: "Découvrir",
    question: "« Bienvenue dans l'ère de l'IA »",
    objective:
      "Comprendre ce qu'est réellement l'IA, ses mécanismes, ses usages et les défis de société qu'elle soulève.",
    skills: [
      "Culture générale approfondie sur l'IA",
      "Compréhension fine des cas d'usage",
      "Réflexion prospective autonome",
    ],
    experiences: [
      "Les Grandes Questions : débats animés",
      "Cartographie du Futur : métiers en mutation",
      "Premiers Dialogues avec les outils leaders",
    ],
    livrables: ["Passeport Explorateur IA"],
  },
  {
    month: "Mois 2",
    act: "Acte II — Le Musée des Erreurs",
    title: "Questionner",
    question: "« Peut-on toujours faire confiance à l'IA ? »",
    objective:
      "Développer un regard critique, analytique et responsable sur tout ce que produisent les intelligences artificielles.",
    skills: [
      "Vérification et recoupement des informations",
      "Détection et isolation des biais",
      "Pratiques numériques responsables",
    ],
    experiences: [
      "La Source Qui N'Existe Pas : traquer les hallucinations",
      "Le Tribunal des Réponses IA",
      "L'Enveloppe Privée : protéger ses données",
    ],
    livrables: ["Badge Détective IA", "Carnet d'Enquête AQLUMA"],
  },
  {
    month: "Mois 3",
    act: "Acte III — Le Studio des Créateurs",
    title: "Créer",
    question: "« Et maintenant, que peux-tu créer avec l'IA ? »",
    objective:
      "Se positionner en concepteur et déployer l'IA comme un copilote au service de la création et de l'innovation.",
    skills: [
      "Advanced Prompt Design & ingénierie",
      "Créativité augmentée et itérative",
      "Pitch et techniques de communication",
    ],
    experiences: [
      "Le Prompt Atelier : requêtes complexes avancées",
      "Le Prototype Express : une idée en un temps record",
      "Le Pitch AQLUMA : soutenance persuasive",
    ],
    livrables: ["Portfolio IA Créatif", "Projet Final AQLUMA"],
  },
];

const CERT_AXES = [
  "Compréhension technique & culturelle de l'IA",
  "Esprit critique appliqué",
  "Utilisation responsable & éthique",
  "Créativité augmentée",
  "Conception et pilotage de projets assistés par IA",
];

export default function ProgramHighlights() {
  return (
    <section
      id="programme"
      className="relative w-full bg-void px-6 py-28 md:px-10 md:py-40"
      aria-label="AQLUMA — le programme"
    >
      <div className="mx-auto max-w-[1180px]">
        {/* header */}
        <header className="mx-auto max-w-[44ch] text-center">
          <p className="font-satoshi text-[0.8rem] font-bold uppercase tracking-kicker text-gold">
            Le programme · 3 mois · 12 semaines
          </p>
          <h2 className="mt-5 font-didot text-[clamp(2.4rem,5.5vw,4.5rem)] font-normal leading-[1.04] tracking-[-0.02em] text-cream">
            {fr("Comprendre, questionner, créer.")}
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] font-satoshi text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-cream/65">
            {fr(
              "Une aventure immersive en trois actes qui transforme un consommateur passif d'outils en véritable acteur de l'innovation.",
            )}
          </p>
        </header>

        {/* Structured acts on the LEFT, sticky briefing clip on the RIGHT. */}
        <div className="mt-20 grid gap-10 lg:grid-cols-[1.05fr_0.85fr] lg:gap-16">
          {/* LEFT — the three acts as a numbered vertical stepper. A hairline
              spine threads the markers together top to bottom. */}
          <ol className="relative flex flex-col gap-px">
            <span
              aria-hidden
              className="pointer-events-none absolute left-[22px] top-3 bottom-3 w-px bg-gradient-to-b from-gold/40 via-cream/10 to-transparent"
            />
            {ACTS.map((a, i) => (
              <li
                key={a.act}
                className="relative rounded-2xl border border-transparent p-6 pl-16 transition-colors duration-300 hover:border-cream/10 hover:bg-ink/40"
              >
                {/* numbered node sitting on the spine */}
                <span className="absolute left-[7px] top-6 flex h-[31px] w-[31px] items-center justify-center rounded-full border border-gold/40 bg-void font-satoshi text-[13px] font-bold text-gold">
                  {i + 1}
                </span>

                <p className="font-satoshi text-[11px] font-bold uppercase tracking-kicker text-gold">
                  {a.month}
                </p>
                <h3 className="mt-2 font-didot text-[1.9rem] font-normal leading-tight text-cream">
                  {a.title}
                </h3>
                <p className="mt-1 font-satoshi text-[0.85rem] font-medium uppercase tracking-[0.1em] text-cream/45">
                  {a.act}
                </p>
                <p className="mt-4 font-satoshi text-[0.95rem] italic leading-relaxed text-cream/70">
                  {fr(a.question)}
                </p>
                <p className="mt-3 font-satoshi text-[0.95rem] leading-relaxed text-cream/60">
                  {fr(a.objective)}
                </p>

                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  <Block label="Compétences" items={a.skills} />
                  <Block label="Expériences" items={a.experiences} />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="font-satoshi text-[10px] font-bold uppercase tracking-kicker text-cream/40">
                    Livrable
                  </span>
                  {a.livrables.map((l) => (
                    <span
                      key={l}
                      className="rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1.5 font-satoshi text-[12px] font-medium text-gold"
                    >
                      {fr(l)}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          {/* RIGHT — sticky briefing clip; ambient autoplay loop in a framed
              card with the gold-diamond marker reused from the world heroes. */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-5 flex items-center gap-3.5">
              <span
                aria-hidden
                className="h-[7px] w-[7px] rotate-45 bg-gold"
                style={{ boxShadow: "0 0 9px 1px rgba(232,178,58,0.55)" }}
              />
              <span className="font-satoshi text-[12.5px] font-semibold uppercase tracking-[0.2em] text-cream">
                Le Briefing
              </span>
              <span
                aria-hidden
                className="h-px w-16 flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(232,178,58,0.7), rgba(232,178,58,0))",
                }}
              />
            </div>

            <PhoneReel
              caption={fr(
                "Trois mois, trois actes — une immersion qui transforme l'élève en acteur de l'innovation.",
              )}
            />

            <p className="mt-6 max-w-[34ch] font-satoshi text-[0.9rem] leading-relaxed text-cream/55">
              {fr(
                "Un avant-goût du Briefing : la première porte d'entrée dans le monde de l'IA.",
              )}
            </p>
          </aside>
        </div>

        {/* certification + closing */}
        <div className="mt-20 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-cream/10 bg-ink/60 p-8">
            <h3 className="font-didot text-[1.7rem] font-normal leading-tight text-cream">
              {fr("Certificat AQLUMA — IA Créative")}
            </h3>
            <p className="mt-3 font-satoshi text-[0.95rem] leading-relaxed text-cream/60">
              {fr(
                "Un socle de compétences de haut niveau, structuré autour de 5 axes cardinaux :",
              )}
            </p>
            <ul className="mt-5 space-y-3">
              {CERT_AXES.map((axe) => (
                <li
                  key={axe}
                  className="flex items-start gap-3 font-satoshi text-[0.95rem] leading-snug text-cream/80"
                >
                  <span className="mt-[2px] text-gold">✓</span>
                  {fr(axe)}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-cream/10 bg-gradient-to-br from-clay/20 to-ink/60 p-8">
            <p className="font-satoshi text-[11px] font-bold uppercase tracking-kicker text-gold">
              Cérémonie de clôture
            </p>
            <h3 className="mt-4 font-didot text-[1.9rem] font-normal leading-tight text-cream">
              {fr("L'Exposition AQLUMA")}
            </h3>
            <p className="mt-4 font-satoshi text-[1rem] leading-relaxed text-cream/70">
              {fr(
                "Un événement public où chaque participant présente son projet final devant familles, enseignants et partenaires — le fruit d'une synergie entre l'esprit humain et la puissance algorithmique.",
              )}
            </p>
            <p className="mt-7 font-didot text-[1.25rem] italic leading-snug text-cream/85">
              {fr(
                "« Découvrir le monde de l'IA. Questionner ses réponses. Créer le futur. »",
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * PhoneReel — the briefing clip framed as a phone running an Instagram-Reels-style
 * feed: dark bezel + dynamic island, the 9:16 video filling the screen, a soft
 * Reels chrome overlay (handle, caption, side actions) and a gold ambient glow.
 */
function PhoneReel({ caption }: { caption: string }) {
  return (
    <div className="relative mx-auto w-[clamp(220px,80%,300px)]">
      {/* gold ambient glow behind the device */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(232,178,58,0.22), rgba(8,10,12,0) 70%)",
        }}
      />

      {/* device shell */}
      <div className="relative rounded-[2.6rem] border border-cream/15 bg-[#0a0b0d] p-2.5 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85),inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        {/* screen */}
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.05rem] bg-black">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/video/programme-briefing.mp4"
            poster="/video/programme-briefing-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          />

          {/* dynamic island */}
          <div
            aria-hidden
            className="absolute left-1/2 top-3 z-20 h-[26px] w-[34%] -translate-x-1/2 rounded-full bg-black"
          />

          {/* legibility gradient for the Reels chrome */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.65) 100%)",
            }}
          />

          {/* side action rail */}
          <div className="absolute bottom-24 right-3 z-20 flex flex-col items-center gap-4 text-cream">
            <ReelAction
              label="J'aime"
              count="10,3 k"
              path="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
            />
            <ReelAction
              label="Commentaires"
              count="284"
              path="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"
            />
            <ReelAction
              label="Partager"
              count="1 942"
              path="M22 3 11 14M22 3l-7 19-4-8-8-4 19-7z"
            />
          </div>

          {/* bottom caption block */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-4 pr-14">
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/aqluma.education/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="aqluma.education sur Instagram"
                className="flex items-center gap-2 outline-none focus-visible:ring-1 focus-visible:ring-cream/40"
              >
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-cream/20 bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/aqluma-mark.png"
                    alt="aqluma.education"
                    className="h-[60%] w-[60%] object-contain"
                  />
                </span>
                <span className="font-satoshi text-[13px] font-semibold text-cream transition-opacity hover:opacity-80">
                  aqluma.education
                </span>
              </a>
              <a
                href="https://www.instagram.com/aqluma.education/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[5px] border border-cream/40 px-1.5 py-px font-satoshi text-[10px] font-medium text-cream/85 outline-none transition-colors hover:border-cream/70 hover:text-cream focus-visible:ring-1 focus-visible:ring-cream/40"
              >
                Suivre
              </a>
            </div>
            <p className="mt-2.5 line-clamp-2 font-satoshi text-[12px] leading-snug text-cream/90">
              {caption}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-cream/80">
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="h-3.5 w-3.5"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="font-satoshi text-[11px] font-medium">
                86,7 k vues
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReelAction({
  label,
  path,
  count,
}: {
  label: string;
  path: string;
  count: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 24 24"
        className="h-6 w-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
      <span className="font-satoshi text-[11px] font-semibold leading-none text-cream drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
        {count}
      </span>
    </div>
  );
}

function Block({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-6">
      <p className="mb-2 font-satoshi text-[10px] font-bold uppercase tracking-kicker text-cream/40">
        {label}
      </p>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li
            key={it}
            className="flex items-start gap-2 font-satoshi text-[0.88rem] leading-snug text-cream/70"
          >
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold/70" />
            {fr(it)}
          </li>
        ))}
      </ul>
    </div>
  );
}
