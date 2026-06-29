import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import { fr } from "@/lib/typo";

/**
 * FAMILY CARDS — a normal vertical-scroll section with strong parallax depth.
 *
 *   A · « Ce que vous entendez à la maison »   — scattered quote cards.
 *   B · « Ce que chaque adolescent pratique »  — the six gestes pratiqués.
 *   C · « Ce que les parents reçoivent »        — three deliverables.
 *
 * No pin, no fade-deck: the three groups simply scroll past, the cards drifting
 * at different parallax speeds so the stack breathes with depth. Reveal handles
 * the entrance; Parallax (scrubbed) handles the drift. Reduced motion → static.
 */

const HOME = [
  "Tu peux me l'expliquer avec tes mots ?",
  "Qu'est-ce que tu as vérifié ?",
  "Quelle partie vient de toi ?",
];

const PRACTICE = [
  "Lire une réponse générée avec un œil critique.",
  "Reformuler dans ses propres mots.",
  "Produire un travail dont il peut rendre compte.",
  "Présenter sans s'appuyer sur la machine.",
  "Identifier ce qu'il a appris, pas seulement obtenu.",
  "Distinguer ce qu'il partage de ce qui reste sien.",
];

const PARENTS = [
  "Le carnet de bord hebdomadaire.",
  "Les questions à poser pour stimuler le jugement.",
  "Un accès direct à l'équipe pédagogique.",
];

function Title({
  kicker,
  h,
  sub,
  center,
}: {
  kicker: string;
  h: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <div className={`mb-5 flex items-center gap-3.5 ${center ? "justify-center" : ""}`}>
        <span className="font-satoshi text-[0.9rem] font-bold tracking-tight text-gold">{kicker}</span>
        <span
          aria-hidden
          className="h-px w-12 flex-shrink-0"
          style={{ background: "linear-gradient(90deg, rgba(232,178,58,0.7), rgba(232,178,58,0))" }}
        />
      </div>
      <h2 className="text-balance font-didot text-[clamp(2rem,4vw,3.4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-cream">
        {fr(h)}
      </h2>
      {sub ? (
        <p
          className={`mt-6 max-w-[40ch] font-satoshi text-[clamp(1rem,1.2vw,1.18rem)] leading-relaxed text-cream/55 ${
            center ? "mx-auto" : ""
          }`}
        >
          {fr(sub)}
        </p>
      ) : null}
    </div>
  );
}

function Card({
  children,
  didot,
  className = "",
}: {
  children: React.ReactNode;
  didot?: boolean;
  className?: string;
}) {
  return (
    <div
      className={
        "relative rounded-2xl border border-cream/12 bg-ink/70 px-7 py-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)] " +
        className
      }
    >
      <span
        aria-hidden
        className="absolute left-0 top-6 h-7 w-px"
        style={{ background: "linear-gradient(180deg, rgba(232,178,58,0.9), rgba(232,178,58,0))" }}
      />
      <p
        className={
          didot
            ? "font-didot text-[clamp(1.2rem,1.7vw,1.6rem)] leading-snug text-cream"
            : "font-satoshi text-[clamp(1rem,1.2vw,1.18rem)] leading-snug text-cream/85"
        }
      >
        {children}
      </p>
    </div>
  );
}

export default function FamilyCards() {
  return (
    <section
      data-loupe
      className="relative w-full overflow-hidden border-t border-cream/[0.06] bg-void py-28 md:py-44"
      aria-label="Ce que vit votre adolescent"
    >
      <div className="shell flex flex-col gap-32 md:gap-52">
        {/* ── A · à la maison — scattered quote cards, big parallax spread ── */}
        <div>
          <Reveal>
            <Title kicker="FAMILLE" h="Ce que vous entendez à la maison" />
          </Reveal>
          <div className="relative mt-14 flex flex-col gap-10 md:mt-20 md:gap-14">
            {HOME.map((q, i) => {
              const align = i % 2 === 1 ? "md:ml-auto md:mr-[6%]" : "md:ml-[4%]";
              const tilt = [-4, 4, -2.5][i];
              const speed = [0.32, 0.14, 0.26][i];
              return (
                <Parallax key={q} speed={speed} className={`w-full max-w-[30rem] ${align}`}>
                  <Reveal y={40} delay={i * 60}>
                    <Card didot className="" >
                      <span style={{ display: "inline-block", transform: `rotate(${tilt}deg)` }}>
                        {fr(q)}
                      </span>
                    </Card>
                  </Reveal>
                </Parallax>
              );
            })}
          </div>
        </div>

        {/* ── B · ce que l'adolescent pratique — six gestes ── */}
        <div>
          <Reveal>
            <Title
              kicker="PRATIQUE"
              h="Ce que chaque adolescent pratique"
              sub="À chaque session, il ne subit pas l'IA — il la travaille."
            />
          </Reveal>
          <div className="mt-14 grid gap-5 md:mt-20 md:grid-cols-2 md:gap-x-10 md:gap-y-7">
            {PRACTICE.map((t, i) => (
              // Stagger the two columns' drift so the grid reads with depth.
              <Parallax key={t} speed={i % 2 === 0 ? 0.2 : 0.1} className="h-full">
                <Reveal y={36} delay={(i % 2) * 80}>
                  <Card className="h-full !py-5">{fr(t)}</Card>
                </Reveal>
              </Parallax>
            ))}
          </div>
        </div>

        {/* ── C · ce que les parents reçoivent ── */}
        <div>
          <Reveal>
            <Title kicker="PARENTS" h="Ce que les parents reçoivent" center />
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:mt-20 md:grid-cols-3 md:gap-7">
            {PARENTS.map((t, i) => (
              <Parallax key={t} speed={[0.22, 0.1, 0.22][i]} className="h-full">
                <Reveal y={36} delay={i * 70}>
                  <Card className="h-full">{fr(t)}</Card>
                </Reveal>
              </Parallax>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
