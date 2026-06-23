"use client";

import WorldGallery, { type GalleryBlock } from "./WorldGallery";

/**
 * PHASE 4 — LE MUSÉE DES ERREURS IA. A left→right pan across the dark gallery
 * (framed brushstroke · lit pedestal + tablet · brass teapot + open book).
 * Captions are pinned to the wall and reveal in the empty pocket of each
 * composition — below the framed brushstroke, above the glowing tablet, and in
 * the dark void beside the table — one legible at a time, fading in/out like the
 * Briefing. Copy distilled from the Musée voice-over scripts (assets/scripts.txt).
 *
 * ltr pan: the leftmost exhibit (tableau) is met first → note 01.
 */

const VOID = "#080A0C";

// One note per exhibit, glued to the wall beside it and shown one at a time. The
// pan centres each object in turn (`fx` = object centre); blocks run LEFT→RIGHT by
// fx, so the leftmost exhibit is centred first → note 01. Each caption's left/v are
// tied to its object, so they stay put on screen regardless of pan direction.
const BLOCKS: GalleryBlock[] = [
  {
    n: 1, // tableau encadré (à gauche, fx≈0.19) — texte dans le grand vide sombre à DROITE du cadre
    fx: 0.19,
    left: "26%",
    v: { top: "38%" },
    img: "/responsive/musee/1.jpeg",
    title: "La source qui n’existe pas.",
    note: "Une référence parfaite en apparence : un titre, un auteur, une année, sans jamais en avoir la réalité.",
  },
  {
    n: 2, // socle + tablette (centre, fx≈0.50) — même traitement que « Le calcul » :
    //        légende centrée qui occupe le mur, paragraphe large (2 lignes) au-dessus.
    fx: 0.50,
    left: "30%",
    v: { top: "16%" },
    img: "/responsive/musee/2.jpeg",
    wide: true,
    align: "center",
    widthClass: "w-[min(96rem,88vw)]",
    noteClass: "max-w-[58ch]",
    title: "Le ton ne tremble jamais.",
    note: "Juste ou faux, la réponse garde exactement la même voix : posée, assurée, sans la moindre hésitation. Le ton sûr n’est pas une preuve : la fluidité n’est pas la fiabilité.",
  },
  {
    n: 3, // table + théière (fx≈0.83) — légende qui OCCUPE LE MUR : centrée, haute,
    //        paragraphe large (2 lignes) au-dessus de l’objet isolé.
    fx: 0.83,
    left: "61%",
    v: { top: "25%" },
    img: "/responsive/musee/3.jpeg",
    wide: true,
    align: "center",
    widthClass: "w-[min(96rem,88vw)]",
    noteClass: "max-w-[58ch]",
    title: "Le calcul élégant et faux.",
    note: "Des étapes claires, une présentation propre, une conclusion nette, et une seule erreur glissée au milieu, que l’élégance rend presque invisible. La beauté d’une démonstration ne prouve rien.",
  },
];

export default function MuseumErrors() {
  return (
    <WorldGallery
      id="musee"
      label="Le Musée"
      image="/musee-world.jpg"
      bg={VOID}
      tone="dark"
      blocks={BLOCKS}
      zoomW={185}
      rulePlacement="bottom"
    />
  );
}
