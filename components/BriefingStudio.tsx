"use client";

import WorldGallery, { type GalleryBlock } from "./WorldGallery";

/**
 * PHASE 2 — LE BRIEFING (parents). A left→right pan across the terracotta
 * flat-lay (tablet + sketchbook · magnifier · compass + carnet). Captions are
 * pinned to the wall and reveal in the empty space beside each object.
 * Copy distilled from the Briefing voice-over scripts (assets/scripts.txt).
 */

const TERRACOTTA = "#A04828";

// One note per object, glued to the wall beside it and shown one at a time. The
// pan centres each object in turn (`fx` = object centre). Object 1 is centred at
// the very start, object 3 at the end. Object order L→R: carnet · loupe · boussole.
const BLOCKS: GalleryBlock[] = [
  {
    n: 1, // carnet de croquis — caption parked in the empty space to its right
    fx: 0.22,
    left: "33%",
    v: { top: "33%" },
    title: "La méthode.",
    note: "Recopier une réponse n’apprend rien. Le même geste, avec un cadre, fait comprendre.",
  },
  {
    n: 2, // loupe — caption to its RIGHT, with a little breathing room off the object
    fx: 0.58,
    left: "68%",
    v: { top: "33%" },
    title: "L’œil critique.",
    note: "Lire sans croire trop vite. Vérifier, reformuler : le geste d’après que personne ne montre.",
  },
  {
    n: 3, // boussole — caption to its RIGHT, past the carnet; title sized down so it
    //        keeps a margin off the frame edge instead of jamming against it
    fx: 0.84,
    left: "99%",
    v: { top: "33%" },
    noteClass: "max-w-[18ch]",
    titleClass: "text-[clamp(1.8rem,3vw,3.3rem)]",
    title: "La boussole.",
    note: "Un outil doit guider, non transporter. La méthode décide de ce qu’on en fait, et se transmet.",
  },
];

export default function BriefingStudio() {
  return (
    <WorldGallery
      id="briefing-section"
      label="Le Briefing"
      image="/briefing-world.jpg"
      bg={TERRACOTTA}
      tone="dark"
      blocks={BLOCKS}
    />
  );
}
