"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * CHAPTER OVERLAP — the ONE signature transition of the scroll journey:
 * « Ce qu'AQLUMA n'est pas » (#cadre) → « Premier groupe AQLUMA » (#groupe).
 *
 * As the reader reaches the end of the cadre section it holds in place (pinned,
 * `pinSpacing: false` so no scroll length is added) while the white slab — next
 * in flow, above it in z — keeps travelling: its rounded top corners enter from
 * below the fold and the panel slides over the held section like one heavy
 * physical sheet, settling from scale 0.985 → 1 (editorial deceleration, no
 * bounce). While covered, the cadre content recedes to 95% opacity behind a
 * ≤2.5px blur — readable throughout — and both are lifted as soon as the
 * overlap completes. By the unpin (+110% of viewport) the card + the section
 * after it fully cover the viewport, so the release is invisible.
 *
 * Headless (renders nothing) and deliberately ONE-OFF: do not reuse this
 * mechanic on any other seam — every other section keeps its normal flow.
 * Reduced motion → nothing: plain sequential sections.
 */
export default function ChapterOverlap() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const cadre = document.getElementById("cadre");
    const slab = document.querySelector<HTMLElement>("#groupe [data-chapter-slab]");
    // Blur the section's content wrapper, not the pinned element itself, so the
    // filter never interacts with the pin's positioning.
    const inner = cadre?.querySelector<HTMLElement>(":scope > .shell");
    if (!cadre || !slab || !inner) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: cadre,
        start: "bottom bottom",
        end: "+=110%",
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cadre,
          start: "bottom bottom",
          end: "+=110%",
          scrub: true,
        },
      });
      // The held chapter steps back while the panel passes over it…
      tl.fromTo(
        inner,
        { filter: "blur(0px)", opacity: 1 },
        { filter: "blur(2.5px)", opacity: 0.95, duration: 0.5, ease: "power1.in" },
        0,
      )
        // …and comes back up the moment the transition is complete (it is fully
        // covered by then; scrolling back up replays all of this in reverse).
        .to(inner, { filter: "blur(0px)", opacity: 1, duration: 0.2, ease: "power1.out" }, 0.8)
        // The slab settles into full scale as it arrives — heavy, no bounce.
        .fromTo(
          slab,
          { scale: 0.985, transformOrigin: "50% 100%" },
          { scale: 1, duration: 1, ease: "power2.out" },
          0,
        );
    });

    return () => ctx.revert();
  }, [reduced]);

  return null;
}
