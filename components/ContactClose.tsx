"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { CAL_LINK, CAL_CONFIG } from "@/lib/cal";
import { fr } from "@/lib/typo";
import Parallax from "@/components/Parallax";

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
];

/**
 * CONTACT — the simple closing section that ends the journey. A centred call to
 * action: book a free call (cal.com popup) or request the programme (opens the
 * ProgramModal via the shared `aqluma:program` event). Deliberately minimal —
 * to be polished later.
 */
export default function ContactClose() {
  return (
    <section
      id="contact"
      data-loupe
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-void px-6 py-32 text-center md:py-44"
      aria-label="AQLUMA, contact"
    >
      {/* Closing glow — drifts up slowly behind the call to action. */}
      <Parallax
        aria-hidden
        speed={0.08}
        className="pointer-events-none absolute inset-x-0 -inset-y-[25%] -z-10"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(45% 45% at 50% 60%, rgba(232,178,58,0.1), rgba(8,10,12,0) 70%)",
          }}
        />
      </Parallax>

      <Parallax speed={0.1} className="relative flex flex-col items-center">
        <p className="font-satoshi text-[0.8rem] font-bold uppercase tracking-kicker text-gold">
          Prêt à commencer ?
        </p>
        <h2 className="mt-5 max-w-[20ch] font-didot text-[clamp(2.4rem,6vw,5rem)] font-normal leading-[1.02] tracking-[-0.02em] text-cream">
          {fr("Rejoignez le programme AQLUMA.")}
        </h2>
        <p className="mx-auto mt-6 max-w-[46ch] font-satoshi text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-cream/65">
          {fr(
            "Réservez un appel gratuit ou demandez le programme. Nous vous répondons sous 24 heures.",
          )}
        </p>
      </Parallax>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          data-cal-link={CAL_LINK}
          data-cal-config={CAL_CONFIG}
          className="rounded-full bg-gold px-8 py-4 font-satoshi text-[13px] font-semibold uppercase tracking-[0.14em] text-void transition-all duration-300 ease-editorial hover:-translate-y-[1px] hover:bg-[#f3c45e]"
        >
          Réserver un appel gratuit
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("aqluma:program"))}
          className="rounded-full bg-cream px-8 py-4 font-satoshi text-[13px] font-semibold uppercase tracking-[0.14em] text-void transition-all duration-300 ease-editorial hover:-translate-y-[1px] hover:bg-white"
        >
          Demander le programme
        </button>
      </div>

      <a
        href="mailto:hello@aqluma.com"
        className="mt-10 font-satoshi text-[0.9rem] text-cream/45 underline-offset-4 transition-colors duration-200 hover:text-cream/80 hover:underline"
      >
        hello@aqluma.com
      </a>

      {/* Social — logos only, no labels. */}
      <div className="mt-14 flex items-center gap-8 text-[1.2rem]">
        {SOCIALS.map((s) => {
          const placeholder = s.href === "#";
          return (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              {...(placeholder ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              className="leading-none text-cream/40 transition-colors duration-200 hover:text-cream"
            >
              <FontAwesomeIcon icon={s.icon} />
            </a>
          );
        })}
      </div>

      <p className="mt-9 font-satoshi text-[0.78rem] tracking-[0.04em] text-cream/30">
        © 2026 AQLUMA
      </p>
    </section>
  );
}
