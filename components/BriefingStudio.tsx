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
// pan centres each object in turn (`fx` = object centre) and the caption sits in
// the empty wall to its RIGHT — exactly one object + its note on screen per pan.
// Object centres measured in /briefing.jpg (object-detection sweep):
//   1 · tablette + carnet manuscrit   (centre ≈ 0.13, fx leans onto the carnet)
//   2 · feuille + loupe               (centre ≈ 0.50)
//   3 · boussole + liasse ficelée     (centre ≈ 0.90, liasse hugs the right edge)
// Object 1 is centred at the start of the pan, object 3 at the end.
const BLOCKS: GalleryBlock[] = [
  {
    n: 1, // tablette + carnet — fx centres the carnet so the tablet bleeds off the
    //        faded left edge; the note sits in the open wall to its right. `wide`
    //        lets the caption claim the big empty terracotta wall beside it.
    fx: 0.2,
    left: "30%",
    v: { top: "30%" },
    wide: true,
    widthClass: "w-[min(36rem,40vw)]",
    noteClass: "max-w-[26ch]",
    title: "La méthode.",
    note: "Recopier une réponse n’apprend rien. Le même geste, avec un cadre, fait comprendre.",
  },
  {
    n: 2, // loupe sur la feuille (centre) — caption in the wall to the RIGHT of the
    //        sheet; widened to fill the open wall, note kept off the paper edge
    fx: 0.5,
    left: "62%",
    v: { top: "30%" },
    wide: true,
    widthClass: "w-[min(36rem,40vw)]",
    noteClass: "max-w-[26ch]",
    title: "L’œil critique.",
    note: "Lire sans croire trop vite. Vérifier, reformuler : le geste d’après que personne ne montre.",
  },
  {
    n: 3, // boussole + liasse — the liasse runs to the frame edge, so the caption
    //        sits just past it on the bare terracotta wall (left ≈ 100%); title sized
    //        down a touch and the note narrowed so the whole block reads in the viewport
    fx: 0.9,
    left: "99%",
    v: { top: "30%" },
    wide: true,
    widthClass: "w-[min(22rem,25vw)]",
    noteClass: "max-w-[18ch]",
    titleClass: "text-[clamp(2rem,3.2vw,3.7rem)]",
    title: "La boussole.",
    note: "Un outil doit guider, non transporter. La méthode décide de ce qu’on en fait, et se transmet.",
  },
];

export default function BriefingStudio() {
  return (
    <WorldGallery
      id="briefing-section"
      label="Le Briefing"
      image="/briefing.jpg"
      bg={TERRACOTTA}
      tone="dark"
      blocks={BLOCKS}
      zoomW={250}
      frameBlend={52}
      fadeOut={false}
      endHold={0.55}
    />
  );
}
