# Handoff — Responsiveness

Working notes for making the AQLUMA landing fully responsive. Pick up here later.

The site is mostly fluid already (clamp() display type, responsive grids, `md`/`lg`
utilities). The real work is the **scroll-pinned / video sections**, which are built
for desktop and need careful mobile handling — they're also where the crashes hide.

---

## Status

### Done (uncommitted in the working tree)
- **`components/Header.tsx`** — nav collapses to a hamburger below `md`; full
  "Mondes" dropdown + CTA at `md+`. Mobile sheet locks body scroll, closes on
  Escape / nav / CTA. Verified at 390px and 1280px.
- **`components/ProgramHighlights.tsx`** — fixed a fatal mobile crash **and** a
  desktop scroll-jump. `isLg` defaults `true` (desktop renders the pinned layout
  from first paint and never flips); the viewport is resolved in an **isomorphic
  layout effect** so a phone swaps to the static stack *before paint and before the
  pinning passive-effect runs* — it never pins, never crashes. See the gotcha below.
- **`components/BriefingHero.tsx`** — killed the vertical seam on the
  `briefing-hook.mp4` support video: FEATHER left mask is now one smooth ramp
  (`transparent → #000 58%`, no mid-inflection) and the legibility wash is a single
  ramp (`0.96 → 0` at 62%). User-confirmed smooth in-browser.

### Not started / TODO
- [ ] **WorldGallery mobile fallback is "not pannable".** `BriefingStudio`,
  `MuseumErrors`, `StudioReveal` all render `components/WorldGallery.tsx`. On mobile
  (`stacked`, `max-width:768px`) it shows the full flat-lay image + stacked captions,
  so the objects are tiny and disconnected from their text. **Plan:** replace the
  stacked branch (`WorldGallery.tsx` ~line 226) with a horizontal **scroll-snap
  carousel** — one object per snap slide, centered via `object-position: ${fx*100}%`
  on the wide image, caption below, slight peek of the next slide to signal swipe.
  Data model: each `GalleryBlock` has `fx` (object centre as image fraction) + title/note.
- [ ] **StudioHero + TransitionRope** use the *same* `right-0 w-[min(66vw,1040px)]`
  FEATHER video pattern (`studio-hook.mp4`, `museum.mp4`) with the same old mask.
  If they show the same seam, apply the identical BriefingHero smoothing.
- [ ] **ProgramManifesto** word-pan is pinned + horizontal on mobile (clipped, no
  overflow, but a mediocre phone experience). Consider a static mobile fallback.
- [ ] **Re-verify ProgramHighlights** on a fresh prod build: mobile must not crash;
  desktop must scroll through *all* sections (3rd program act → Reviews → FAQ → end).
- [ ] Apply same FEATHER/wash smoothing to siblings only after eyeballing each.

---

## Critical gotchas (read before touching pinned sections)

1. **GSAP pin × React = `removeChild` crash.** `ScrollTrigger { pin: true }` wraps a
   React-owned node in a pin-spacer (relocates it in the DOM). If a component ALSO
   swaps its *rendered structure* on a client media-query / reduced-motion flag
   **after** mounting, React reconciles the new structure against the GSAP-moved DOM
   and throws `NotFoundError: removeChild` — blank page in prod (dev silently
   recovers, so it's easy to miss). **Rule:** resolve the viewport in a *layout
   effect* and default to the branch that avoids a post-pin structure flip. This bit
   `ProgramHighlights`; the same pattern lives in `WorldGallery` (`narrow`) — touch
   it carefully. (Also recorded in agent memory: `gsap-pin-react-removechild`.)

2. **Headless Chrome can't decode the `.mp4` support videos** — those sections render
   **black** in automated screenshots, so BriefingHero / StudioHero / TransitionRope
   must be eyeballed in a real browser. DOM measurement (overflow, element rects)
   still works headlessly.

3. **"Horizontal bleed" reports were Google Translate**, not a layout bug. Verified
   `scrollWidth === clientWidth` at every scroll depth. Always retest with Translate
   OFF / in an incognito window.

---

## Breakpoints in use
- `md` = 768px — most sections; `WorldGallery` switches to stacked at `max-width:768px`.
- `lg` = 1024px — `ProgramHighlights` switches to the pinned layout at `min-width:1024px`.

---

## How to verify

```bash
npm run build && PORT=3006 npm run start    # serve the prod build

# static-state full-page screenshot (forces reduced motion → no pins; videos are black)
google-chrome --headless=new --use-gl=angle --use-angle=swiftshader \
  --enable-unsafe-swiftshader --force-prefers-reduced-motion \
  --window-size=390,2400 --screenshot=/tmp/m.png http://localhost:3006/
```

- Check for crashes: grep the browser console for `removeChild`; a blank
  "Application error" page == the GSAP-pin crash above.
- Check horizontal overflow: in devtools/CDP, compare
  `document.documentElement.scrollWidth` vs `clientWidth` at several scroll depths.
- For the video seams, just look in a real browser — headless renders them black.
