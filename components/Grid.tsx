/**
 * Site-wide blueprint grid. A fixed, pointer-events-none hairline lattice that
 * sits BEHIND the page content (z-0, over the body's void but under everything
 * in <main>), so the dark canvas reads as a precise, engineered surface rather
 * than flat black. Because it's a true backdrop, opaque media — the hero video,
 * the museum panorama, the phone reels — paints over it and never shows lines.
 * For that to work the dark sections are transparent (they reveal the body void
 * + this grid); only <body> keeps the opaque bg-void base. See app/layout.tsx.
 *
 * Two 1px cream gradients (vertical + horizontal) at a very low alpha on a wide
 * cell, so the lattice stays sparse — a few lines, not a dense mesh. Two soft
 * elliptical mask pools (upper-left, lower-right) let it surface in a couple of
 * places and feather away everywhere else, so it never reads as a uniform sheet.
 * Cream at ~3% is invisible over bright media (hero video, the museum panorama)
 * and only whispers over the dark sections, so it pairs with the Grain layer
 * instead of fighting it. Pure CSS, no asset.
 */
export default function Grid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(247,244,239,0.028) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(247,244,239,0.028) 1px, transparent 1px)",
        backgroundSize: "clamp(96px, 11vw, 168px) clamp(96px, 11vw, 168px)",
        // Two soft pools of visibility instead of one hard ring, so the lattice
        // breathes in a couple of places and dissolves everywhere else — never a
        // uniform sheet edge-to-edge.
        WebkitMaskImage:
          "radial-gradient(70% 60% at 28% 30%, #000 0%, transparent 70%)," +
          "radial-gradient(85% 75% at 78% 78%, rgba(0,0,0,0.55) 0%, transparent 72%)",
        maskImage:
          "radial-gradient(70% 60% at 28% 30%, #000 0%, transparent 70%)," +
          "radial-gradient(85% 75% at 78% 78%, rgba(0,0,0,0.55) 0%, transparent 72%)",
        WebkitMaskComposite: "source-over",
        maskComposite: "add",
      }}
    />
  );
}
