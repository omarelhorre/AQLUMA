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

/*
 * Satoshi (body / UI / labels) loads via the Fontshare CDN @import in
 * globals.css. To fully self-host, download the woff2 files from
 * https://www.fontshare.com/fonts/satoshi into /public/fonts and add a second
 * localFont() here, then expose it as --font-satoshi (and drop the CDN import).
 */
