import { fr } from "@/lib/typo";
import PaperArtifact from "@/components/PaperArtifact";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";

/**
 * Section 2a — Le constat & Une nouvelle réalité, as a NORMAL-scroll parallax:
 * the blocks sit close together in flow (no empty viewports) and each rises from
 * the bottom as it crosses the viewport, layers drifting at their own speeds for
 * depth — the library note drifts fastest against the slower réalité text.
 * The fausse-solution finale lives in its own pinned morph (FausseSolution).
 */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-7 flex items-center gap-3.5">
      <span
        aria-hidden
        className="h-px w-10 flex-shrink-0"
        style={{ background: "linear-gradient(90deg, rgba(232,178,58,0.75), rgba(232,178,58,0))" }}
      />
      <span className="font-satoshi text-[0.95rem] font-semibold tracking-tight text-gold/90">
        {children}
      </span>
    </div>
  );
}

export default function NarrativeRoom() {
  return (
    <section id="constat" className="relative w-full overflow-hidden bg-void py-32 md:py-48">
      <div className="shell flex flex-col gap-32 md:gap-52">
        {/* ── Le constat ── */}
        <Parallax speed={0.16} className="max-w-3xl">
          <Reveal>
            <Label>Le constat</Label>
            <h2 className="text-balance font-didot text-[clamp(1.9rem,4vw,3.3rem)] font-normal leading-[1.12] tracking-[-0.015em] text-cream">
              {fr("Vous voyez votre adolescent copier-coller des réponses sans même les lire.")}
            </h2>
            <p className="mt-8 max-w-[52ch] text-pretty font-satoshi text-[clamp(1.05rem,1.4vw,1.3rem)] leading-relaxed text-cream/65">
              {fr("L'IA est devenue un raccourci qui éteint l'effort. On croit qu'il travaille. Il ne fait que déléguer.")}
            </p>
          </Reveal>
        </Parallax>

        {/* ── Une nouvelle réalité — text (slow) + note (fast) = parallax depth ── */}
        <div className="grid items-center gap-16 md:grid-cols-2">
          <Parallax speed={0.07}>
            <Reveal className="max-w-xl">
              <Label>Une nouvelle réalité</Label>
              <p className="text-pretty font-satoshi text-[clamp(1.1rem,1.5vw,1.45rem)] leading-relaxed text-cream/75">
                {fr("Ces outils sont déjà dans sa chambre. Il les utilise pour ses devoirs, ses exposés, ses questions. La question n'est plus s'il les utilisera, mais comment.")}
              </p>
            </Reveal>
          </Parallax>

          <Parallax speed={0.3} className="flex justify-center md:justify-end">
            <Reveal y={48}>
              <PaperArtifact variant="note" fastener="tape" tilt={-2.2} className="max-w-[25rem]">
                <blockquote className="text-balance font-didot text-[clamp(1.35rem,2vw,1.7rem)] font-normal leading-[1.32]">
                  {fr('"C\'est comme donner les clés d\'une bibliothèque immense à quelqu\'un qui n\'a pas appris à lire."')}
                </blockquote>
              </PaperArtifact>
            </Reveal>
          </Parallax>
        </div>
      </div>
    </section>
  );
}
