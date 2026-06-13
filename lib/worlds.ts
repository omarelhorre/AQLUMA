/**
 * AQLUMA — "worlds" data model (Act II).
 *
 * Worlds are data-driven so Musée and Studio plug in later with ZERO refactor.
 * To add a world:
 *   1. Drop its background at /public/worlds/{id}/bg.webp
 *   2. Add an entry to `worlds` below (set `enabled: true`)
 *   3. (Studio) fill in the `theme` palette — currently a TODO slot.
 *
 * ActWorlds renders the horizontal runway from `enabledWorlds()`.
 */

import type { ReactNode } from "react";

export type Panel = {
  id: string;
  /** Designer fills this later. Until then a labeled placeholder slot renders. */
  content?: ReactNode;
  /** Optional caption shown inside the empty placeholder frame. */
  placeholderLabel?: string;
};

export type WorldTheme = {
  bg: string; // wall / backdrop
  surface: string; // object surface
  ink: string; // deep panel / text-on-light
  accent: string; // focal accent
};

export type World = {
  id: "briefing" | "musee" | "studio";
  label: string;
  /** Short kicker shown above the world title. */
  kicker: string;
  theme: WorldTheme;
  /** /worlds/{id}/bg.webp */
  background: string;
  /** Empty placeholder slots — designer content drops in here. */
  panels: Panel[];
  /** Stubbed worlds stay hidden until their assets + content exist. */
  enabled: boolean;
};

export const worlds: World[] = [
  {
    id: "briefing",
    label: "Le Briefing",
    kicker: "Monde I",
    theme: {
      bg: "#080A0C", // black canvas
      surface: "#0F1417",
      ink: "#0F1417",
      accent: "#C9612E", // clay/orange key
    },
    background: "/worlds/briefing/bg.webp",
    panels: [
      { id: "b1", placeholderLabel: "contenu — à venir" },
      { id: "b2", placeholderLabel: "contenu — à venir" },
      { id: "b3", placeholderLabel: "contenu — à venir" },
      { id: "b4", placeholderLabel: "contenu — à venir" },
    ],
    enabled: true,
  },
  {
    // MUSÉE — stubbed. Palette from §2. Enable once /worlds/musee/bg.webp exists.
    id: "musee",
    label: "Le Musée",
    kicker: "Monde II",
    theme: {
      bg: "#080A0C", // near-black
      surface: "#0F1417",
      ink: "#0F1417",
      accent: "#9A7B45", // brass
    },
    background: "/worlds/musee/bg.webp",
    panels: [
      { id: "m1", placeholderLabel: "contenu — à venir" },
      { id: "m2", placeholderLabel: "contenu — à venir" },
      { id: "m3", placeholderLabel: "contenu — à venir" },
    ],
    enabled: false,
  },
  {
    // STUDIO — stubbed. Palette TBD (§2): keep the dark + single-warm-light scheme.
    // TODO(studio): fill in theme tokens once art direction is finalized.
    id: "studio",
    label: "Le Studio",
    kicker: "Monde III",
    theme: {
      bg: "#080A0C",
      surface: "#0F1417",
      ink: "#0F1417",
      accent: "#E8B23A", // gold — placeholder accent, replace when defined
    },
    background: "/worlds/studio/bg.webp",
    panels: [
      { id: "s1", placeholderLabel: "contenu — à venir" },
      { id: "s2", placeholderLabel: "contenu — à venir" },
      { id: "s3", placeholderLabel: "contenu — à venir" },
    ],
    enabled: false,
  },
];

export const enabledWorlds = (): World[] => worlds.filter((w) => w.enabled);
