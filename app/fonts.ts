import localFont from "next/font/local";

/**
 * Display face — GFS Didot (weight 400 only). Use ONLY at large display sizes
 * (≥ ~28px), per §3. Self-hosted from /public/fonts (latin subset downloaded
 * from Google Fonts) so there is no network dependency at build/runtime.
 * Exposed as `--font-didot`, wired to Tailwind's `font-didot`.
 */
export const didot = localFont({
  src: [
    {
      path: "../public/fonts/GFSDidot-Latin.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-didot",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/**
 * Handwriting — Caveat (variable, 400–700), used ONLY for the pinned paper note
 * in the problem section. Self-hosted from /public/fonts (latin woff2 pulled from
 * Google Fonts — OFL, same licensing family as GFS Didot; the latin subset covers
 * French accents, guillemets and the thin no-break spaces fr() inserts).
 * Exposed as `--font-hand`, wired to Tailwind's `font-hand`.
 */
export const caveat = localFont({
  src: [
    {
      path: "../public/fonts/Caveat-Latin.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-hand",
  display: "swap",
  fallback: ["Segoe Script", "Comic Sans MS", "cursive"],
});

/**
 * Body / UI / labels — Satoshi, self-hosted from /public/fonts (woff2 pulled from
 * the Fontshare CDN, latin). Only the weights the UI actually uses are shipped:
 * 400 (normal), 500 (medium), 700 (bold). `font-semibold` (600) has no Satoshi
 * face and resolves to 700 — exactly as it did under the old CDN @import.
 * Exposed as `--font-satoshi`, wired to Tailwind's `font-satoshi`. No render-
 * blocking network @import, and font loading is now unified with Didot.
 */
export const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
