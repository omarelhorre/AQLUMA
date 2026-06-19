"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * LOUPE — a custom magnifying-glass cursor (the "œil critique" made literal).
 *
 * A glass lens trails the pointer everywhere with an eased lag. Over content that
 * opts in with `data-loupe` (the static editorial sections — avis, FAQ, contact)
 * it fills with a TRUE optical zoom: a live, document-space mirror of those
 * sections is scaled inside the lens so the point under the glass is genuinely
 * magnified. Over the cinematic sections (GSAP-pinned pans, scrubbed videos, the
 * three.js scene) a live pixel mirror is impossible without jank, so the lens
 * stays an elegant empty glass disc rather than showing the wrong frame.
 *
 * Yields to the native cursor over modals + form fields. Disabled on touch and
 * under reduced motion — pure enhancement, never required.
 */

const DIAMETER = 36; // lens size (px)
const R = DIAMETER / 2;
const ZOOM = 1.9; // magnification factor
const LAG = 0.2; // eased-follow factor (higher = snappier)

const SUSPEND_SEL =
  "[role='dialog'], input, textarea, select, [contenteditable], [contenteditable='true']";

export default function Loupe() {
  const [enabled, setEnabled] = useState(false);
  const lensRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    const lens = lensRef.current;
    const mirror = mirrorRef.current;
    const main = document.querySelector("main");
    if (!lens || !mirror || !main) return;

    const sections = Array.from(
      main.querySelectorAll<HTMLElement>("[data-loupe]"),
    );

    // Rebuild the document-space mirror: clones of the opted-in sections placed
    // at their absolute document coordinates. The mirror's local coords then map
    // 1:1 to document coords, so the lens transform is a clean translate+scale.
    const buildMirror = () => {
      mirror.replaceChildren();
      mirror.style.width = document.documentElement.clientWidth + "px";
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        const clone = sec.cloneNode(true) as HTMLElement;
        clone.removeAttribute("id");
        clone
          .querySelectorAll("[id]")
          .forEach((n) => n.removeAttribute("id"));
        Object.assign(clone.style, {
          position: "absolute",
          top: rect.top + window.scrollY + "px",
          left: rect.left + window.scrollX + "px",
          width: rect.width + "px",
          margin: "0",
        });
        mirror.appendChild(clone);
      }
    };
    buildMirror();

    let rebuildT = 0;
    const scheduleRebuild = () => {
      clearTimeout(rebuildT);
      rebuildT = window.setTimeout(buildMirror, 160);
    };
    // Height changes (FAQ accordion) + layout shifts + scroll (parallax drift).
    const ro = new ResizeObserver(scheduleRebuild);
    sections.forEach((s) => ro.observe(s));
    window.addEventListener("resize", scheduleRebuild);
    window.addEventListener("scroll", scheduleRebuild, { passive: true });

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let over = false;
    let suspended = false;
    let wasSuspended = false;
    let raf = 0;

    const root = document.documentElement;
    root.classList.add("loupe-on");

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      over = !!el?.closest("[data-loupe]");
      suspended = !!el?.closest(SUSPEND_SEL);
    };

    const tick = () => {
      x += (tx - x) * LAG;
      y += (ty - y) * LAG;
      lens.style.transform = `translate3d(${x - R}px, ${y - R}px, 0)`;
      // Focal point uses the eased lens centre, so magnified content stays glued
      // to the glass as it trails (no drift during fast moves).
      const docX = x;
      const docY = y + window.scrollY;
      mirror.style.transform = `translate(${R - docX * ZOOM}px, ${R - docY * ZOOM}px) scale(${ZOOM})`;
      lens.classList.toggle("loupe--active", over && !suspended);

      if (suspended !== wasSuspended) {
        wasSuspended = suspended;
        lens.classList.toggle("loupe--hidden", suspended);
        root.classList.toggle("loupe-on", !suspended);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onLeave = () => lens.classList.add("loupe--hidden");
    const onEnter = () => !suspended && lens.classList.remove("loupe--hidden");
    document.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rebuildT);
      ro.disconnect();
      window.removeEventListener("resize", scheduleRebuild);
      window.removeEventListener("scroll", scheduleRebuild);
      document.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      root.classList.remove("loupe-on");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={lensRef}
      aria-hidden
      className="loupe pointer-events-none fixed left-0 top-0 z-[80]"
      style={{ width: DIAMETER, height: DIAMETER }}
    >
      <div className="loupe__glass">
        <div ref={mirrorRef} className="loupe__mirror" />
      </div>
      <div className="loupe__glint" />
      <div className="loupe__rim" />
      <div className="loupe__dot" />
    </div>
  );
}
