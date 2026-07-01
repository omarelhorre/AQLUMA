import Reveal from "@/components/Reveal";
import CtaButton from "@/components/CtaButton";
import { CTA_SUPPORT_COHORT } from "@/lib/contact";
import { fr } from "@/lib/typo";

/**
 * CTA CARD — the cohort invitation, as one large solid-white rounded card.
 *
 * A premium, centred composition (not a copy of the reference): an eyebrow rail
 * of cohort facts, a Didot headline, a supporting line, then the canonical
 * CtaButton (inverted to dark on the light card) with its microcopy. Everything
 * is centre-aligned for a calm, confident close.
 */

const FACTS = ["Programme en ligne", "13–17 ans", "Maroc", "15 adolescents", "Suivi avec attention"];

export default function CtaCard() {
  return (
    <section
      data-loupe
      className="relative w-full overflow-hidden border-t border-cream/[0.06] bg-void py-24 md:py-32"
      aria-label="Rejoindre le premier groupe AQLUMA"
    >
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-slab bg-cream px-7 py-16 text-center text-void md:rounded-slab-lg md:px-20 md:py-24">
            {/* Faint warm tint + gold inner frame on the white. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(90% 100% at 50% 0%, rgba(201,97,46,0.06), rgba(247,244,239,0) 60%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-frame border border-clay/15 md:inset-5 md:rounded-frame-lg"
            />

            <div className="relative mx-auto flex max-w-3xl flex-col items-center">
              {/* Eyebrow rail. */}
              <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                {FACTS.map((f, i) => (
                  <li key={f} className="flex items-center gap-3">
                    {i > 0 ? (
                      <span aria-hidden className="h-1 w-1 rounded-full bg-clay/60" />
                    ) : null}
                    <span className="font-satoshi text-[0.8rem] font-semibold tracking-tight text-void/65">
                      {fr(f)}
                    </span>
                  </li>
                ))}
              </ul>

              <h2 className="section-title mt-9 max-w-[18ch] text-void">
                Premier groupe AQLUMA.
              </h2>

              <p className="mt-7 max-w-[52ch] text-pretty font-satoshi text-[clamp(1.05rem,1.4vw,1.32rem)] leading-relaxed text-void/65">
                {fr(
                  "Un groupe restreint. Un cadre sérieux. Un programme construit pour que votre adolescent sorte de chaque session avec quelque chose qu'il sait faire, pas seulement quelque chose qu'il a obtenu.",
                )}
              </p>

              <div className="mt-11 flex flex-col items-center gap-5">
                <CtaButton variant="dark" size="lg" />
                <p className="max-w-[34ch] font-satoshi text-[0.92rem] leading-relaxed text-void/45">
                  {fr(CTA_SUPPORT_COHORT)}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
