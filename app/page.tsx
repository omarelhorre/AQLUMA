import Header from "@/components/Header";
import ActDoor from "@/components/ActDoor";
import NarrativeRoom from "@/components/NarrativeRoom";
import LaMethode from "@/components/LaMethode";
import JourneyThread from "@/components/JourneyThread";
import WorldsRibbon from "@/components/WorldsRibbon";
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
 *   Les Mondes· One horizontal ribbon — Briefing → Musée → Studio, folding each
 *               world's statement + clip, intro, and gallery into a single pinned
 *               left→right pan on a cross-fading canvas (terracotta → void → paper)
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
      <JourneyThread />
      <main id="top" className="relative">
        <ActDoor />
        <NarrativeRoom />
        <LaMethode />
        <WorldsRibbon />
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
