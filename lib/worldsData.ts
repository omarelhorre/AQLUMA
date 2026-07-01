import type { CSSProperties } from "react";

/**
 * LES TROIS MONDES — single source of truth for the horizontal "worlds" ribbon.
 *
 * Each world is one canvas colour (`bg`) that the ribbon cross-fades between
 * (terracotta → void → paper). Per world: a write-on statement + bleeding video,
 * a flat-colour intro (the buffer between video and photos), and a panorama
 * gallery with captions glued to the wall. Copy migrated verbatim from the old
 * BriefingHero/TransitionRope/StudioHero + BriefingStudio/MuseumErrors/StudioReveal.
 */

export type GalleryBlock = {
  /** Counter index (01 / total). */
  n: number;
  /** Object centre as a fraction of the panorama width. */
  fx: number;
  /** Caption anchor on the wall, as a fraction of the panorama width ("40%"). */
  left: string;
  /** Vertical anchor on the wall: `{ top }` or `{ bottom }`. */
  v: CSSProperties;
  title: string;
  note: string;
  /** Wider block with larger type, for a caption in a big open negative space. */
  wide?: boolean;
  noteClass?: string;
  align?: "left" | "center";
  widthClass?: string;
  titleClass?: string;
  /** Dedicated image for the mobile carousel slide (else the panorama is cropped). */
  img?: string;
};

export type WorldStatement = {
  /** Roman numeral marker (I / II / III). */
  marker: string;
  /** Section label beside the marker ("Le Briefing"). */
  label: string;
  /** Tailwind colour class for the marker glyph. */
  markerColor: string;
  /** Tailwind colour class for the section label. */
  labelColor: string;
  /** Ragged-left lines of the statement. */
  lines: string[];
  /** The payoff word rendered in the accent colour. */
  accent: RegExp;
  /** Base fill colour of the type. */
  fill: string;
  /** Accent fill colour (the payoff). */
  fillAccent: string;
  /** Ghost (unfilled) colour — a faint impression before the sweep reaches it. */
  ghost: string;
  /** h2 font-size + leading classes. */
  headingClass: string;
  /** Text-column width on desktop. */
  columnClass: string;
  video: { src: string; poster: string; /** cap the scrub (s) if the clip over-runs */ maxT?: number };
  /** Key-light radial (art direction per world). */
  keyLight: string;
  /** Left legibility wash — a self-coloured fade so the type reads on the canvas. */
  wash: string;
};

export type World = {
  id: string;
  label: string;
  /** The single canvas colour for this world (statement + intro + gallery share it). */
  bg: string;
  tone: "dark" | "light";
  statement: WorldStatement;
  intro: { kicker: string; text: string };
  /** Panorama for the desktop pan. */
  image: string;
  blocks: GalleryBlock[];
  /** Panorama width in viewport-widths (its travel across the ribbon). */
  zoomW: number;
  /** Which fraction of the image HEIGHT sits at the vertical centre (0.5 default). */
  focusY?: number;
  /** Inner transparent radius (%) of the edge vignette. */
  frameBlend?: number;
};

const CREAM = "#F7F4EF";
const GOLD = "#E8B23A";
const TERRA_ACCENT = "#C8662F";
const INK = "#1A1714";
const CLAY = "#C9612E";

