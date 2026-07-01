"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

// We import the Font Awesome CSS ourselves, so disable its runtime auto-injection
// (prevents the icons flashing oversized before the stylesheet loads).
config.autoAddCss = false;

// Contact channels. Profile URLs are placeholders — swap for the real AQLUMA
// pages. Kept on-palette (cream → gold on hover) rather than flooding each tile
// with its platform brand colour, which fought AQLUMA's warm register.
const CONTACT_SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/aqluma", icon: faFacebookF },
  { label: "Instagram", href: "https://www.instagram.com/aqluma", icon: faInstagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/aqluma", icon: faLinkedinIn },
];

/**
 * Single, app-wide contact modal mounted at the body level (in layout) so it sits
 * above every section regardless of pins/stacking. Any CTA opens it by dispatching
 * a window `aqluma:contact` event — the navbar, the hero, and the closing scene
 * all use this. Frosted backdrop + dark card with the three brand-tinted channels.
 */
export default function ContactModal() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Open on the shared event from any CTA on the page.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("aqluma:contact", onOpen);
    return () => window.removeEventListener("aqluma:contact", onOpen);
  }, []);

  // While open: lock body scroll, move focus in, trap Tab, restore focus on close.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const f = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [open]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contactez-nous"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{
        backgroundColor: "rgba(8,10,12,0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[30rem] rounded-2xl border border-cream/12 bg-obsidian px-8 py-12 text-center shadow-2xl"
        style={{
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
          transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-xl leading-none text-cream/55 transition-colors duration-200 hover:bg-cream/10 hover:text-cream"
        >
          ×
        </button>
        <h3 className="font-didot text-[clamp(1.75rem,3vw,2.2rem)] font-normal tracking-[-0.01em] text-cream">
          Suivez-nous
        </h3>
        <p className="mx-auto mt-3 max-w-[28ch] font-satoshi text-[0.95rem] leading-relaxed text-cream/60">
          Retrouvez AQLUMA sur vos réseaux et écrivez-nous directement.
        </p>
        <div className="mt-9 flex items-center justify-center gap-6">
          {CONTACT_SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="group flex flex-col items-center gap-3"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-cream/15 text-2xl text-cream/80 transition-all duration-300 ease-editorial group-hover:-translate-y-0.5 group-hover:border-gold/50 group-hover:bg-cream/[0.05] group-hover:text-gold">
                <FontAwesomeIcon icon={s.icon} />
              </span>
              <span className="font-satoshi text-[0.85rem] font-medium text-cream/55 transition-colors duration-300 group-hover:text-cream/90">
                {s.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
