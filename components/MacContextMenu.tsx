"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * MAC CONTEXT MENU — the native macOS (Sonoma/Sequoia) right-click menu for a
 * text selection, reconstructed to system metrics and dropped into the headline's
 * right-hand negative space. Reconstructed rather than sourced as an asset (Apple
 * UI art is copyrighted and wouldn't scale crisply); every value is tuned to the
 * real thing — SF Pro Text 13px, the vibrancy material (translucent + heavy
 * backdrop blur + saturation), the accent-highlighted hovered row, a ~5px item
 * radius inside an ~8px menu, hairline separators, right-aligned ⌘-shortcuts, and
 * the system drop shadow with its inner material edge. A macOS pointer rests over
 * « Copier » as if about to click. It fades in once on view, then only floats a
 * hair (menu + a slight independent cursor parallax). No click, ever. Decorative:
 * aria-hidden, pointer-events-none.
 */

const SF = '-apple-system, "SF Pro Text", "SF Pro", system-ui, sans-serif';
const ACCENT = "#0A6CFF"; // system accent (blue) for the hovered row

type Row = { label: string; key?: string; hi?: boolean; sub?: boolean } | "sep";

const ROWS: Row[] = [
  { label: "Couper", key: "⌘X" },
  { label: "Copier", key: "⌘C", hi: true },
  { label: "Coller", key: "⌘V" },
  "sep",
  { label: "Rechercher « copier »" },
  "sep",
  { label: "Partager", sub: true },
];

/** The classic macOS arrow pointer — black fill, white outline, soft shadow. */
function MacPointer({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={19}
      height={23}
      viewBox="0 0 16 20"
      aria-hidden
      className={className}
      style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))", ...style }}
    >
      <path
        d="M1 1 L1 15.7 L4.6 12.3 L7.1 17.9 L9.5 16.8 L7 11.3 L12 11.3 Z"
        fill="#1d1d1f"
        stroke="#ffffff"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MacContextMenu({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity: shown ? 1 : 0, transition: "opacity 0.7s ease" }}
    >
      {/* menu — floats a hair */}
      <div
        style={{
          fontFamily: SF,
          background: "rgba(245,245,247,0.7)",
          backdropFilter: "blur(50px) saturate(180%)",
          WebkitBackdropFilter: "blur(50px) saturate(180%)",
          boxShadow:
            "0 14px 42px -8px rgba(0,0,0,0.38), 0 4px 12px rgba(0,0,0,0.16), 0 0 0 0.5px rgba(0,0,0,0.10), inset 0 0.5px 0 rgba(255,255,255,0.7)",
          animation: reduced ? undefined : "aq-os-float 12s ease-in-out infinite",
        }}
        className="w-[15rem] rounded-[8px] p-[5px] text-[13px] leading-none tracking-[-0.006em] text-[#1d1d1f]"
      >
        {ROWS.map((r, i) =>
          r === "sep" ? (
            <div key={i} className="mx-[7px] my-[4px] h-px bg-black/[0.09]" />
          ) : (
            <div
              key={i}
              className="flex items-center justify-between rounded-[5px] py-[4.5px] pl-[10px] pr-[9px]"
              style={r.hi ? { background: ACCENT, color: "#fff" } : undefined}
            >
              <span className="pr-8">{r.label}</span>
              {r.key ? (
                <span style={{ color: r.hi ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.5)" }}>{r.key}</span>
              ) : r.sub ? (
                <span style={{ color: r.hi ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.45)" }}>{"›"}</span>
              ) : null}
            </div>
          ),
        )}
      </div>

      {/* the pointer, poised over « Copier » (row 2) — a whisper of independent
          float for a subtle parallax against the menu. */}
      <MacPointer
        className="absolute"
        style={{
          left: "7.4rem",
          top: "1.9rem",
          animation: reduced ? undefined : "aq-cursor-float 7.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}
