"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Minimal custom cursor (§8, polish only): a small cream dot that trails the
 * pointer and scales up over interactive elements. Disabled entirely on touch
 * devices and under reduced motion — pure enhancement, never required.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    // Only on devices with a fine pointer (mouse/trackpad).
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const dot = dotRef.current;
    if (!dot) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const isInteractive = (el: EventTarget | null) =>
      el instanceof Element && !!el.closest("a, button, [data-cursor='hover']");
    const onOver = (e: MouseEvent) =>
      dot.classList.toggle("cursor-dot--hover", isInteractive(e.target));

    const tick = () => {
      // long, eased follow — quiet, no spring overshoot
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [reduced]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="cursor-dot pointer-events-none fixed left-0 top-0 z-[70] h-2 w-2 rounded-full bg-cream mix-blend-difference transition-[width,height,background-color] duration-300 ease-editorial"
    />
  );
}
