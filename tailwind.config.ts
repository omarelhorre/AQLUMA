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
        void: "#080A0C", // primary background (the dark)
        ink: "#0F1417", // deep surfaces, panels
        stone: "#8A857E", // muted stone / secondary text
        clay: "#C9612E", // warm accent
        brass: "#9A7B45", // metallic accent
        gold: "#E8B23A", // primary highlight / focal accent
        cream: "#F7F4EF", // paper / primary light text
        terracotta: "#8B3A1A", // Briefing world wall + surface
        screen: "#E8F0FF", // cold "device screen" blue (contrast pop)
      },
      fontFamily: {
        // GFS Didot — display only, never below ~28px (see §3).
        didot: ["var(--font-didot)", "Georgia", "serif"],
        // Satoshi — body / UI / nav / labels.
        satoshi: ["var(--font-satoshi)", "Satoshi", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        kicker: "0.22em", // uppercase kickers / nav labels
        display: "0.01em",
      },
      transitionTimingFunction: {
        // quiet, editorial easing — no spring/bounce
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
