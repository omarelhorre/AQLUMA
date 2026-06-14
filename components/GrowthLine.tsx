"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";

/**
 * GROWTH LINE — the narrative thread that runs through the journey.
 *
 * A faint guide path with a bright "trail" that paints itself in, and a glowing
 * dot travelling along it. Driven imperatively (no per-frame React re-render):
 *   ref.setProgress(0..1)   — moves the dot + grows the trail to that point
 *
 * The dot is a plain HTML element positioned from the path geometry, so it stays
 * perfectly round even though the SVG is stretched (preserveAspectRatio="none").
 * This is the PLACEHOLDER motif — the literal "baby → adult" character art will
 * be layered onto this same mechanism later.
 */

export type GrowthLineHandle = { setProgress: (p: number) => void };

type Props = {
  /** Path data in the 0..1000 viewBox coordinate space. */
  d: string;
  /** Tailwind colour-ish overrides if a section needs them. */
  className?: string;
  trailColor?: string;
};

const VB = 1000;

const GrowthLine = forwardRef<GrowthLineHandle, Props>(function GrowthLine(
  { d, className, trailColor = "#E8B23A" },
  ref
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const lenRef = useRef(0);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    lenRef.current = path.getTotalLength();
    if (trailRef.current) {
      trailRef.current.style.strokeDasharray = `${lenRef.current}`;
      trailRef.current.style.strokeDashoffset = `${lenRef.current}`;
    }

    const measure = () => {
      sizeRef.current = { w: wrap.clientWidth, h: wrap.clientHeight };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [d]);

  useImperativeHandle(ref, () => ({
    setProgress(p) {
      const path = pathRef.current;
      const dot = dotRef.current;
      if (!path || !dot) return;
      const clamped = Math.min(1, Math.max(0, p));
      const len = lenRef.current;
      const pt = path.getPointAtLength(clamped * len);
      const { w, h } = sizeRef.current;
      const x = (pt.x / VB) * w;
      const y = (pt.y / VB) * h;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (trailRef.current) trailRef.current.style.strokeDashoffset = `${len * (1 - clamped)}`;
    },
  }));

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={["pointer-events-none absolute inset-0 z-30", className].filter(Boolean).join(" ")}
    >
      <svg className="h-full w-full" viewBox={`0 0 ${VB} ${VB}`} preserveAspectRatio="none" fill="none">
        <path
          ref={pathRef}
          d={d}
          stroke="rgba(247,244,239,0.16)"
          strokeWidth={1.1}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={trailRef}
          d={d}
          stroke={trailColor}
          strokeWidth={1.6}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 4px rgba(232,178,58,0.5))" }}
        />
      </svg>

      {/* Glowing travelling dot (HTML → stays round under non-uniform SVG scale). */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 -ml-[8px] -mt-[8px] h-4 w-4 rounded-full will-change-transform"
        style={{
          background: "radial-gradient(circle, #FCE9B8 0%, #E8B23A 46%, rgba(232,178,58,0) 72%)",
          boxShadow: "0 0 16px 4px rgba(232,178,58,0.55)",
        }}
      />
    </div>
  );
});

export default GrowthLine;
