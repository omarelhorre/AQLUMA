import Header from "@/components/Header";
import ActDoor from "@/components/ActDoor";
import BriefingHero from "@/components/BriefingHero";
import BriefingStudio from "@/components/BriefingStudio";
import TransitionRope from "@/components/TransitionRope";
import MuseumErrors from "@/components/MuseumErrors";
import MindReveal from "@/components/MindReveal";
import Climax from "@/components/Climax";

/**
 * AQLUMA landing — one shared scroll journey (§0).
 *   Act I    · The Door         — messages, then the scrubbed door opens
 *   Briefing · Hero             — statement that writes itself in on scroll
 *   Phase 2  · Briefing Studio  — horizontal L→R slider over the desk canvas
 *   Phase 3  · La Descente      — vertical rope transition (terracotta → black)
 *   Phase 4  · Musée des Erreurs — inverted horizontal R→L gallery
 *   Phase 4.5· L'esprit         — glass 3D AQLUMA + particle brain (white → colour)
 *   Phase 5  · Aqluma est là    — climax + signature brushstroke
 * A "growth line" (glowing dot) threads through phases 2–4.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="top" className="relative bg-void">
        <ActDoor />
        <BriefingHero />
        <BriefingStudio />
        <TransitionRope />
        <MuseumErrors />
        <MindReveal />
        <Climax />
        <footer className="flex h-[34vh] items-center justify-center bg-void">
          <p className="font-satoshi text-[11px] tracking-tight text-cream/35">
            AQLUMA — © {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </>
  );
}
