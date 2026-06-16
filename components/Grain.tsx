/**
 * Site-wide texture (§2, §8) — keeps the dark from ever reading as flat digital
 * black, dala-style. Two fixed, pointer-events-none noise layers, SCREEN-blended:
 * screen only lifts the *darks* (it's a no-op on white/cream), so the void turns
 * into a tactile, dusty charcoal while light copy and the white CTA stay clean.
 * Pure SVG turbulence — no asset required.
 *   · fine layer  — film grain / dust
 *   · coarse layer — soft clumping, for depth (echoes dala's drifting particles)
 * (If you prefer a real texture, drop /textures/grain.png and swap the
 * backgroundImage for `url(/textures/grain.png)`.)
 */
const noise = (freq: number, octaves: number) =>
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='${octaves}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

export default function Grain() {
  return (
    <>
      {/* Fine grain — the matte texture itself. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.06] mix-blend-screen"
        style={{ backgroundImage: noise(0.9, 2), backgroundSize: "200px 200px" }}
      />
      {/* Coarse dust — barely-there clumping for depth. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.04] mix-blend-screen"
        style={{ backgroundImage: noise(0.42, 2), backgroundSize: "260px 260px" }}
      />
    </>
  );
}
