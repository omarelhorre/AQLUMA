"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { worlds } from "@/lib/worlds";
import { smoothScrollTo } from "@/lib/lenis";

/**
 * Fixed, transparent over the hero. Past the hero it gains a faint backdrop-blur
 * + hairline bottom border, and auto-hides on scroll-down / reveals on scroll-up.
 *
 * Nav is intentionally minimal: the AQLUMA mark (scrolls to top) and a single
 * "Mondes" dropdown listing the three worlds. Disabled worlds read "Bientôt".
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const goingDown = y > lastY.current;
      setHidden(goingDown && y > window.innerHeight * 0.9 && !open);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

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

  const goTop = () => smoothScrollTo(0);

  const goWorld = (id: string, enabled: boolean) => {
    if (!enabled) return;
    setOpen(false);
    smoothScrollTo(`#${id}`, { offset: 0 });
  };

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,backdrop-filter,border-color] duration-500 ease-editorial",
        hidden ? "-translate-y-full" : "translate-y-0",
        scrolled
          ? "border-b border-cream/[0.06] bg-void/30 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 md:px-10">
        {/* Logo — scrolls to top. Clean button: no border, no blue focus ring. */}
        <button
          type="button"
          onClick={goTop}
          aria-label="AQLUMA — haut de page"
          className="group inline-flex items-center rounded-sm outline-none transition-transform duration-300 ease-editorial hover:-translate-y-[2px] focus-visible:ring-1 focus-visible:ring-cream/30"
        >
          <Image
            src="/brand/aqluma-logo.svg"
            alt="AQLUMA"
            width={34}
            height={28}
            priority
            className="h-[28px] w-auto opacity-90 transition-opacity duration-300 group-hover:opacity-100"
          />
        </button>

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
            className="kicker flex items-center gap-2 rounded-sm py-2 text-[11px] text-cream/70 outline-none transition-opacity duration-300 ease-editorial hover:text-cream focus-visible:ring-1 focus-visible:ring-cream/30"
          >
            Mondes
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              aria-hidden
              className={[
                "translate-y-[1px] transition-transform duration-300 ease-editorial",
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
            <ul className="overflow-hidden rounded-md border border-cream/10 bg-ink/80 p-1.5 backdrop-blur-xl">
              {worlds.map((w, i) => (
                <li key={w.id}>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={!w.enabled}
                    onClick={() => goWorld(w.id, w.enabled)}
                    className={[
                      "flex w-full items-center justify-between gap-6 rounded-sm px-3 py-2.5 text-left transition-colors duration-200",
                      w.enabled
                        ? "text-cream/85 hover:bg-cream/[0.06] hover:text-cream"
                        : "cursor-default text-cream/30",
                    ].join(" ")}
                  >
                    <span className="font-satoshi text-[13px] tracking-tight">
                      {w.label}
                    </span>
                    <span className="kicker text-[9px] text-cream/30">
                      {w.enabled ? `0${i + 1}` : "Bientôt"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
