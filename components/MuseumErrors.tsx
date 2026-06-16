"use client";

import WorldGallery, { type GalleryBlock } from "./WorldGallery";

/**
 * PHASE 4 — LE MUSÉE DES ERREURS IA. A right→left pan across the dark gallery
 * (framed brushstroke · lit pedestal + tablet · brass teapot + open book).
 * Captions are pinned to the wall and reveal in the empty space beside each
 * exhibit. Copy distilled from the Musée voice-over scripts (assets/scripts.txt).
 *
 * rtl pan: the rightmost exhibit (teapot/book) is met first → note 01.
 */

const VOID = "#080A0C";

// One note per exhibit, glued to the wall beside it and shown one at a time. The
// pan centres each object in turn (`fx` = object centre); the rightmost exhibit
// is centred first → note 01. Order right→left: théière+livre · socle · tableau.
const BLOCKS: GalleryBlock[] = [
  {
    n: 1, // livre + théière (centred first) — caption to its left
    fx: 0.86,
    left: "62%",
    v: { top: "33%" },
    title: "Le calcul élégant et faux.",
    note: "Des étapes claires, une conclusion nette — et une erreur glissée au milieu, que l’élégance rend invisible.",
  },
  {
    n: 2, // socle + tablette (centre) — caption to its left
    fx: 0.49,
    left: "26%",
    v: { top: "33%" },
    title: "Le ton ne tremble jamais.",
    note: "Juste ou faux, la réponse garde la même voix. La fluidité n’est pas la fiabilité.",
  },
  {
    n: 3, // tableau encadré (centred last) — caption to its right
    fx: 0.18,
    left: "32%",
    v: { top: "33%" },
    title: "La source qui n’existe pas.",
    note: "Un titre crédible, un auteur, une année. La forme d’une référence — sans jamais en avoir la réalité.",
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
    />
  );
}