export const WORLDS: World[] = [
  // ── I · LE BRIEFING (terracotta) ──────────────────────────────────────────
  {
    id: "briefing",
    label: "Le Briefing",
    bg: "#A04828",
    tone: "dark",
    statement: {
      marker: "I",
      label: "Le Briefing",
      markerColor: "text-gold",
      labelColor: "text-cream",
      lines: ["Votre adolescent croise déjà l'IA.", "Mais est-ce qu'il le fait correctement ?"],
      accent: /correctement/i,
      fill: CREAM,
      fillAccent: GOLD,
      ghost: "rgba(247,244,239,0.12)",
      headingClass: "text-[clamp(1.75rem,4.4vw,3.75rem)] leading-[1.18]",
      columnClass: "md:w-1/2",
      video: { src: "/video/briefing-hook.mp4", poster: "/video/briefing-hook-poster.jpg" },
      keyLight: "radial-gradient(70% 80% at 20% 26%, rgba(232,178,58,0.16), rgba(160,72,40,0) 58%)",
      wash: "linear-gradient(90deg, rgba(74,30,14,0.82) 0%, rgba(74,30,14,0) 62%)",
    },
    intro: {
      kicker: "Le Briefing · Orientation",
      text: "Un espace de lumière douce. Repères, questions, orientation. On définit l'intention avant d'ouvrir la machine. Chaque session commence ici.",
    },
    image: "/briefing.jpg",
    zoomW: 250,
    frameBlend: 52,
    blocks: [
      {
        n: 1,
        fx: 0.2,
        left: "30%",
        v: { top: "30%" },
        img: "/responsive/briefing/1.jpeg",
        wide: true,
        widthClass: "w-[min(36rem,40vw)]",
        noteClass: "max-w-[26ch]",
        title: "La méthode.",
        note: "Recopier une réponse n'apprend rien. Le même geste, avec un cadre, fait comprendre.",
      },
      {
        n: 2,
        fx: 0.5,
        left: "62%",
        v: { top: "30%" },
        img: "/responsive/briefing/2.jpeg",
        wide: true,
        widthClass: "w-[min(36rem,40vw)]",
        noteClass: "max-w-[26ch]",
        title: "L'œil critique.",
        note: "Lire sans croire trop vite. Vérifier, reformuler : le geste d'après que personne ne montre.",
      },
      {
        n: 3,
        fx: 0.9,
        // Caption sits in the open wall to the RIGHT of the notebooks (the gallery
        // no longer clips captions), so the copy reads on the bare canvas instead
        // of overlapping the photo.
        left: "101%",
        v: { top: "34%" },
        img: "/responsive/briefing/3.jpeg",
        wide: true,
        widthClass: "w-[min(22rem,25vw)]",
        noteClass: "max-w-[18ch]",
        titleClass: "text-[clamp(2rem,3.2vw,3.7rem)]",
        title: "La boussole.",
        note: "Un outil doit guider, non transporter. La méthode décide de ce qu'on en fait, et se transmet.",
      },
    ],
  },

  // ── II · LE MUSÉE DES ERREURS (void) ──────────────────────────────────────
  {
    id: "musee",
    label: "Le Musée",
    bg: "#080A0C",
    tone: "dark",
    statement: {
      marker: "II",
      label: "Le Musée",
      markerColor: "text-gold",
      labelColor: "text-cream",
      lines: [
        "Votre IA se trompe déjà,",
        "mais saurez-vous détecter ses erreurs",
        "avant qu'elles ne deviennent vos vérités ?",
      ],
      accent: /vérités/i,
      fill: CREAM,
      fillAccent: TERRA_ACCENT,
      ghost: "rgba(247,244,239,0.10)",
      headingClass: "text-[clamp(1.75rem,3.9vw,3.35rem)] leading-[1.2]",
      columnClass: "md:w-[58%]",
      video: { src: "/video/museum.mp4", poster: "/video/museum-poster.jpg", maxT: 6 },
      keyLight: "radial-gradient(60% 72% at 60% 14%, rgba(150,182,198,0.20), rgba(8,10,12,0) 58%)",
      wash: "linear-gradient(90deg, rgba(8,10,12,0.94) 0%, rgba(8,10,12,0) 62%)",
    },
    intro: {
      kicker: "Le Musée des Erreurs · Vérification",
      text: "Un silence de galerie. Les réponses inexactes sont exposées sur des piédestaux. On apprend à observer ce que les autres ignorent.",
    },
    image: "/musee-world.jpg",
    // Matches the other worlds' zoom (was 185): the pedestals sit far enough apart
    // that each fills its own frame instead of crowding the view.
    zoomW: 250,
    frameBlend: 52,
    blocks: [
      {
        n: 1,
        fx: 0.19,
        left: "26%",
        v: { top: "38%" },
        img: "/responsive/musee/1.jpeg",
        title: "La source qui n'existe pas.",
        note: "Une référence parfaite en apparence : un titre, un auteur, une année, sans jamais en avoir la réalité.",
      },
      {
        n: 2,
        fx: 0.5,
        left: "30%",
        v: { top: "16%" },
        img: "/responsive/musee/2.jpeg",
        wide: true,
        align: "center",
        widthClass: "w-[min(96rem,88vw)]",
        noteClass: "max-w-[58ch]",
        title: "Le ton ne tremble jamais.",
        note: "Juste ou faux, la réponse garde exactement la même voix : posée, assurée, sans la moindre hésitation. Le ton sûr n'est pas une preuve : la fluidité n'est pas la fiabilité.",
      },
      {
        n: 3,
        fx: 0.83,
        left: "61%",
        v: { top: "25%" },
        img: "/responsive/musee/3.jpeg",
        wide: true,
        align: "center",
        widthClass: "w-[min(96rem,88vw)]",
        noteClass: "max-w-[58ch]",
        title: "Le calcul élégant et faux.",
        note: "Des étapes claires, une présentation propre, une conclusion nette, et une seule erreur glissée au milieu, que l'élégance rend presque invisible. La beauté d'une démonstration ne prouve rien.",
      },
    ],
  },

  // ── III · LE STUDIO (paper) ───────────────────────────────────────────────
  {
    id: "studio",
    label: "Le Studio",
    bg: "#ECE7DD",
    tone: "light",
    statement: {
      marker: "III",
      label: "Le Studio",
      markerColor: "text-clay",
      labelColor: "text-ink",
      lines: [
        "Recopier, c'est trois secondes.",
        "Créer, c'est tout le reste,",
        "ce que toi seul peux signer.",
      ],
      accent: /signer/i,
      fill: INK,
      fillAccent: CLAY,
      ghost: "rgba(26,23,20,0.12)",
      headingClass: "text-[clamp(1.75rem,3.9vw,3.35rem)] leading-[1.2]",
      columnClass: "md:w-[58%]",
      video: { src: "/video/studio-hook.mp4", poster: "/video/studio-hook-poster.jpg" },
      keyLight: "radial-gradient(70% 80% at 20% 26%, rgba(201,97,46,0.12), rgba(236,231,221,0) 56%)",
      wash: "linear-gradient(90deg, rgba(236,231,221,0.96) 0%, rgba(236,231,221,0) 62%)",
    },
    intro: {
      kicker: "Le Studio · Création",
      text: "L'atelier de création. Papier, table, intention. Ici, l'IA n'est qu'un pinceau parmi d'autres. L'œuvre finale appartient à l'adolescent.",
    },
    image: "/studio-world.jpg",
    // Matches Briefing's zoom (was 165): objects sit ~85vw apart so each fills its
    // own frame instead of neighbours overflowing into view.
    zoomW: 250,
    frameBlend: 52,
    focusY: 0.33,
    blocks: [
      {
        n: 1,
        fx: 0.13,
        left: "21%",
        v: { top: "40%" },
        img: "/responsive/studio/1.jpeg",
        wide: true,
        widthClass: "w-[min(30rem,34vw)]",
        titleClass: "text-[clamp(2.2rem,3.6vw,4.4rem)]",
        noteClass: "max-w-[26ch]",
        title: "La matière brute.",
        note: "Une réponse d'IA, c'est un point de départ. Pas une fin. Ce qui compte, c'est ce que tu en fais.",
      },
      {
        n: 2,
        fx: 0.5,
        left: "58%",
        v: { top: "40%" },
        img: "/responsive/studio/2.jpeg",
        wide: true,
        widthClass: "w-[min(30rem,34vw)]",
        titleClass: "text-[clamp(2rem,3.2vw,3.7rem)]",
        noteClass: "max-w-[24ch]",
        title: "Le brouillon.",
        note: "La première réponse est un brouillon, surtout quand elle a l'air finie. Vérifie, coupe, reformule.",
      },
      {
        n: 3,
        fx: 0.85,
        // Sits in the open wall to the RIGHT of the portfolio sheets (captions are
        // no longer clipped), so the copy reads on the bare canvas instead of
        // overlapping the photo. The pin's final stop frames both.
        left: "102%",
        v: { top: "34%" },
        img: "/responsive/studio/3.jpeg",
        wide: true,
        widthClass: "w-[min(22rem,25vw)]",
        noteClass: "max-w-[19ch]",
        titleClass: "text-[clamp(2rem,3.2vw,3.7rem)]",
        title: "Ta voix, signée.",
        note: "Ton contexte, ton exemple, ton angle. Think with AI : penser avec, pour aller plus loin.",
      },
    ],
  },
];
