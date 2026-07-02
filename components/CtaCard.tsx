import Reveal from "@/components/Reveal";
import CtaButton from "@/components/CtaButton";
import PromptTransform from "@/components/PromptTransform";
import { CTA_SUPPORT_COHORT } from "@/lib/contact";
import { fr } from "@/lib/typo";

/**
 * CTA CARD — the conversion close, as ONE continuous narrative on the large
 * solid-white slab (the Flow-hero gesture, near-full-bleed with a sliver of the
 * dark wall at its edges).
 *
 * The former closing statement and the cohort pitch are merged into a single
 * storytelling sequence, read top to bottom: the stakes (« L'IA sera dans sa
 * vie… ») → a breath → the answer (« Premier groupe AQLUMA. » + programme) →
 * the PromptTransform flow (messy prompt in, clean prompt out — the promise as
 * a process, guiding the eye down) → the CtaButton → the WhatsApp microcopy.
 * The inner blocks arrive on a short cascade (one entrance language,
 * staggered); the slab itself has NO entrance of its own — it emerges over the
 * previous chapter via the one-off ChapterOverlap transition (see
 * ChapterOverlap.tsx), which pins « Ce qu'AQLUMA n'est pas » and slides this
 * panel over it, settling the slab from scale 0.985 → 1. `id="groupe"` +
 * `data-chapter-slab` are its hooks; z-20 keeps the panel above the pinned
 * section during the overlap.
 */

export default function CtaCard() {
  return (
    <section
      id="groupe"
      data-loupe
      className="relative z-20 w-full overflow-hidden py-2.5 md:py-4"
      aria-label="Rejoindre le premier groupe AQLUMA"
    >
      <div className="w-full px-2.5 md:px-4">
        <div
          data-chapter-slab
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-slab bg-cream px-6 py-16 text-center text-void md:min-h-[88vh] md:rounded-slab-lg md:px-20 md:py-24"
        >
          {/* Gold inner frame on the white. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-3 rounded-frame border border-clay/15 md:inset-5 md:rounded-frame-lg"
          />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center">
            {/* 1 — the stakes. The former closing statement opens the chapter;
                « jugement » takes the slab's own warm accent (clay — gold fails
                contrast on cream). */}
            <Reveal>
              <h2 className="section-title text-void">
                {fr("L'IA sera dans sa vie.")}
                <span className="mt-2 block text-void/55">
                  {fr("La question est : avec quel ")}
                  <span className="text-clay">jugement</span>
                  {fr(" ?")}
                </span>
              </h2>
            </Reveal>

            {/* 2 — the answer, after a breath. */}
            <Reveal delay={140}>
              <h3 className="mt-14 font-didot text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight tracking-[-0.015em] text-void">
                Premier groupe AQLUMA.
              </h3>
            </Reveal>

            <Reveal delay={240}>
              <p className="mt-5 max-w-[52ch] text-pretty font-satoshi text-[clamp(1.05rem,1.4vw,1.32rem)] leading-relaxed text-void/65">
                {fr(
                  "Un groupe restreint. Un cadre sérieux. Un programme construit pour que votre adolescent sorte de chaque session avec ",
                )}
                {/* The payoff phrase carries the whole argument (savoir-faire vs
                    obtenu) — full void + bold so it lands before the sentence is
                    even read. */}
                <strong className="font-bold text-void">{fr("quelque chose qu'il sait faire")}</strong>
                {fr(", pas seulement quelque chose qu'il a obtenu.")}
              </p>
            </Reveal>

            {/* 3 — the promise as a process: messy prompt in, clean prompt out.
                Sits between the pitch and the button so the flow itself walks
                the eye down to the CTA. Desktop only, like before. */}
            <Reveal delay={340} className="hidden w-full lg:block">
              <PromptTransform surface="light" />
            </Reveal>

            {/* 4 — the action. */}
            <Reveal delay={440}>
              <div className="mt-12 flex flex-col items-center gap-5 lg:mt-1">
                <CtaButton variant="dark" size="xl" />
                <p className="max-w-[34ch] font-satoshi text-[0.92rem] leading-relaxed text-void/45">
                  {fr(CTA_SUPPORT_COHORT)}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
