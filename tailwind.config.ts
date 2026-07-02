import type { Config } from "tailwindcss";

/**
 * AQLUMA design tokens — see §2 of the build brief.
 * The palette is shared across all three "worlds"; per-world surfaces
 * (terracotta etc.) are applied at the component level from lib/worlds.ts.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Surface ladder (darkest → light), so the three near-blacks scattered
        //    across the chrome resolve to ONE source instead of #0a0c0f/#0b0e11/
        //    #0e1114 drifting per file.
        void: "#080A0C", // primary background (the dark)
        obsidian: "#0B0E11", // lifted near-black chrome (header bar, modal cards)
        ink: "#0F1417", // deep surfaces, panels
        stone: "#8A857E", // muted stone / secondary text
        clay: "#C9612E", // warm accent
        brass: "#9A7B45", // metallic accent
        gold: "#E8B23A", // primary highlight / focal accent
        cream: "#F7F4EF", // paper / primary light text
        paper: "#F4F0E7", // warm paper card stock (family deck)
        terracotta: "#8B3A1A", // Briefing world wall + surface
        museumWall: "#0C1519", // Musée seuil wall (deep teal-charcoal)
        studioWall: "#ECE7DD", // Studio paper wall
        screen: "#E8F0FF", // cold "device screen" blue (contrast pop)
      },
      fontFamily: {
        // GFS Didot — display only, never below ~28px (see §3).
        didot: ["var(--font-didot)", "Georgia", "serif"],
        // Satoshi — body / UI / nav / labels.
        satoshi: ["var(--font-satoshi)", "Satoshi", "system-ui", "sans-serif"],
        // Caveat — handwriting, only for the pinned paper note.
        hand: ["var(--font-hand)", "cursive"],
      },
      borderRadius: {
        // One radius scale so cards/panels stop re-inventing arbitrary rounds.
        card: "1.25rem", // media / image cards
        panel: "1.75rem", // raised content panels (testimonial)
        slab: "2rem", // large invitation bays (mobile)
        "slab-lg": "2.75rem", // large invitation bays (desktop)
        frame: "1.6rem", // concentric inner frame
        "frame-lg": "2.25rem", // concentric inner frame (desktop)
      },
      letterSpacing: {
        // NOTE: the old 0.22em "kicker" tracking was removed on purpose — wide
        // letter-spaced caps read as AI-slop here; kickers stay sentence-case +
        // tight (see <Kicker> and the .kicker utility).
        display: "0.01em",
      },
      transitionTimingFunction: {
        // quiet, editorial easing — no spring/bounce
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        // Documented motion-duration scale (matches the Lenis scroll feel).
        micro: "200ms", // hovers / taps
        entrance: "700ms", // element entrances
        scroll: "1100ms", // scroll-coupled motion (see lib/lenis.ts)
      },
    },
  },
  plugins: [],
};

export default config;
