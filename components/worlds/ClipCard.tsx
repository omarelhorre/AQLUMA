"use client";

import { forwardRef } from "react";
import type { WorldStatement } from "@/lib/worldsData";

/**
 * CLIP CARD — the world's support clip framed as a simple, clean bordered card
 * beside the statement. It's a button: clicking it (or the corner affordance)
 * opens the clip full-screen. The clip sits gently zoomed-in at rest and eases
 * OUT to full frame on hover. The ribbon plays/pauses the inline preview via the
 * forwarded <video> ref.
 */

type Props = {
  video: WorldStatement["video"];
  tone: "dark" | "light";
  /** Open the full-screen lightbox for this clip. */
  onOpen: () => void;
};

function ExpandIcon({ light }: { light: boolean }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke={light ? "#1A1714" : "#F7F4EF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 3H3v5" />
      <path d="M16 3h5v5" />
      <path d="M21 16v5h-5" />
      <path d="M3 16v5h5" />
    </svg>
  );
}

const ClipCard = forwardRef<HTMLVideoElement, Props>(function ClipCard(
  { video, tone, onOpen },
  ref,
) {
  const light = tone === "light";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Agrandir la vidéo en plein écran"
      className="group relative block w-full cursor-pointer overflow-hidden rounded-[1.4rem]"
      style={{
        aspectRatio: "16 / 10",
        border: light
          ? "2px solid rgba(26,23,20,0.22)"
          : "2px solid rgba(247,244,239,0.5)",
        boxShadow: light
          ? "0 30px 64px -32px rgba(26,23,20,0.4)"
          : "0 32px 66px -32px rgba(0,0,0,0.65)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- video, not img */}
      <video
        ref={ref}
        className="h-full w-full scale-[1.08] object-cover transition-transform duration-[1100ms] ease-editorial group-hover:scale-100"
        src={video.src}
        poster={video.poster}
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
      />
      {/* Quiet hover scrim so the corner control stays legible on any frame. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120% 90% at 100% 100%, rgba(0,0,0,0.28), rgba(0,0,0,0) 55%)",
        }}
      />
      {/* Expand affordance — bottom-right, like a lightbox trigger. */}
      <span
        aria-hidden
        className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-transform duration-300 ease-editorial group-hover:scale-110"
        style={{
          background: light ? "rgba(247,244,239,0.85)" : "rgba(8,10,12,0.5)",
          border: light
            ? "1px solid rgba(15,20,23,0.12)"
            : "1px solid rgba(247,244,239,0.28)",
        }}
      >
        <ExpandIcon light={light} />
      </span>
    </button>
  );
});

export default ClipCard;
