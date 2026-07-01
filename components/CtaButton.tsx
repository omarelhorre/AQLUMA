"use client";

import { CTA_LABEL, waLink } from "@/lib/contact";

/**
 * The one canonical conversion CTA — a pill that opens WhatsApp prefilled with the
 * keyword "ADO" (see lib/contact.ts). Reuses the Header CTA's pill recipe so every
 * CTA moment on the page reads identically.
 *
 * `variant` flips it for the surface it sits on: "light" (cream pill on the dark)
 * is the default; "dark" (void pill) is for light cards (e.g. CtaCard). `size`
 * picks the scale — so callers no longer reach for `!important` overrides.
 *
 * Reduced motion is neutralised globally in globals.css (hover transitions).
 */
const VARIANTS = {
  // The hover is a quiet LIFT, not a glow — soft, low-alpha shadow.
  light:
    "bg-cream text-void hover:bg-white hover:shadow-[0_12px_30px_-8px_rgba(247,244,239,0.30)] focus-visible:ring-cream/40",
  dark: "bg-void text-cream hover:bg-ink hover:shadow-[0_14px_34px_-10px_rgba(8,10,12,0.5)] focus-visible:ring-void/30",
} as const;

const SIZES = {
  sm: "px-5 py-2.5 text-[12.5px]",
  md: "px-6 py-3 text-[13px]",
  lg: "px-7 py-3.5 text-[14px]",
} as const;

export default function CtaButton({
  className = "",
  label = CTA_LABEL,
  variant = "light",
  size = "sm",
}: {
  className?: string;
  label?: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}) {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "group/cta inline-flex items-center gap-2 rounded-full font-satoshi font-semibold tracking-tight outline-none transition-all duration-300 ease-editorial hover:-translate-y-[1px] focus-visible:ring-2",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
    >
      {label}
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className="h-3.5 w-3.5 transition-transform duration-300 ease-editorial group-hover/cta:translate-x-[3px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
      </svg>
    </a>
  );
}
