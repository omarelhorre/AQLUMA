"use client";

import WorldGallery, { type GalleryBlock } from "./WorldGallery";

/**
 * PHASE — LE STUDIO (créer). A left→right pan across the pale studio wall
 * (scribbled sheet · travertine slab + tablet · clipped AQLUMA boards). Captions
 * are pinned to the wall and reveal in the empty space beside each piece. Pale
 * wall → ink ("light") tone. Copy distilled from the Studio voice-over scripts
 * (assets/scripts.txt): "Stop copying. Start creating." → "Think with AI."
 */

const PAPER = "#ECE7DD";

// One note per piece, glued to the wall beside it and shown one at a time. The
// pan centres each object in turn (`fx` = object centre); object 1 is centred at
// the start, object 3 at the end. Order L→R: feuille · travertin · planches.
// Anchors recomputed for the dezoomed pan (zoomW 165) so each caption keeps the
// SAME on-screen position it had — only the scene shrinks and shows more bg.
const BLOCKS: GalleryBlock[] = [
  {
    n: 1, // feuille griffonnée — caption parked in the empty space to its right;
    //        `wide` lets it claim the big open pale wall beside the sheet
    fx: 0.13,
    left: "21%",
    v: { top: "40%" },
    img: "/responsive/studio/1.jpeg",
    wide: true,
    widthClass: "w-[min(30rem,34vw)]",
    titleClass: "text-[clamp(2.2rem,3.6vw,4.4rem)]",
    noteClass: "max-w-[26ch]",
    title: "La matière brute.",
    note: "Une réponse d’IA, c’est un point de départ. Pas une fin. Ce qui compte, c’est ce que tu en fais.",
  },
  {
    n: 2, // travertin + tablette (centre) — caption to its RIGHT; title sized so it
    //        still clears the clipped floor-plan board to the right
    fx: 0.5,
    left: "58%",
    v: { top: "40%" },
    img: "/responsive/studio/2.jpeg",
    wide: true,
    widthClass: "w-[min(30rem,34vw)]",
    titleClass: "text-[clamp(2rem,3.2vw,3.7rem)]",
    noteClass: "max-w-[24ch]",
    title: "Le brouillon.",
    note: "La première réponse est un brouillon, surtout quand elle a l’air finie. Vérifie, coupe, reformule.",
  },
  {
    n: 3, // planches AQLUMA — caption to their RIGHT on the bare wall; right-anchored
    //        with a fitted width so the whole block reads inside the viewport
    fx: 0.85,
    left: "97%",
    v: { top: "40%" },
    img: "/responsive/studio/3.jpeg",
    wide: true,
    widthClass: "w-[min(22rem,25vw)]",
    noteClass: "max-w-[19ch]",
    titleClass: "text-[clamp(2rem,3.2vw,3.7rem)]",
    title: "Ta voix, signée.",
    note: "Ton contexte, ton exemple, ton angle. Think with AI : penser avec, pour aller plus loin.",
  },
];

export default function StudioReveal() {
  return (
    <WorldGallery
      id="studio-section"
      label="Le Studio"
      image="/studio-world.jpg"
      bg={PAPER}
      tone="light"
      blocks={BLOCKS}
      zoomW={165}
      frameBlend={52}
      endHold={0.55}
      focusY={0.33}
      fadeOut={false}
    />
  );
}
