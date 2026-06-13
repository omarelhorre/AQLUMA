# AQLUMA — Website Build Brief

> Hand this entire file to Claude Code as the build spec. Build the front end exactly as described. Premium, sleek, minimal, cinematic. When in doubt, choose restraint.

---

## 0. Mission

Build the **AQLUMA** landing experience as an immersive, scroll-driven, editorial site. It plays out in two acts:

- **Act I — The Door.** A full-viewport video of a **closed door**. As the user scrolls, the video is *scrubbed* frame-by-frame (scroll-linked playback), and on-brand text elements reveal in sequence to introduce AQLUMA. The scroll culminates with **the door opening**.
- **Act II — The Worlds (horizontal).** The instant the door opens, the experience pins and transitions into **horizontal scrolling**. The first world is **Briefing** (terracotta). Two more worlds — **Musée** and **Studio** — follow the same scheme and will be added later, so build this **data-driven and modular**.

The feel: dark, quiet, expensive. Think a Rembrandt-lit museum object film, not a SaaS landing page. Heavy negative space, slow intentional motion, high-contrast editorial typography.

---

## 1. Stack (use exactly this)

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS** (configure the AQLUMA palette as design tokens — see §2)
- **GSAP + ScrollTrigger** — all scroll choreography: video scrubbing, pinning, horizontal scroll. (GSAP and all its plugins are now free.)
- **Lenis** — smooth scroll, synced to ScrollTrigger. *(Alternative: GSAP ScrollSmoother, also free. Default to Lenis.)*
- **next/font** — font loading.

All animation components are client components (`"use client"`). Sync Lenis to GSAP once, globally:

```ts
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

---

## 2. Art Direction — the AQLUMA bible (follow precisely)

AQLUMA is an AI-literacy brand (French + Darija). The web identity is built from three photographic "worlds," each lit with a single warm **Rembrandt key light from the upper left**. Objects — never faces — tell the story.

### Core palette (shared — set as Tailwind tokens)

| Token | Hex | Use |
|---|---|---|
| `void` | `#080A0C` | Primary background (the dark) |
| `ink` | `#0F1417` | Deep surfaces, panels |
| `stone` | `#8A857E` | Muted stone / secondary text |
| `clay` | `#C9612E` | Warm accent |
| `brass` | `#9A7B45` | Metallic accent |
| `gold` | `#E8B23A` | Primary highlight / focal accent |
| `cream` | `#F7F4EF` | Paper / primary light text |
| `terracotta` | `#8B3A1A` | **Briefing** world wall + surface |
| `screen` | `#E8F0FF` | Cold "device screen" blue (contrast pop) |

### World identities

