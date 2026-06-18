/**
 * Site-wide film grain (§2, §8). Fixed, pointer-events-none, very low opacity
 * so dark areas don't read as flat digital black. Pure SVG turbulence — no
 * asset required. (If you prefer a real texture, drop /textures/grain.png and
 * swap the background for `url(/textures/grain.png)`.)
 *
 * The layer is 2x viewport and gently translated by `.animate-grain` (globals
 * .css) so the grain reshuffles a few times a second — moving celluloid, not a
 * frozen overlay. Translate stays within the 50% overflow on every side, so the
 * viewport is always covered. Reduced-motion freezes the animation globally.
 */
export default function Grain() {
  return (
    <div
      aria-hidden
      className="animate-grain pointer-events-none fixed left-[-50%] top-[-50%] z-[60] h-[200%] w-[200%] opacity-[0.05] mix-blend-soft-light"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        backgroundSize: "160px 160px",
        willChange: "transform",
      }}
    />
  );
}
