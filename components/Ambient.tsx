"use client";

import { useEffect, useRef } from "react";

/**
 * AMBIENT — one unified lighting environment for the whole site.
 *
 * A single fixed, pointer-events-none soft-light layer (same family as <Grain>)
 * carrying two very soft, feathered light pools — a warm gold and a cool slate.
 * Their vertical position drifts with scroll progress (`--p`, 0→1), so the light
 * slowly *evolves* as you move down the page while always reading as the same
 * room — never a per-section colour jump. Deliberately faint (Apple-ambient, not
 * a spotlight); the CSS lives in globals `.ambient`. Reduced motion simply leaves
 * `--p` at its scroll value without the rAF loop doing extra work.
 */
export default function Ambient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ref} aria-hidden className="ambient pointer-events-none fixed inset-0 z-[45]" />
      {/* Vignette — a whisper of darkness feathered into the frame's edges so the
          eye settles on the centre. Static, faint, and warm-neutral (the void
          colour), so it reads as photographic focus, not an effect. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[45]"
        style={{
          background:
            "radial-gradient(120% 95% at 50% 45%, rgba(8,10,12,0) 62%, rgba(8,10,12,0.3) 100%)",
        }}
      />
    </>
  );
}
