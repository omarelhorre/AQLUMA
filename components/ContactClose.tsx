"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faLinkedinIn, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { fr } from "@/lib/typo";
import { smoothScrollTo } from "@/lib/lenis";

// We import the Font Awesome CSS ourselves, so disable its runtime auto-injection
// (prevents the icons flashing oversized before the stylesheet loads).
config.autoAddCss = false;

// Social channels — logos only. Facebook stays a placeholder until the page exists.
const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/aqluma/posts/?feedView=all",
    icon: faLinkedinIn,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/aqluma.education/",
    icon: faInstagram,
  },
  { label: "Facebook", href: "#", icon: faFacebookF },
  // PLACEHOLDER number — keep in sync with WhatsAppFab.tsx.
  { label: "WhatsApp", href: "https://wa.me/212600000000", icon: faWhatsapp },
];

// Sitemap — anchors map to the live section ids threaded through the scroll journey.
const SITEMAP = [
  { label: "Accueil", href: "#top" },
  { label: "Les Mondes", href: "#mondes" },
  { label: "Le Programme", href: "#programme" },
  { label: "Avis", href: "#avis" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

// Legal — placeholder destinations until the pages exist.
const LEGAL = [
  { label: "Politique de confidentialité", href: "#" },
  { label: "Conditions d'utilisation", href: "#" },
  { label: "Cookies", href: "#" },
];

// TODO: real AQLUMA contact details before launch.
const EMAIL = "hello@aqluma.com";
const PHONE_DISPLAY = "+212 6 00 00 00 00"; // PLACEHOLDER
const PHONE_TEL = "+212600000000"; // PLACEHOLDER

/**
 * CONTACT — the closing footer. A full editorial footer in AQLUMA's dark register
 * (void / cream / gold): a brand block with the manifesto line + socials, the
 * sitemap, the legal column, and a contact/status column. An oversized AQLUMA
 * wordmark watermark sits faintly behind it; a slim bottom bar carries the
 * copyright and the language / cities row. The call to action itself lives at the
 * end of MindReveal, so this stays a quiet landing rather than a second pitch.
 */
export default function ContactClose() {
  return (
    <footer
      id="contact"
      data-loupe
      className="relative w-full overflow-hidden border-t border-cream/10"
      aria-label="AQLUMA, contact"
    >
      {/* Oversized wordmark watermark — clipped by the footer's overflow-hidden. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-0.08em] select-none whitespace-nowrap text-center font-didot text-[12vw] font-normal leading-none tracking-[-0.03em] text-cream/[0.03]"
      >
        AQLUMA
      </span>

      <div className="shell relative py-20 md:py-24">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] lg:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-didot text-[1.7rem] font-normal leading-none tracking-[0.04em] text-cream">
              AQLUMA
            </p>
            <p className="mt-5 max-w-[34ch] text-pretty font-satoshi text-[0.95rem] leading-relaxed text-cream/55">
              {fr(
                "Refuser de se fondre dans la machine. Nous formons des esprits qui pensent avec l'IA, sans jamais lui céder leur voix.",
              )}
            </p>
            <div className="mt-7 flex items-center gap-3 text-[1.05rem]">
              {SOCIALS.map((s) => {
                const placeholder = s.href === "#";
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    {...(placeholder ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 leading-none text-cream/55 transition-all duration-200 ease-editorial hover:-translate-y-0.5 hover:border-cream/40 hover:bg-cream/[0.04] hover:text-cream"
                  >
                    <FontAwesomeIcon icon={s.icon} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Plan du site */}
          <FooterCol title="Plan du site">
            {SITEMAP.map((l) => (
              <FooterLink key={l.label} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterCol>

          {/* Légal */}
          <FooterCol title="Légal">
            {LEGAL.map((l) => (
              <FooterLink key={l.label} href={l.href}>
                {fr(l.label)}
              </FooterLink>
            ))}
          </FooterCol>

          {/* Contact & statut */}
          <FooterCol title="Contact & statut">
            <span className="inline-flex w-fit items-center gap-2.5 rounded-full border border-cream/15 bg-cream/[0.04] px-3.5 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-satoshi text-[0.85rem] font-medium text-cream/80">
                {fr("Accepte les inscriptions")}
              </span>
            </span>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2.5 font-satoshi text-[0.95rem] text-cream/60 transition-colors duration-200 hover:text-cream"
            >
              <EnvelopeIcon />
              {EMAIL}
            </a>
            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex items-center gap-2.5 font-satoshi text-[0.95rem] text-cream/60 transition-colors duration-200 hover:text-cream"
            >
              <PhoneIcon />
              {PHONE_DISPLAY}
            </a>
          </FooterCol>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-4 border-t border-cream/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-satoshi text-[0.78rem] tracking-[0.02em] text-cream/35">
            © 2026 AQLUMA. {fr("Tous droits réservés.")}
          </p>
          <p className="font-satoshi text-[0.78rem] tracking-[0.02em] text-cream/35">
            Maroc
          </p>
        </div>
      </div>
    </footer>
  );
}

/** One footer column — an uppercase kicker heading over a stack of links. */
function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3.5">
      <p className="font-satoshi text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-cream/40">
        {title}
      </p>
      {children}
    </div>
  );
}

/** A single footer link — muted cream that warms to full cream on hover. */
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  // Internal anchors (#avis, …) scroll smoothly and clear the fixed header;
  // "#" placeholders and external links keep default behaviour.
  const internal = href.length > 1 && href.startsWith("#");
  const onClick = internal
    ? (e: React.MouseEvent) => {
        e.preventDefault();
        if (href === "#top") smoothScrollTo(0);
        else smoothScrollTo(href, { offset: -80 });
      }
    : undefined;
  return (
    <a
      href={href}
      onClick={onClick}
      className="group/fl relative w-fit font-satoshi text-[0.95rem] text-cream/55 transition-colors duration-300 ease-editorial hover:text-cream"
    >
      {children}
      <span
        aria-hidden
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gold/60 transition-transform duration-300 ease-editorial group-hover/fl:scale-x-100"
      />
    </a>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 flex-shrink-0 text-cream/40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 flex-shrink-0 text-cream/40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}
