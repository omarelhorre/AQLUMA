import type { Panel, World } from "@/lib/worlds";

type Props = {
  world: World;
  panel: Panel;
  index: number;
  total: number;
  /** First panel of a world shows the world title plate. */
  isWorldHead?: boolean;
  /** Reserved for image-backed worlds; unused in the black/orange treatment. */
  priority?: boolean;
};

/**
 * One full-viewport-width frame of a world's horizontal runway (§7).
 *
 * Black canvas with a single warm orange key light (per the black/orange
 * direction). Each panel carries a clearly-labeled empty placeholder slot where
 * designer content drops in; when `panel.content` is set it replaces the slot.
 */
export default function WorldPanel({
  world,
  panel,
  index,
  total,
  isWorldHead = false,
}: Props) {
  const accent = world.theme.accent;

  return (
    <article
      className="relative h-screen w-screen shrink-0 overflow-hidden"
      style={{ backgroundColor: world.theme.bg }}
      data-world={world.id}
      data-panel={panel.id}
    >
      {/* Warm orange key from the upper-left + quiet falloff — the only light. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(60% 75% at 20% 22%, ${hexA(accent, 0.22)}, rgba(8,10,12,0) 56%), linear-gradient(180deg, rgba(8,10,12,0) 55%, rgba(8,10,12,0.6))`,
        }}
      />
      {/* hairline seam between panels */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-cream/[0.05]" />

      {/* World title plate on the first panel only */}
      {isWorldHead && (
        <div className="absolute left-8 top-1/2 z-10 -translate-y-1/2 md:left-16">
          <p className="kicker text-[11px]" style={{ color: accent }}>
            {world.kicker}
          </p>
          <h2 className="mt-3 font-didot text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] text-cream">
            {world.label}
          </h2>
        </div>
      )}

      {/* Content slot — designer fills `panel.content`; else a labeled placeholder */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-8 md:p-16">
        {panel.content ?? (
          <div
            className="flex aspect-[4/5] w-[min(34vw,420px)] flex-col items-center justify-center rounded-sm border border-dashed border-cream/15 bg-cream/[0.015] text-center"
            role="presentation"
          >
            <span className="kicker text-[10px] text-cream/40">
              [ {panel.placeholderLabel ?? "contenu à venir"} ]
            </span>
            <span className="mt-2 font-satoshi text-[10px] text-cream/25">
              {world.label} · {index + 1}/{total}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

/** hex (#rrggbb) → rgba() string with the given alpha. */
function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
