"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { gsap } from "gsap";
import GrowthFigure, { type GrowthFigureHandle } from "./GrowthFigure";

/**
 * GROWTH LINE — the narrative thread that runs through the journey.
 *
 * A faint guide path the figure rides along. Driven imperatively:
 *   ref.setProgress(0..1)  — moves the figure along the path, advances its gait,
 *                            and ages it through this section's slice of the
 *                            global life-stage (stageFrom..stageTo).
 *   ref.playIntro()        — fires a blurry ball from the cursor into the start
 *                            of the line, which resolves into the figure.
 *
 * The figure (GrowthFigure) is hand-rigged in code: it crawls as a baby and
 * rises into a walking human as the journey progresses.
 */

export type GrowthLineHandle = {
  setProgress: (p: number) => void;
  playIntro: () => void;
};

type Props = {
  /** Path data in the 0..1000 viewBox coordinate space. */
  d: string;
  className?: string;
  /** Guide-line colour. */
  trailColor?: string;
  /** Global life-stage (0..1) at this section's local progress 0 and 1. */
  stageFrom?: number;
  stageTo?: number;
  /** Figure box size in px and gait cadence (step cycles across the section). */
  size?: number;
  stepCycles?: number;
};

const VB = 1000;
const TWO_PI = Math.PI * 2;

const GrowthLine = forwardRef<GrowthLineHandle, Props>(function GrowthLine(
  { d, className, trailColor = "#E8B23A", stageFrom = 0, stageTo = 1, size = 116, stepCycles = 6 },
  ref
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<GrowthFigureHandle>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const lenRef = useRef(0);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  const startPoint = () => {
    const path = pathRef.current;
    if (!path) return { x: 0, y: 0 };
    const p = path.getPointAtLength(0);
    const { w, h } = sizeRef.current;
    return { x: (p.x / VB) * w, y: (p.y / VB) * h };
  };

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    lenRef.current = path.getTotalLength();

    const measure = () => {
      sizeRef.current = { w: wrap.clientWidth, h: wrap.clientHeight };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [d]);

  useEffect(() => {
    const track = (e: MouseEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", track, { passive: true });
    return () => window.removeEventListener("mousemove", track);
  }, []);

  useImperativeHandle(ref, () => ({
    setProgress(p) {
      const path = pathRef.current;
      if (!path) return;
      const clamped = Math.min(1, Math.max(0, p));
      const len = lenRef.current;
      const pt = path.getPointAtLength(clamped * len);
      const { w, h } = sizeRef.current;
      const x = (pt.x / VB) * w;
      const y = (pt.y / VB) * h;
      if (charRef.current) charRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const stage = stageFrom + (stageTo - stageFrom) * clamped;
      figureRef.current?.setPose(stage, clamped * stepCycles * TWO_PI);
    },
    playIntro() {
      const ball = ballRef.current;
      const wrap = wrapRef.current;
      const { w, h } = sizeRef.current;
      if (!ball || !wrap || !w || !h) return;
      const { x, y } = startPoint();

      // Launch from the real cursor, converted into the wrap's local space.
      const rect = wrap.getBoundingClientRect();
      const ptr = pointerRef.current;
      const fromX = ptr ? ptr.x - rect.left : x - 70;
      const fromY = ptr ? ptr.y - rect.top : y - 130;

      gsap.killTweensOf([charRef.current, ball]);
      gsap.set(charRef.current, { opacity: 0 });
      gsap.set(ball, { x: fromX, y: fromY, scale: 2.1, opacity: 0, filter: "blur(16px)" });

      const tl = gsap.timeline();
      tl.to(ball, { opacity: 1, duration: 0.12, ease: "power1.out" }, 0);
      tl.to(ball, { x, y, scale: 1, filter: "blur(2px)", duration: 0.7, ease: "power3.out" }, 0);
      tl.to(charRef.current, { opacity: 1, duration: 0.32, ease: "power2.out" }, 0.46);
      tl.to(ball, { opacity: 0, filter: "blur(10px)", duration: 0.24, ease: "power2.in" }, 0.52);
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
          stroke={trailColor}
          strokeOpacity={0.3}
          strokeWidth={1.2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Blurry "fired" ball — flies in from the cursor on playIntro(). */}
      <div
        ref={ballRef}
        className="absolute left-0 top-0 -ml-[13px] -mt-[13px] h-[26px] w-[26px] rounded-full opacity-0 will-change-transform"
        style={{
          background: "radial-gradient(circle, #FFF4D6 0%, #F0C25A 40%, rgba(232,178,58,0) 74%)",
          boxShadow: "0 0 26px 8px rgba(232,178,58,0.6)",
        }}
      />

      {/* The figure — stands on the line (bottom-centre anchored to the point). */}
      <div
        ref={charRef}
        className="absolute left-0 top-0 opacity-0 will-change-transform"
        style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size }}
      >
        <GrowthFigure ref={figureRef} />
      </div>
    </div>
  );
});

export default GrowthLine;