- **BRIEFING** (Act II, world #1): deep terracotta `#8B3A1A` wall + surface, three-quarter editorial angle, modern workspace objects (tablet with a cold `#E8F0FF` screen, notebook, pen, water glass, ruler). Warm Rembrandt key.
- **MUSÉE** (later): near-black `#080A0C` background, aged-wood/stone surface, antique objects (notebook, magnifying lens, quill, brass teapot, index cards). Brass/gold accents.
- **STUDIO** (later): palette **TBD** — leave as a structured token slot to fill in. Keep the same dark + single-warm-light editorial scheme.

### Hard rules

- **No faces. No full-room scenes.** Hands only if a human is unavoidable.
- Lighting + composition carry the mood — keep UI chrome minimal so the photography breathes.
- Motion is **slow, eased, deliberate**. Nothing bouncy or playful. Easing: `power3`/`expo` curves, long durations.
- Add a **very subtle film grain overlay** site-wide (low opacity) so dark areas don't read as flat digital black. Match the photographic feel.

---

## 3. Typography

Two faces, paired for editorial luxury.

- **GFS Didot** — display / large headlines (high-contrast serif, elegant). Load via `next/font/google` (`GFS_Didot`, weight 400 only — so use it **only at large display sizes**).
- **Satoshi** — everything else: body, UI, nav, captions, labels. Geometric grotesque, clean. Load via `next/font/local` (download woff2 from Fontshare). Weights 400/500/700/900.

CDN fallback for Satoshi if local files aren't set up yet:
```css
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap');
```

**Usage rules:**
- Display headlines: GFS Didot, large, tight leading, generous tracking-out for hero lines.
- Nav / labels / kickers: Satoshi, small, uppercase, letter-spaced.
- Body: Satoshi 400/500.
- Never use Didot below ~28px.

---

## 4. Assets — conventions

The human will drop real assets at these paths. Build against this structure; stub anything missing with a labeled placeholder so the layout still runs.

```
/public
  /brand/aqluma-logo.svg        ← header logo (originally "Group 37.png" — rename; prefer SVG, else PNG @2x)
  /video/door.mp4               ← closed → open door clip (scrubbed)
  /video/door-poster.jpg        ← first frame (prevents black flash before load)
  /worlds/briefing/bg.webp      ← Briefing background (terracotta)
  /worlds/musee/bg.webp         ← later
  /worlds/studio/bg.webp        ← later
  /textures/grain.png           ← optional subtle grain
```

> Note on the logo: the source is `Group 37.png`. **Rename it** (no spaces) and, if possible, export to **SVG** for crispness. Render it small and refined — see §5.

---

## 5. Header & logo (sleek + minimal)

- Fixed header, fully transparent over the dark Act I video.
- **Logo** left: `aqluma-logo`, constrained by height (~28–32px), pixel-crisp. Subtle hover (slight opacity lift or 2px translate). No drop shadows.
- Minimal nav right: Satoshi, ~12px, uppercase, letter-spaced, `cream` at ~70% opacity, hover to 100%. Links are placeholders (e.g. `Manifeste`, `Mondes`, `Contact`) — clearly marked editable.
- On scroll past the hero, add a faint `backdrop-blur` + 1px hairline bottom border (`cream` at very low opacity). Optional: auto-hide on scroll-down, reveal on scroll-up.
- Keep it out of the way — the photography is the hero.

---

## 6. ACT I — The Door (scroll-scrubbed video + reveals)

A pinned section ~300vh tall. Scroll progress drives the door video's `currentTime`; the door opens as progress → 1.

### Video scrubbing

```ts
const video = videoRef.current; // muted, playsInline, preload="auto", poster set
video.pause();

ScrollTrigger.create({
  trigger: sectionRef.current,
  start: "top top",
  end: "+=300%",
  pin: true,
  scrub: true,
  onUpdate: (self) => {
    if (video.duration) video.currentTime = self.progress * video.duration;
  },
});
```

- `<video muted playsInline preload="auto" poster="/video/door-poster.jpg">` — these attributes are **required** (esp. for iOS Safari).
- For buttery scrubbing, optionally ease `currentTime` via a proxy + `gsap.quickTo` instead of setting it directly.
- **Encoding tip:** re-encode the door clip with frequent keyframes so seeking is smooth, e.g. `ffmpeg -i door.mp4 -g 1 -c:v libx264 -crf 20 -movflags +faststart -an door.mp4` (every frame a keyframe — fine for a short clip; large but seek-perfect). If video scrubbing ever feels janky, the fallback is an **image sequence rendered to `<canvas>`** — note this option in a comment but don't build it unless needed.

### Reveal choreography (text introducing AQLUMA)

Drive reveals off the same ScrollTrigger timeline, staggered across progress. Use **on-brand placeholder copy** (FR — replace with designer copy later), e.g.:
- ~10%: kicker (Satoshi, uppercase) → `MÉTHODE, PAS OUTIL`
- ~25%: display line (GFS Didot, large) → `Le problème n'est pas l'IA.`
- ~50%: supporting line → `Lire avec esprit critique. Vérifier. Reformuler avec sa propre voix.`
- ~70%: fade prior lines out as the door begins to open.

Each reveal: fade + small upward translate (`y: 24 → 0`), long `power3.out` ease. Lines exit symmetrically. Keep them few and quiet.

### The hand-off (door opens → Act II)

As the final ~15% of the scrub plays (door visibly open), **crossfade** Act I into Act II's Briefing canvas — optionally with a subtle scale-from-center "stepping through the doorway" feel (a match-cut from the dark doorway into the terracotta world). Tasteful, not flashy.

---

## 7. ACT II — Horizontal Worlds (Briefing first)

A pinned section that scrolls **horizontally** as the user scrolls vertically. First (and for now, only populated) world: **Briefing**.

### Modular "worlds" data model

Make worlds data-driven so Musée and Studio plug in later with zero refactor:

```ts
type Panel = { id: string; content?: React.ReactNode }; // designer fills later

type World = {
  id: "briefing" | "musee" | "studio";
  label: string;
  theme: { bg: string; surface: string; ink: string; accent: string };
  background: string; // /worlds/{id}/bg.webp
  panels: Panel[];
};

const worlds: World[] = [
  {
    id: "briefing",
    label: "Le Briefing",
    theme: { bg: "#8B3A1A", surface: "#8B3A1A", ink: "#0F1417", accent: "#C9612E" },
    background: "/worlds/briefing/bg.webp",
    panels: [{ id: "b1" }, { id: "b2" }, { id: "b3" }], // empty placeholder slots
  },
  // musee + studio: stub with palettes from §2, empty panels, hidden/disabled for now
];
```

### Horizontal scroll (pin + translate X)

```ts
const track = trackRef.current;
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: sectionRef.current,
    start: "top top",
    end: () => "+=" + (track.scrollWidth - window.innerWidth),
    pin: true,
    scrub: true,
    invalidateOnRefresh: true, // recompute width on resize
  },
});
```

### Prototype: tiling the Briefing background

The designer's real content comes later. **For the prototype, build the horizontal canvas by tiling the Briefing background image several times side-by-side** (e.g. 4–6 panels), forming one continuous terracotta runway. Each panel is a full-viewport-width frame with the briefing bg. Overlay each with a clearly-labeled **empty placeholder slot** (a faint outlined frame, Satoshi caption like `[ contenu — à venir ]`) so it's obvious where designer content drops in.

Keep the world transitions on-scheme: when Musée/Studio are added, they extend the same horizontal track (or chain as additional acts) using their own palettes — same mechanics, different theme tokens. Structure the code so adding a world = adding a `worlds[]` entry + its bg.

---

## 8. Motion & polish

- Global easing language: `power3` / `expo`, long durations. No spring/bounce.
- **`prefers-reduced-motion`**: disable scrub + pin, show static end-states, allow normal scrolling. Always provide this fallback.
- Subtle **film grain** overlay site-wide (fixed, pointer-events-none, low opacity).
- Optional minimal **custom cursor** (small dot that scales on hover) — polish only, skip if it adds risk.
- Hover states everywhere are quiet: opacity/translate, ~300–500ms.

---

## 9. Performance & robustness

- `poster` on the door video so there's never a black flash pre-load; `preload="auto"`.
- Use `next/image` for the world backgrounds (webp), sized appropriately; door video compressed.
- `ScrollTrigger.refresh()` on resize; `invalidateOnRefresh: true` on the horizontal track so width recomputes responsively.
- Use `will-change` sparingly on animated layers only.
- Lazy-init Act II triggers; clean up GSAP/ScrollTrigger on unmount.
- Mobile: verify scrub + pin behave (iOS quirks). If horizontal pin is rough on small screens, gracefully fall back to vertical stacking of world panels under reduced-motion logic.

---

## 10. Deliverables

- A runnable Next.js app: `npm install` → `npm run dev`.
- Clean component split, e.g.:
  ```
  /app/page.tsx
  /components/Header.tsx
  /components/ActDoor.tsx          (Act I — scrubbed video + reveals)
  /components/ActWorlds.tsx        (Act II — horizontal, renders from worlds[])
  /components/WorldPanel.tsx
  /components/Grain.tsx
  /lib/worlds.ts                   (worlds data model + config)
  /lib/lenis.ts                    (smooth scroll + ScrollTrigger sync)
  /styles + tailwind.config (AQLUMA tokens)
  ```
- All designer content as labeled, obviously-editable placeholders.
- A short `README` noting: where to drop assets (§4), how to add a new world (one `worlds[]` entry + bg), and the Studio palette TODO.

### Definition of done

- [ ] Header with sleek logo, transparent over hero, blur-on-scroll.
- [ ] Satoshi + GFS Didot loaded and applied per §3.
- [ ] AQLUMA palette wired as Tailwind tokens.
- [ ] Act I: door video scrubs smoothly on scroll; on-brand reveals stagger; door opens at the end.
- [ ] Smooth crossfade/match-cut from open door into Briefing.
- [ ] Act II: pinned horizontal scroll across tiled Briefing backgrounds with placeholder content slots.
- [ ] Worlds are data-driven; Musée + Studio stubbed and ready to populate.
- [ ] Grain overlay, reduced-motion fallback, responsive refresh all in place.
- [ ] Premium, minimal, quiet. Restraint over decoration.
