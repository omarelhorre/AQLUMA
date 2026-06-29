"use client";

import { CTA_LABEL, waLink } from "@/lib/contact";

/**
 * The one canonical conversion CTA — a cream pill that opens WhatsApp prefilled
 * with the keyword "ADO" (see lib/contact.ts). Reuses the Header CTA's pill
 * recipe so every CTA moment on the page reads identically.
 *
 * Reduced motion is neutralised globally in globals.css (hover transitions).
 */
export default function CtaButton({
  className = "",
  label = CTA_LABEL,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      className={
        "group/cta inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 font-satoshi text-[12.5px] font-semibold tracking-tight text-void outline-none transition-all duration-300 ease-editorial hover:-translate-y-[1px] hover:bg-white hover:shadow-[0_12px_30px_-8px_rgba(247,244,239,0.45)] focus-visible:ring-2 focus-visible:ring-cream/40 " +
        className
      }
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
