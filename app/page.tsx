import Header from "@/components/Header";
import ActDoor from "@/components/ActDoor";
import NarrativeRoom from "@/components/NarrativeRoom";
import BriefingHero from "@/components/BriefingHero";
import BriefingStudio from "@/components/BriefingStudio";
import TransitionRope from "@/components/TransitionRope";
import MuseumErrors from "@/components/MuseumErrors";
import StudioHero from "@/components/StudioHero";
import StudioReveal from "@/components/StudioReveal";
import ProgramManifesto from "@/components/ProgramManifesto";
import ProgramHighlights from "@/components/ProgramHighlights";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import MindReveal from "@/components/MindReveal";
import ContactClose from "@/components/ContactClose";

/**
 * AQLUMA landing — one shared scroll journey (§0).
 *   Act I    · The Door         — messages, then the scrubbed door opens
 *   Briefing · Hero             — statement that writes itself in on scroll
 *   Phase 2  · Briefing Studio  — horizontal L→R slider over the desk canvas
 *   Phase 3  · La Descente      — vertical rope transition (terracotta → black)
 *   Phase 4  · Musée des Erreurs — inverted horizontal R→L gallery
 *   Phase 4.3· Le Studio         — hook clip + pale-wall L→R gallery (Think with AI)
 *   Manifesto · horizontal word-pan — one enthusiastic sentence on the programme
 *   Programme · key points distilled from the macro programme (vertical)
 *   Avis     · testimonials from families
 *   FAQ      · Questions fréquentes
 *   L'esprit · the comparison shock (lost adolescent → thinker)
 *   Contact  · simple closing call to action
 * A "growth line" (glowing dot) threads through phases 2–4.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="top" className="relative">
        <ActDoor />
        <NarrativeRoom />
        <BriefingHero />
        <BriefingStudio />
        <TransitionRope />
        <MuseumErrors />
        <StudioHero />
        <StudioReveal />
        <ProgramManifesto />
        <ProgramHighlights />
        <Reviews />
        <FAQ />
        <MindReveal />
        <ContactClose />
      </main>
    </>
  );
}
