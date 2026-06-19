# Handoff — Instagram-Reels phone mockup (Le Programme)

Context for the next session. Goal going forward: **swap the footage for both the
Studio and Briefing clips and turn the static phone mockup into a scroll-driven
Instagram-style animation.**

## Where things stand

`components/ProgramHighlights.tsx` (`#programme` section) was reworked into a
two-column layout:

- **Left** — the three acts (Briefing → Musée → Studio) as a numbered vertical
  stepper with a gold spine. Content lives in the `ACTS` array near the top.
- **Right** — a **sticky** `<aside>` (`lg:sticky lg:top-24`) holding the
  `PhoneReel` component: the briefing clip framed as a phone running an
  Instagram-Reels feed.

### `PhoneReel` component (same file, bottom)

- Device shell: dark bezel, dynamic island, gold ambient glow, 9:16 screen.
- `<video>` is `autoPlay muted loop playsInline preload="metadata"`, currently
  `src="/video/programme-briefing.mp4"`, poster `programme-briefing-poster.jpg`.
- Reels chrome overlay:
  - Handle row — avatar (the brand mark) + `aqluma.education` + `Suivre`. Both
    the handle and the Suivre button link to
    `https://www.instagram.com/aqluma.education/` (new tab).
  - Side action rail — `ReelAction` helper renders icon + static count
    (heart 10,3 k · comment 284 · share 1 942). Heart path is a clean symmetric
    outline. Counts are placeholders.
  - Caption + a "86,7 k vues" views row (play triangle). Placeholder number.

## Assets

Videos live in `public/video/`. Originals are in `assets/`.

| Purpose | public path | source in `assets/` |
| --- | --- | --- |
| Briefing reel (in PhoneReel) | `/video/programme-briefing.mp4` + `-poster.jpg` | `briefing.mp4`, poster from `briefingSection.jpeg` |
| Studio hook (scrubbed hero) | `/video/studio-hook.mp4` + `-poster.jpg` | — |

`briefing.mp4` is **1080×1920 (9:16, ~5s)** — already vertical, ideal for the
phone frame. Keep new footage 9:16 for the phone mockup.

### To swap footage

1. Drop the new file in `public/video/` (or overwrite the existing names).
2. Generate a poster: `ffmpeg -i <clip>.mp4 -frames:v 1 <clip>-poster.jpg`.
3. Update `src`/`poster` in the relevant component if you rename.

## Brand mark (done this session)

`public/brand/aqluma-mark.png` (transparent, 653×526) is now the favicon
(`app/layout.tsx`), header logo (`components/Header.tsx`), and the Reels avatar.
Old `aqluma-logo.svg`/`.png` in `public/brand` are unused but still present.

## Next: scroll-driven Reels animation

The phone is currently **static (ambient loop) + CSS sticky**. To make it a
scroll animation, follow the existing GSAP + ScrollTrigger pattern already used
in this repo — see `components/StudioHero.tsx` for the canonical example:

- `gsap.registerPlugin(ScrollTrigger)`, pin the section, `scrub`.
- Scrub `video.currentTime` to scroll progress via `gsap.quickTo(...)` instead of
  autoplay (so the footage advances as you scroll).
- Use `lib/lazyVideo.ts` → `lazyPreloadVideo(section, video)` so the clip buffers
  ~1.5 viewports ahead (scrubbed videos must be fully loaded to seek smoothly;
  pair with `preload="metadata"`).
- Honor `useReducedMotion()` (`lib/useReducedMotion.ts`): render a static frame,
  no pin, for reduced-motion users — every animated section here does this.

Idea space (decide with the user): scrub between the Briefing reel and the Studio
reel as you scroll (cross-fade / phone swaps the clip), and/or have the phone
itself translate/scale through the section while the left stepper advances.

## Conventions / guardrails

- Design tokens (tailwind): `void` `#080A0C`, `ink`, `clay` `#C9612E`,
  `brass`, `gold` `#E8B23A`, `cream`. Fonts: `font-didot` (headings),
  `font-satoshi` (body), `tracking-kicker` for gold kickers.
- French copy goes through `fr()` in `lib/typo.ts` (guillemets + thin no-break
  spaces). Don't hand-type `«` / `»` / NBSP.
- House style = **polish, not rebuild**: surgical edits, preserve AQLUMA's
  signature; reuse existing patterns (gold-diamond marker, scrub heroes).
- Verify with `npx tsc --noEmit -p tsconfig.json` after edits.
