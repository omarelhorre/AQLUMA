/**
 * Site-wide blueprint grid — environmental texture, not interface.
 *
 * A fixed backdrop at z-0: it sits BEHIND all content (the sections are transparent
 * over the body's void, so glow / papers / cards / text all layer above it with
 * real depth). The lines are cream at a very low alpha and a strong radial vignette
 * keeps the centre only faintly present while everything dissolves into pure
 * darkness well before the viewport edges — so the grid reads as printed onto a
 * dark wall, felt more than seen, never competing with the typography. Invisible
 * over bright media (hero video, paper, panorama). Pure CSS, no asset.
 */
export default function Grid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(247,244,239,0.019) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(247,244,239,0.019) 1px, transparent 1px)",
        backgroundSize: "clamp(96px, 11vw, 168px) clamp(96px, 11vw, 168px)",
        // Strong vignette: faint at the centre, fully gone before the edges — the
        // grid dissolves into the dark wall rather than ending on a hard border.
        WebkitMaskImage: "radial-gradient(108% 92% at 50% 40%, #000 4%, rgba(0,0,0,0.35) 34%, transparent 64%)",
        maskImage: "radial-gradient(108% 92% at 50% 40%, #000 4%, rgba(0,0,0,0.35) 34%, transparent 64%)",
      }}
    />
  );
}
