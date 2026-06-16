"use client";

import WorldGallery, { type GalleryBlock } from "./WorldGallery";

/**
 * PHASE 4 — LE MUSÉE DES ERREURS IA. A right→left pan across the dark gallery
 * (framed brushstroke · lit pedestal + tablet · brass teapot + open book).
 * Captions are pinned to the wall and reveal in the empty pocket of each
 * composition — above the table (théière/livre), above the glowing tablet, and
 * below the framed brushstroke — one legible at a time, fading in/out like the
 * Briefing. Copy distilled from the Musée voice-over scripts (assets/scripts.txt).
 *
 * rtl pan: the rightmost exhibit (teapot/book) is met first → note 01.
 */

const VOID = "#080A0C";

// One note per exhibit, glued to the wall beside it and shown one at a time. The
// pan centres each object in turn (`fx` = object centre); the rightmost exhibit
// is centred first → note 01. Order right→left: théière+livre · socle · tableau.
const BLOCKS: GalleryBlock[] = [
  {
    n: 1, // livre + théière (centré en premier) — texte en grand dans le grand vide sombre à gauche
    fx: 0.87,
    left: "56%",
    v: { top: "22%" },
    wide: true,
    title: "Le calcul élégant et faux.",
    note: "Des étapes claires, une présentation propre, une conclusion nette — et une seule erreur glissée au milieu, que l’élégance rend presque invisible. La beauté d’une démonstration ne prouve rien.",
  },
  {
    n: 2, // socle + tablette — texte en grand dans le grand vide sombre à gauche de l’écran
    fx: 0.50,
    left: "22%",
    v: { top: "24%" },
    wide: true,
    title: "Le ton ne tremble jamais.",
    note: "Juste ou faux, la réponse garde exactement la même voix : posée, assurée, sans la moindre hésitation. Le ton sûr n’est pas une preuve — la fluidité n’est pas la fiabilité.",
  },
  {
    n: 3, // tableau encadré — texte (taille normale) plus bas et plus à droite dans le vide sombre
    fx: 0.12,
    left: "24%",
    v: { top: "44%" },
    title: "La source qui n’existe pas.",
    note: "Un titre crédible, un auteur, une année de publication : tout a l’air en ordre. La forme parfaite d’une référence — sans jamais en avoir la réalité.",
  },
];

export default function MuseumErrors() {
  return (
    <WorldGallery
      id="museum-section"
      label="Le Musée"
      image="/musee-world.jpg"
      bg={VOID}
      tone="dark"
      blocks={BLOCKS}
      zoomW={185}
    />
  );
}
