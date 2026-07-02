"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * POINTER GLOW — a soft spotlight that follows the cursor.
 *
 * A large, feathered radial of warm light on a screen blend, so it gently
 * *illuminates* the content it passes over rather than sitting on top like a
 * cursor. It eased-follows the pointer with a slight lag, and fades in/out as the
 * pointer enters/leaves the window (never a hard on/off). Fine-pointer + non-
 * reduced-motion only; one rAF loop, transform/opacity only, so it stays cheap.
 */
export default function PointerGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let o = 0; // eased opacity
    let to = 0; // target opacity

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      to = 1;
    };
    const onLeave = () => { to = 0; };
    const onEnter = () => { to = 1; };

    const tick = () => {
      x += (tx - x) * 0.12; // slight delay / inertia
      y += (ty - y) * 0.12;
      o += (to - o) * 0.07; // slow, natural fade
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      el.style.opacity = o.toFixed(3);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[46] h-[34rem] w-[34rem] rounded-full opacity-0 will-change-[transform,opacity]"
      style={{
        background:
          "radial-gradient(closest-side, rgba(232,178,58,0.07), rgba(232,178,58,0.03) 42%, rgba(232,178,58,0) 72%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
