"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { smoothScrollTo } from "@/lib/lenis";
import { CAL_LINK, CAL_CONFIG } from "@/lib/cal";

// The story beats, in scroll order. Anchors map to live section ids; clicks
// smooth-scroll with the fixed-header offset and the item lights up while its
// section is in view (see the scroll-spy below). Concise, editorial labels.
// « Mondes » is now a plain section link (its old dropdown is gone).
const NAV = [
  { id: "constat", label: "Le problème" },
  { id: "methode", label: "La méthode d’AQLUMA" },
  { id: "mondes", label: "Mondes" },
  { id: "transformation", label: "La transformation" },
  { id: "pourquoi", label: "Le parti pris" },
  { id: "cadre", label: "Nos bordures" },
];

/**
 * Fixed, ALWAYS-VISIBLE header for the whole journey. It is never transparent:
 * an opaque vertical gradient-black bar with a hairline base and a soft drop
 * shadow, so copy and worlds read cleanly over every section. Past the hero it
 * deepens its border/shadow a touch for premium separation.
 *
 * Nav: the AQLUMA mark (scrolls to top), the story-beat links (including a simple
 * "Mondes" link), and a single solid-white CTA that opens the cal.com booking.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // header state + scroll-spy: the active item is the last section whose top has
    // crossed a line ~a third down the viewport.
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const line = window.innerHeight * 0.35;
      let cur = "";
      for (const s of NAV) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) cur = s.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const goSection = (id: string) => {
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

        {/* Desktop nav — richer now, so it appears at xl; hamburger sheet below. */}
        <div className="hidden items-center gap-3 xl:flex xl:gap-4">
          {/* Story-beat links — smooth-scroll + active-state highlight while scrolling. */}
          {NAV.map((s) => {
            const on = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goSection(s.id)}
                aria-current={on ? "true" : undefined}
                className={[
                  "relative rounded-sm px-1 py-2 font-satoshi text-[14px] font-medium tracking-tight outline-none transition-colors duration-300 ease-editorial focus-visible:ring-1 focus-visible:ring-cream/30",
                  on ? "text-cream" : "text-cream/70 hover:text-cream",
                ].join(" ")}
              >
                {s.label}
                <span
                  aria-hidden
                  className={[
                    "absolute -bottom-0.5 left-1 right-1 h-px origin-left bg-gold/70 transition-transform duration-300 ease-editorial",
                    on ? "scale-x-100" : "scale-x-0",
                  ].join(" ")}
                />
              </button>
            );
          })}

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
          className="-mr-1 inline-flex h-10 w-10 items-center justify-center rounded-sm text-cream/80 outline-none transition-colors duration-300 ease-editorial hover:text-cream focus-visible:ring-1 focus-visible:ring-cream/30 xl:hidden"
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

      {/* Mobile sheet — full-width panel that drops under the bar (xl:hidden). */}
      <div
        id="mobile-menu"
        className={[
          "overflow-hidden border-t border-cream/[0.06] bg-gradient-to-b from-obsidian to-void transition-[max-height,opacity] duration-500 ease-editorial xl:hidden",
          mobileOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <nav className="mx-auto flex max-w-[1600px] flex-col gap-1 px-6 py-5">
          <span className="px-1 pb-1 font-satoshi text-[12px] font-semibold tracking-tight text-cream/50">
            Sections
          </span>
          {NAV.map((s) => (
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
