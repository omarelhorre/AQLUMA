"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { setSmoothScrollPaused } from "@/lib/lenis";

/**
 * Full-screen clip viewer. Portalled to <body> so it escapes the ribbon's
 * translated/pinned track and covers the whole viewport. Mirrors ContactModal's
 * conventions: dark backdrop, Esc / backdrop / × to close, body-scroll locked and
 * the smooth-scroll driver frozen while open.
 */
export default function VideoLightbox({
  src,
  open,
  onClose,
}: {
  src: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setSmoothScrollPaused(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      setSmoothScrollPaused(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vidéo en plein écran"
      onClick={onClose}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10"
      style={{
        backgroundColor: "rgba(8,10,12,0.93)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.35s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full text-2xl leading-none text-cream/70 transition-colors duration-200 hover:bg-cream/10 hover:text-cream"
        style={{ border: "1px solid rgba(247,244,239,0.22)" }}
      >
        ×
      </button>
      {open && src && (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- decorative support clip
        <video
          key={src}
          src={src}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-2xl shadow-2xl"
          style={{
            transform: open ? "scale(1)" : "scale(0.97)",
            transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
          autoPlay
          loop
          playsInline
          controls
        />
      )}
    </div>,
    document.body,
  );
}
