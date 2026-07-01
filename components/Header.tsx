"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { worlds } from "@/lib/worlds";
import { smoothScrollTo } from "@/lib/lenis";
import { CAL_LINK, CAL_CONFIG } from "@/lib/cal";

// In-page sections surfaced in the nav (besides the Mondes dropdown). Anchors map
// to live section ids; clicks smooth-scroll with the fixed-header offset.
const SECTIONS = [
  { id: "programme", label: "Le Programme" },
  { id: "avis", label: "Avis" },
  { id: "faq", label: "FAQ" },
];

/**
 * Fixed, ALWAYS-VISIBLE header for the whole journey. It is never transparent:
 * an opaque vertical gradient-black bar with a hairline base and a soft drop
 * shadow, so copy and worlds read cleanly over every section. Past the hero it
 * deepens its border/shadow a touch for premium separation.
 *
 * Nav: the AQLUMA mark (scrolls to top), the "Mondes" dropdown listing the three
 * worlds, and a single solid-white CTA that scrolls to the contact section.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the dropdown on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // mobile sheet: lock body scroll + close on escape
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const goTop = () => {
    setMobileOpen(false);
    smoothScrollTo(0);
  };

  const goWorld = (id: string, enabled: boolean) => {
    if (!enabled) return;
    setOpen(false);
    setMobileOpen(false);
    smoothScrollTo(`#${id}`, { offset: 0 });
  };

  const goSection = (id: string) => {
    setOpen(false);
    setMobileOpen(false);
    smoothScrollTo(`#${id}`, { offset: -80 });
  };

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 border-b bg-obsidian transition-[border-color,box-shadow] duration-500 ease-editorial",
        scrolled
          ? "border-cream/[0.09] shadow-[0_14px_40px_-18px_rgba(0,0,0,0.85)]"
          : "border-cream/[0.05] shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)]",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 md:px-10">
        {/* Logo — scrolls to top. Clean button: no border, no blue focus ring. */}
        <button
          type="button"
          onClick={goTop}
          aria-label="AQLUMA, haut de page"
          className="group inline-flex items-center rounded-sm outline-none transition-transform duration-300 ease-editorial hover:-translate-y-[2px] focus-visible:ring-1 focus-visible:ring-cream/30"
        >
          <Image
            src="/brand/aqluma-mark.png"
            alt="AQLUMA"
            width={35}
            height={28}
            priority
            className="h-[28px] w-auto opacity-90 transition-opacity duration-300 group-hover:opacity-100"
          />
        </button>

        {/* Desktop nav — hidden under md, replaced by the hamburger sheet. */}
        <div className="hidden items-center gap-3 md:flex md:gap-5">
          {/* In-page section links — smooth-scroll with the fixed-header offset. */}
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goSection(s.id)}
              className="rounded-sm px-1 py-2 font-satoshi text-[14px] font-medium tracking-tight text-cream/75 outline-none transition-colors duration-300 ease-editorial hover:text-cream focus-visible:ring-1 focus-visible:ring-cream/30"
            >
              {s.label}
            </button>
          ))}

          {/* Mondes — expandable dropdown */}
          <div
            ref={menuRef}
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="group/btn flex items-center gap-2.5 rounded-sm px-1 py-2 font-satoshi text-[14px] font-medium tracking-tight text-cream/75 outline-none transition-colors duration-300 ease-editorial hover:text-cream focus-visible:ring-1 focus-visible:ring-cream/30"
            >
              <RoomsGlyph />
              Mondes
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden
                className={[
                  "translate-y-[1px] text-cream/45 transition-transform duration-300 ease-editorial group-hover/btn:text-cream/70",
                  open ? "rotate-180" : "rotate-0",
                ].join(" ")}
              >
                <path
                  d="M1 3l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* dropdown panel */}
            <div
              role="menu"
              className={[
                "absolute right-0 top-full min-w-[200px] origin-top-right pt-3 transition-all duration-300 ease-editorial",
                open
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0",
              ].join(" ")}
            >
              <ul className="overflow-hidden rounded-md border border-cream/10 bg-ink/95 p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]">
                {worlds.map((w, i) => (
                  <li key={w.id}>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!w.enabled}
                      onClick={() => goWorld(w.id, w.enabled)}
                      className={[
                        "flex w-full items-center justify-between gap-6 rounded-sm px-3 py-2.5 text-left transition-colors duration-200 ease-editorial",
                        w.enabled
                          ? "text-cream/85 hover:bg-cream/[0.06] hover:text-cream"
                          : "cursor-default text-cream/35",
                      ].join(" ")}
                    >
                      <span className="font-satoshi text-[13.5px] font-medium tracking-tight">
                        {w.label}
                      </span>
                      {w.enabled ? (
                        <span className="font-satoshi text-[11px] tabular-nums text-cream/45">
                          {`0${i + 1}`}
                        </span>
                      ) : (
                        <span className="rounded-full border border-cream/10 bg-cream/[0.04] px-2 py-[3px] font-satoshi text-[10px] font-medium tracking-tight text-cream/55">
                          Bientôt
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA — solid white pill that opens the cal.com booking popup
              (data-cal-link, themed in CalInit). The arrow slides on hover and
              the button lifts a touch (quiet, premium). */}
          <button
            type="button"
            data-cal-link={CAL_LINK}
            data-cal-config={CAL_CONFIG}
            className="group/cta inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 font-satoshi text-[12.5px] font-semibold tracking-tight text-void outline-none transition-all duration-300 ease-editorial hover:-translate-y-[1px] hover:bg-white hover:shadow-[0_12px_30px_-8px_rgba(247,244,239,0.30)] focus-visible:ring-2 focus-visible:ring-cream/40"
          >
            Réserver un appel gratuit de 15 minutes.
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              aria-hidden
              className="translate-x-0 transition-transform duration-300 ease-editorial group-hover/cta:translate-x-[3px]"
            >
              <path
                d="M2.5 7h9M8 3.5L11.5 7 8 10.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Hamburger — mobile only. Two bars morph into an X when open. */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="-mr-1 inline-flex h-10 w-10 items-center justify-center rounded-sm text-cream/80 outline-none transition-colors duration-300 ease-editorial hover:text-cream focus-visible:ring-1 focus-visible:ring-cream/30 md:hidden"
        >
          <span className="relative block h-[12px] w-[22px]">
            <span
              className={[
                "absolute left-0 block h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ease-editorial",
                mobileOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
              ].join(" ")}
            />
            <span
              className={[
                "absolute bottom-0 left-0 block h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ease-editorial",
                mobileOpen ? "bottom-1/2 translate-y-1/2 -rotate-45" : "bottom-0",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      {/* Mobile sheet — full-width panel that drops under the bar (md:hidden). */}
      <div
        id="mobile-menu"
        className={[
          "overflow-hidden border-t border-cream/[0.06] bg-gradient-to-b from-obsidian to-void transition-[max-height,opacity] duration-500 ease-editorial md:hidden",
          mobileOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <nav className="mx-auto flex max-w-[1600px] flex-col gap-1 px-6 py-5">
          <span className="px-1 pb-1 font-satoshi text-[12px] font-semibold tracking-tight text-cream/50">
            Mondes
          </span>
          {worlds.map((w, i) => (
            <button
              key={w.id}
              type="button"
              disabled={!w.enabled}
              onClick={() => goWorld(w.id, w.enabled)}
              className={[
                "flex items-center justify-between gap-6 rounded-sm px-1 py-3.5 text-left transition-colors duration-200",
                w.enabled
                  ? "text-cream/85 active:text-cream"
                  : "cursor-default text-cream/35",
              ].join(" ")}
            >
              <span className="font-satoshi text-[17px] font-medium tracking-tight">
                {w.label}
              </span>
              {w.enabled ? (
                <span className="font-satoshi text-[12px] tabular-nums text-cream/45">
                  {`0${i + 1}`}
                </span>
              ) : (
                <span className="rounded-full border border-cream/10 bg-cream/[0.04] px-2 py-[3px] font-satoshi text-[10px] font-medium tracking-tight text-cream/55">
                  Bientôt
                </span>
              )}
            </button>
          ))}

          {/* In-page sections */}
          <span className="mt-4 px-1 pb-1 font-satoshi text-[12px] font-semibold tracking-tight text-cream/50">
            Sections
          </span>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goSection(s.id)}
              className="flex items-center rounded-sm px-1 py-3.5 text-left font-satoshi text-[17px] font-medium tracking-tight text-cream/85 transition-colors duration-200 active:text-cream"
            >
              {s.label}
            </button>
          ))}

          <button
            type="button"
            data-cal-link={CAL_LINK}
            data-cal-config={CAL_CONFIG}
            onClick={() => setMobileOpen(false)}
            className="group/cta mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-cream px-5 py-3.5 text-center font-satoshi text-[13px] font-semibold tracking-tight text-void outline-none transition-all duration-300 ease-editorial active:bg-white focus-visible:ring-2 focus-visible:ring-cream/40"
          >
            Réserver un appel gratuit de 15 minutes.
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              aria-hidden
              className="transition-transform duration-300 ease-editorial group-hover/cta:translate-x-[3px]"
            >
              <path
                d="M2.5 7h9M8 3.5L11.5 7 8 10.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}

/**
 * Quiet glyph for the "Mondes" nav item — an aperture: a threshold framing a room
 * within a room (the three museum "worlds" are doorways you step through), with a
 * single key-light glint in the upper-left, echoing the site's one warm key light.
 * On-metaphor, not a space cliché. 1.1–1.2px strokes in currentColor so it inherits
 * the label; the inner frame brightens a touch on hover.
 */
function RoomsGlyph() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="-translate-y-[0.5px]"
    >
      {/* outer threshold */}
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.2" />
      {/* inner room — recedes; warms on hover */}
      <rect
        x="7.6"
        y="7.6"
        width="8.8"
        height="8.8"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.5"
        className="transition-opacity duration-300 ease-editorial group-hover/btn:opacity-90"
      />
      {/* upper-left key-light glint */}
      <path d="M6 6.4 L8.6 6.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}
