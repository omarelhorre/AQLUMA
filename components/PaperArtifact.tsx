import type { CSSProperties, ReactNode } from "react";

/**
 * Paper artifact — the recurring visual signature of the site's narrative
 * sections (see the "paper artifacts on the wall" pattern). The dark void is a
 * wall; a key line is rendered on a physical scrap of paper pinned to it.
 *
 * One primitive, several paper types, so every section can drop in its own
 * artifact with a consistent recipe:
 *   · note  — square sticky note            (Le constat)
 *   · card  — index / record card           (La Méthode — six gestes)
 *   · tag   — luggage-tag label
 *   · page  — torn notebook / carnet page    (Ce que les parents reçoivent)
 *
 * Surface + tilt + drop shadow + fastener live here; the caller supplies the
 * content (padded via `contentClassName`) and outer sizing/margins (`className`).
 * Pure/static — scroll motion is layered on by the section that uses it.
 */

type Variant = "note" | "card" | "tag" | "page";
type Fastener = "tape" | "pin" | "none";

const SURFACES: Record<Variant, CSSProperties> = {
  note: { background: "linear-gradient(155deg, #F7F4EF 0%, #EDE6D8 100%)", borderRadius: "3px" },
  card: { background: "linear-gradient(160deg, #FBF9F4 0%, #F0EADC 100%)", borderRadius: "4px" },
  tag:  { background: "linear-gradient(160deg, #EFE7D6 0%, #E0D3BA 100%)", borderRadius: "10px" },
  page: { background: "linear-gradient(155deg, #F7F4EF 0%, #EBE3D3 100%)", borderRadius: "2px" },
};

function Tape() {
  return (
    <span
      aria-hidden
      className="absolute -top-3.5 left-1/2 h-7 w-28 -translate-x-1/2 rotate-[-3deg] rounded-[1px]"
      style={{
        background: "linear-gradient(180deg, rgba(232,178,58,0.28), rgba(201,97,46,0.18))",
        boxShadow: "0 2px 6px -2px rgba(0,0,0,0.35)",
      }}
    />
  );
}

function Pin() {
  return (
    <span
      aria-hidden
      className="absolute -top-2.5 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full"
      style={{
        background: "radial-gradient(circle at 35% 30%, #F4D27A, #C9612E 70%)",
        boxShadow: "0 3px 8px -2px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.6)",
      }}
    />
  );
}

export default function PaperArtifact({
  variant = "note",
  fastener = "tape",
  tilt = -2,
  className = "",
  contentClassName = "px-9 py-10",
  style,
  children,
}: {
  variant?: Variant;
  fastener?: Fastener;
  /** Rotation in degrees — vary it per artifact so they don't read as a grid. */
  tilt?: number;
  /** Outer sizing / margins. */
  className?: string;
  /** Inner content padding. */
  contentClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <figure
      className={`relative inline-block text-ink ${className}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        boxShadow:
          "0 36px 72px -28px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.5)",
        ...SURFACES[variant],
        ...style,
      }}
    >
      {fastener === "tape" && <Tape />}
      {fastener === "pin" && <Pin />}
      <div className={contentClassName}>{children}</div>
    </figure>
  );
}
