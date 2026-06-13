"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { enabledWorlds } from "@/lib/worlds";
import { useReducedMotion } from "@/lib/useReducedMotion";
import WorldPanel from "./WorldPanel";

/**
 * ACT II — Horizontal Worlds (§7).
 *
 * A pinned section that translates the panel track on the X axis as the user
 * scrolls vertically. Data-driven: renders every panel of every enabled world
 * (Briefing today; Musée/Studio extend the same track once enabled — no code
 * change beyond a worlds[] entry + bg).
 *
 * Reduced motion: no pin/scrub. Panels stack vertically and scroll normally
 * (graceful fallback per §8/§9).
 */
export default function ActWorlds() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Flatten worlds → panels, tagging the first panel of each world.
  const items = useMemo(() => {
    const worlds = enabledWorlds();
    return worlds.flatMap((world) =>
      world.panels.map((panel, i) => ({
        world,
        panel,
        index: i,
        total: world.panels.length,
        isWorldHead: i === 0,
      }))
    );
  }, []);

  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    const stage = stageRef.current;

    const ctx = gsap.context(() => {
      // Quiet entrance: the Briefing hero (terracotta) already carries the color
      // into Act II, so the worlds just settle from a gentle pushed-in scale —
      // terracotta-to-terracotta, seamless. Runs on the inner stage (not the
      // pinned section) so it never disturbs the pin or scrollWidth measurement.
      if (stage) {
        gsap.fromTo(
          stage,
          { scale: 1.08 },
          {
            scale: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          }
        );
      }

      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + (track.scrollWidth - window.innerWidth),
          pin: true,
          scrub: true,
          invalidateOnRefresh: true, // recompute width on resize (§9)
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  // ── Reduced-motion fallback: vertical stack, native scroll ──
  if (reduced) {
    return (
      <section
        ref={sectionRef}
        id="mondes"
        className="relative w-full"
        aria-label="AQLUMA — les mondes"
      >
        <div className="flex flex-col">
          {items.map(({ world, panel, index, total, isWorldHead }) => (
            <WorldPanel
              key={`${world.id}-${panel.id}`}
              world={world}
              panel={panel}
              index={index}
              total={total}
              isWorldHead={isWorldHead}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="mondes"
      className="relative h-screen w-full overflow-hidden"
      aria-label="AQLUMA — les mondes"
    >
      <div ref={stageRef} className="relative h-screen w-full will-change-transform">
        <div ref={trackRef} className="flex h-screen w-max flex-nowrap will-change-transform">
          {items.map(({ world, panel, index, total, isWorldHead }, i) => (
            <WorldPanel
              key={`${world.id}-${panel.id}`}
              world={world}
              panel={panel}
              index={index}
              total={total}
              isWorldHead={isWorldHead}
              priority={i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
