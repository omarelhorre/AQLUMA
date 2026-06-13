import Header from "@/components/Header";
import ActDoor from "@/components/ActDoor";
import BriefingHero from "@/components/BriefingHero";
import ActWorlds from "@/components/ActWorlds";

/**
 * AQLUMA landing — one shared vertical scroll (§0).
 *   Act I  · The Door     — messages, then the scrubbed door opens into the museum
 *   Briefing · Hero       — terracotta statement that writes itself in on scroll
 *   Act II · The Worlds   — pinned horizontal runway (Briefing today)
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="top" className="relative bg-void">
        <ActDoor />
        <BriefingHero />
        <ActWorlds />
        {/* A quiet tail so the last pin can release cleanly. */}
        <footer className="flex h-[40vh] items-center justify-center bg-void">
          <p className="kicker text-[11px] text-cream/35">
            AQLUMA — © {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </>
  );
}
