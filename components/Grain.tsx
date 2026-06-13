/**
 * Site-wide film grain (§2, §8). Fixed, pointer-events-none, very low opacity
 * so dark areas don't read as flat digital black. Pure SVG turbulence — no
 * asset required. (If you prefer a real texture, drop /textures/grain.png and
 * swap the background for `url(/textures/grain.png)`.)
 */
export default function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-soft-light"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        backgroundSize: "160px 160px",
      }}
    />
  );
}
