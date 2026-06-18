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
// pages. Each carries its brand colour so the Font Awesome icon reads on-platform.
const CONTACT_SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/aqluma", icon: faFacebookF, color: "#1877F2" },
  { label: "Instagram", href: "https://www.instagram.com/aqluma", icon: faInstagram, color: "#E1306C" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/aqluma", icon: faLinkedinIn, color: "#0A66C2" },
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
        className="relative w-full max-w-[30rem] rounded-2xl border border-cream/12 bg-[#0e1114] px-8 py-12 text-center shadow-2xl"
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
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-cream/55 transition-colors duration-200 hover:bg-cream/10 hover:text-cream"
        >
          ×
        </button>
        <h3 className="font-didot text-[clamp(1.6rem,3vw,2.2rem)] font-normal tracking-[-0.01em] text-cream">
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
              style={{ ["--brand" as string]: s.color }}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-cream/15 text-2xl text-cream transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white">
                <FontAwesomeIcon icon={s.icon} />
              </span>
              <span className="font-satoshi text-[11px] font-medium uppercase tracking-[0.16em] text-cream/55 transition-colors duration-300 group-hover:text-cream/90">
                {s.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
