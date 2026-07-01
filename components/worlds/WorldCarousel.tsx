"use client";

import { useEffect, useRef, useState } from "react";
import { fr } from "@/lib/typo";
import type { GalleryBlock } from "@/lib/worldsData";

/**
 * Shared caption + mobile carousel for the worlds ribbon. Lifted out of the old
 * WorldGallery unchanged: `Caption` renders one object's note (desktop pan +
 * mobile slide), `WorldCarousel` is the phone/tablet/reduced-motion fallback —
 * a native scroll-snap carousel, one object per slide.
 */

export function Caption({
  b,
  tone,
  total,
  compact = false,
}: {
  b: GalleryBlock;
  tone: "dark" | "light";
  total: number;
  /** Phone-card sizing for the mobile carousel (smaller type, full-width note). */
  compact?: boolean;
}) {
  const light = tone === "light";
  const titleC = light ? "text-ink" : "text-cream";
  const bodyC = light ? "text-ink/85" : "text-cream/75";
  const mutedC = light ? "text-ink/45" : "text-cream/45";
  const wide = b.wide;
  // `align: "center"` is a desktop-pan treatment; in the compact carousel every
  // card is the same width, so centring one note reads inconsistent — force left.
  const center = !compact && b.align === "center";

  return (
    <div className={`relative ${center ? "flex flex-col items-center text-center" : ""}`}>
      <span className="mb-4 flex items-center gap-3">
        <span className={`font-satoshi text-[12px] font-medium tabular-nums tracking-tight ${mutedC}`}>
          {`${String(b.n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
        </span>
        <span
          className={`h-px ${wide ? "w-16" : "w-12"}`}
          style={{
            background: light
              ? "linear-gradient(90deg, rgba(15,20,23,0.5), rgba(15,20,23,0))"
              : "linear-gradient(90deg, rgba(247,244,239,0.55), rgba(247,244,239,0))",
          }}
        />
      </span>
      <h2
        className={`font-didot leading-[1.08] tracking-[-0.02em] ${titleC} ${
          compact
            ? "text-[clamp(1.9rem,6.4vw,2.5rem)]"
            : b.titleClass ??
              (wide ? "text-[clamp(2.8rem,4.6vw,5.4rem)]" : "text-[clamp(2.6rem,4.4vw,4.9rem)]")
        }`}
      >
        {fr(b.title)}
      </h2>
      <p
        className={`font-satoshi leading-relaxed ${bodyC} ${
          compact
            ? "mt-3 max-w-none text-[clamp(1rem,3.6vw,1.18rem)]"
            : `${
                wide
                  ? "mt-6 text-[clamp(1.15rem,1.55vw,1.72rem)]"
                  : "mt-5 text-[clamp(1.1rem,1.5vw,1.55rem)]"
              } ${b.noteClass ?? (wide ? "max-w-[34ch]" : "max-w-[28ch]")}`
        }`}
      >
        {fr(b.note)}
      </p>
    </div>
  );
}

// Mobile / tablet presentation of a world: a native horizontal scroll-snap
// carousel. One slide per object — the wide flat-lay is cropped to that object via
// its `fx` anchor (object-position) — caption beneath, a peek of the next slide to
// invite the swipe. No GSAP, no pin: robust on touch and safe under reduced motion.
export function WorldCarousel({
  label,
  image,
  tone,
  blocks,
}: {
  label: string;
  image: string;
  tone: "dark" | "light";
  blocks: GalleryBlock[];
}) {
  const light = tone === "light";
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // Track the centred slide for the dot indicator.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = slideRefs.current.indexOf(e.target as HTMLElement);
            if (i >= 0) setActive(i);
          }
        }
      },
      { root: track, threshold: 0.6 },
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [blocks.length]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const el = slideRefs.current[i];
    if (!track || !el) return;
    track.scrollTo({
      left: el.offsetLeft - (track.clientWidth - el.clientWidth) / 2,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full overflow-hidden py-14">
      <div className="mb-6 flex items-baseline justify-between px-6">
        <span
          className={`font-satoshi text-[12px] font-medium tracking-tight ${
            light ? "text-ink/60" : "text-cream/60"
          }`}
        >
          {label}
        </span>
        <span
          className={`font-satoshi text-[12px] ${light ? "text-ink/55" : "text-cream/55"}`}
          aria-hidden
        >
          Glissez&nbsp;→
        </span>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {blocks.map((b, i) => (
          <article
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="w-[86%] shrink-0 snap-center sm:w-[23rem]"
          >
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-card"
              style={{
                boxShadow: light
                  ? "inset 0 0 0 1px rgba(15,20,23,0.08)"
                  : "inset 0 0 0 1px rgba(247,244,239,0.08)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- flat-lay crop */}
              <img
                src={b.img ?? image}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full select-none object-cover"
                style={{ objectPosition: b.img ? "50% 50%" : `${b.fx * 100}% 50%` }}
              />
            </div>
            <div className="mt-5 px-0.5">
              <Caption b={b} tone={tone} total={blocks.length} compact />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5">
        {blocks.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Aller à l’objet ${i + 1} sur ${blocks.length}`}
            className="flex h-10 w-6 items-center justify-center"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? `w-6 ${light ? "bg-ink/80" : "bg-cream/85"}`
                  : `w-1.5 ${light ? "bg-ink/25" : "bg-cream/30"}`
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
