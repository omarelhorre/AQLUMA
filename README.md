# AQLUMA — Landing Experience

A cinematic, scroll-driven, editorial site in two acts:

- **Act I — The Door.** Full-viewport door video, scrubbed frame-by-frame as you
  scroll, with on-brand FR text reveals. Scroll culminates with the door opening.
- **Act II — The Worlds.** The open door match-cuts into a pinned **horizontal**
  runway. First world: **Briefing** (terracotta). **Musée** and **Studio** are
  data-driven stubs, ready to enable.

Dark, quiet, expensive — a Rembrandt-lit museum object film, not a SaaS page.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Requires Node 18.18+ (built on Node 24).

## Stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS** — AQLUMA palette wired as tokens (`tailwind.config.ts`)
- **GSAP + ScrollTrigger** — all scroll choreography (scrub, pin, horizontal)
- **Lenis** — smooth scroll, synced to GSAP's ticker (`lib/lenis.ts`)
- **next/font** — GFS Didot (display); Satoshi via Fontshare CDN (see below)

## Project structure

```
app/
  layout.tsx        Root: fonts, SmoothScroll, Grain, Cursor
  page.tsx          Composes Header + Act I + Act II
  fonts.ts          GFS Didot (next/font/google) + Satoshi self-host notes
  globals.css       Tailwind layers, Satoshi CDN import, reduced-motion
components/
  Header.tsx        Transparent → blur-on-scroll, auto-hide, minimal nav
  ActDoor.tsx       Act I — scrubbed video + staggered reveals
  ActWorlds.tsx     Act II — pinned horizontal track, renders from worlds[]
  WorldPanel.tsx    One full-viewport world frame + placeholder content slot
  SmoothScroll.tsx  Mounts Lenis ↔ GSAP sync (reduced-motion aware)
  Grain.tsx         Site-wide SVG film grain
  Cursor.tsx        Optional minimal custom cursor (fine-pointer only)
lib/
  worlds.ts         Worlds data model + config (the modular core)
  lenis.ts          Smooth scroll + ScrollTrigger sync hook
  useReducedMotion.ts
public/
  brand/aqluma-logo.svg        header logo (from "Group 37.pdf")
  video/door.mp4               scrubbed door clip (re-encoded, all keyframes)
  video/door-poster.jpg        first frame (no black flash pre-load)
  worlds/briefing/bg.webp       Briefing background (terracotta)
  worlds/{musee,studio}/        empty — drop bg.webp here to enable
```

## Where to drop assets (§4 of the brief)

| Path | What |
|---|---|
| `public/brand/aqluma-logo.svg` | Header logo (SVG preferred; `.png` @2x fallback included) |
| `public/video/door.mp4` | Door clip — **re-encode with all keyframes** for smooth scrubbing (see below) |
| `public/video/door-poster.jpg` | First frame of the door clip |
| `public/worlds/briefing/bg.webp` | Briefing background |
| `public/worlds/musee/bg.webp` | Musée background (then set `enabled: true`) |
| `public/worlds/studio/bg.webp` | Studio background (then set `enabled: true`) |

### Re-encoding the door video for smooth scrubbing

Scroll scrubbing seeks the video constantly, so it needs a keyframe on **every
frame**. The current `public/video/door.mp4` was produced from the source with:

```bash
ffmpeg -i source.mp4 -g 1 -keyint_min 1 -sc_threshold 0 \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -an \
  public/video/door.mp4
# poster:
ffmpeg -i public/video/door.mp4 -frames:v 1 -q:v 3 public/video/door-poster.jpg
```

If scrubbing ever feels janky, the documented fallback (noted in `ActDoor.tsx`)
is an image-sequence rendered to `<canvas>`.

## How to add a new world (Musée / Studio)

Zero refactor — it's pure data:

1. Drop the background at `public/worlds/{id}/bg.webp`.
2. In `lib/worlds.ts`, set that world's `enabled: true`.
3. (Optional) Replace each panel's empty placeholder by setting `panel.content`.

The horizontal runway extends automatically; `ActWorlds` renders every panel of
every enabled world from `enabledWorlds()`.

### Studio palette — TODO

The Studio `theme` in `lib/worlds.ts` is a **placeholder** (gold accent). Per §2,
the Studio palette is TBD: keep the dark + single-warm-light editorial scheme and
fill in `theme.{bg,surface,ink,accent}` once art direction is finalized.

## Fonts

- **GFS Didot** (display, weight 400 only) loads via `next/font/google` — used
  only at large sizes (`font-didot`, ≥ ~28px).
- **Satoshi** (everything else) currently loads via the Fontshare CDN `@import`
  in `globals.css`. To self-host for production, download the woff2 files into
  `public/fonts/` and switch to `next/font/local` — the exact snippet is in
  `app/fonts.ts`.

## Editable placeholders

- **Nav links** (`Header.tsx`): `Manifeste / Mondes / Contact` — labels + hrefs.
- **Act I copy** (`ActDoor.tsx`): kicker + two display lines (FR placeholder).
- **World panels**: each shows `[ contenu — à venir ]` until `panel.content` is set.

## Accessibility & robustness

- **`prefers-reduced-motion`**: Lenis and all scrub/pin are disabled; Act I shows
  static copy + poster, Act II stacks worlds vertically with native scroll.
- Door video ships a `poster` and `preload="auto"` — no black flash.
- `invalidateOnRefresh` + resize `ScrollTrigger.refresh()` keep the horizontal
  track responsive.
- Film grain is `pointer-events-none`; custom cursor is fine-pointer only.
