"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

/**
 * GROWTH FIGURE — a minimal luminous person, drawn + rigged in code.
 *
 * Driven imperatively (no per-frame React re-render):
 *   ref.setPose(stage, gait)
 *     stage 0..1 — life stage: 0 = small baby crawling, 1 = full-height adult.
 *                  Interpolates uprightness, scale, limb base angles.
 *     gait  rad   — cycle phase: swings limbs (a crawl/walk gait) + a vertical bob.
 *
 * Stylised single-weight strokes with a soft gold glow — reads as an intentional
 * editorial mark rather than clip-art, and every number here is tunable.
 */

export type GrowthFigureHandle = {
  setPose: (stage: number, gait: number) => void;
};

const HIP = { x: 50, y: 74 };
const SHO = { x: 50, y: 40 };
const HEAD = { x: 50, y: 27 };
const LEG_LEN = 38;
const ARM_LEN = 30;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const GrowthFigure = forwardRef<GrowthFigureHandle, { color?: string }>(
  function GrowthFigure({ color = "#F7F4EF" }, ref) {
    const rootRef = useRef<SVGGElement>(null);
    const legLRef = useRef<SVGGElement>(null);
    const legRRef = useRef<SVGGElement>(null);
    const armLRef = useRef<SVGGElement>(null);
    const armRRef = useRef<SVGGElement>(null);

    useImperativeHandle(ref, () => ({
      setPose(stage, gait) {
        const s = clamp01(stage);
        const upright = smooth(0.12, 0.46, s); // 0 = crawling, 1 = standing
        const scale = lerp(0.5, 1, s); // baby small → adult full height
        const tilt = lerp(58, 0, upright); // whole-body forward lean when crawling
        const baseLeg = lerp(28, 0, upright); // legs splayed back-down → straight
        const baseArm = lerp(-46, 7, upright); // arms reach to ground → swing at sides
        const amp = lerp(15, 23, upright); // gait swing amplitude
        const sw = Math.sin(gait);
        const sw2 = Math.sin(gait + Math.PI);
        const bob = Math.abs(Math.sin(gait)) * lerp(0.4, 1.8, upright);

        // Scale + lean about the hip, plus a vertical bob.
        rootRef.current?.setAttribute(
          "transform",
          `translate(0 ${-bob}) rotate(${tilt} ${HIP.x} ${HIP.y}) translate(${HIP.x} ${HIP.y}) scale(${scale}) translate(${-HIP.x} ${-HIP.y})`
        );
        legLRef.current?.setAttribute("transform", `rotate(${baseLeg + sw * amp} ${HIP.x} ${HIP.y})`);
        legRRef.current?.setAttribute("transform", `rotate(${baseLeg + sw2 * amp} ${HIP.x} ${HIP.y})`);
        armLRef.current?.setAttribute("transform", `rotate(${baseArm + sw2 * amp} ${SHO.x} ${SHO.y})`);
        armRRef.current?.setAttribute("transform", `rotate(${baseArm + sw * amp} ${SHO.x} ${SHO.y})`);
      },
    }));

    return (
      <svg
        viewBox="0 0 100 120"
        className="h-full w-full overflow-visible"
        fill="none"
        stroke={color}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgba(232,178,58,0.55))" }}
      >
        <g ref={rootRef}>
          <g ref={legLRef}>
            <line x1={HIP.x} y1={HIP.y} x2={HIP.x} y2={HIP.y + LEG_LEN} />
          </g>
          <g ref={legRRef}>
            <line x1={HIP.x} y1={HIP.y} x2={HIP.x} y2={HIP.y + LEG_LEN} />
          </g>
          <line x1={HIP.x} y1={HIP.y} x2={SHO.x} y2={SHO.y} />
          <g ref={armLRef}>
            <line x1={SHO.x} y1={SHO.y} x2={SHO.x} y2={SHO.y + ARM_LEN} />
          </g>
          <g ref={armRRef}>
            <line x1={SHO.x} y1={SHO.y} x2={SHO.x} y2={SHO.y + ARM_LEN} />
          </g>
          <circle cx={HEAD.x} cy={HEAD.y} r={9} fill={color} stroke="none" />
        </g>
      </svg>
    );
  }
);

export default GrowthFigure;
