import Header from "@/components/Header";
import ActDoor from "@/components/ActDoor";
import NarrativeRoom from "@/components/NarrativeRoom";
import LaMethode from "@/components/LaMethode";
import BriefingHero from "@/components/BriefingHero";
import BriefingStudio from "@/components/BriefingStudio";
import TransitionRope from "@/components/TransitionRope";
import MuseumErrors from "@/components/MuseumErrors";
import StudioHero from "@/components/StudioHero";
import StudioReveal from "@/components/StudioReveal";
import FamilyCards from "@/components/FamilyCards";
import PourquoiNest from "@/components/PourquoiNest";
import CtaCard from "@/components/CtaCard";
// Program section parked (recoverable):
// import ProgramManifesto from "@/components/ProgramManifesto";
// import ProgramHighlights from "@/components/ProgramHighlights";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
// Children-comparison parked (recoverable):
// import MindReveal from "@/components/MindReveal";
import ContactClose from "@/components/ContactClose";

/**
 * AQLUMA landing — one shared scroll journey (§0).
 *   Act I     · The Door          — messages, then the scrubbed door opens
 *   Section 1 · Le Constat        — pinned 3-beat: constat → réalité → fausse
 *               solution → « troisième voie » (gold journey-dot glides left)
 *   La Méthode· Six gestes         — pinned, gestes revealed one at a time
 *   Briefing  · Hero               — statement that writes itself in on scroll
 *   Phase 2   · Briefing Studio    — horizontal L→R slider over the desk canvas
 *   Phase 3   · La Descente        — vertical rope transition (terracotta → black)
 *   Phase 4   · Musée des Erreurs  — inverted horizontal R→L gallery
 *   Phase 4.3 · Le Studio          — hook clip + pale-wall L→R gallery
 *   Famille   · scattered cards → left stack, three states (maison / pratique / parents)
 *   Pourquoi  · zig-zag → « Ce qu'AQLUMA n'est pas » (six cards, gold light sweep)
 *   CTA       · « Premier groupe AQLUMA » — the cohort invitation card
 *   Avis      · testimonials from families
 *   FAQ       · Questions fréquentes
 *   Contact   · closing footer + final CTA
 *
 * Parked (commented, recoverable): ProgramManifesto + ProgramHighlights (phone
 * mockup) and MindReveal (the children comparison).
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="top" className="relative">
        <ActDoor />
        <NarrativeRoom />
        <LaMethode />
        <BriefingHero />
        <BriefingStudio />
        <TransitionRope />
        <MuseumErrors />
        <StudioHero />
        <StudioReveal />
        <FamilyCards />
        <PourquoiNest />
        <CtaCard />
        {/* <ProgramManifesto /> — parked */}
        {/* <ProgramHighlights /> — parked (phone mockup) */}
        <Reviews />
        <FAQ />
        {/* <MindReveal /> — children comparison, parked */}
        <ContactClose />
      </main>
    </>
  );
}
