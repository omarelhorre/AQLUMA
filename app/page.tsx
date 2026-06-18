import Header from "@/components/Header";
import ActDoor from "@/components/ActDoor";
import BriefingHero from "@/components/BriefingHero";
import BriefingStudio from "@/components/BriefingStudio";
import TransitionRope from "@/components/TransitionRope";
import MuseumErrors from "@/components/MuseumErrors";
import StudioHero from "@/components/StudioHero";
import StudioReveal from "@/components/StudioReveal";
import MindReveal from "@/components/MindReveal";

/**
 * AQLUMA landing — one shared scroll journey (§0).
 *   Act I    · The Door         — messages, then the scrubbed door opens
 *   Briefing · Hero             — statement that writes itself in on scroll
 *   Phase 2  · Briefing Studio  — horizontal L→R slider over the desk canvas
 *   Phase 3  · La Descente      — vertical rope transition (terracotta → black)
 *   Phase 4  · Musée des Erreurs — inverted horizontal R→L gallery
 *   Phase 4.3· Le Studio         — hook clip + pale-wall L→R gallery (Think with AI)
 *   Phase 4.5· L'esprit         — particle brain (white → colour), Dala-style copy
 * A "growth line" (glowing dot) threads through phases 2–4.
 * (Phase 5 / climax removed — that closing beat is being reworked.)
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
        <StudioHero />
        <StudioReveal />
        <MindReveal />
      </main>
    </>
  );
}
