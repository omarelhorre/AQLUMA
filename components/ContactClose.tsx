"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

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
 * CONTACT — slim closing footer. The call to action now lives at the end of the
 * MindReveal section; here we keep only the ways to reach AQLUMA: the email, the
 * social channels and the copyright line.
 */
export default function ContactClose() {
  return (
    <section
      id="contact"
      data-loupe
      className="relative flex w-full flex-col items-center justify-center overflow-hidden px-6 py-24 text-center md:py-28"
      aria-label="AQLUMA, contact"
    >
      <a
        href="mailto:hello@aqluma.com"
        className="relative font-satoshi text-[1.05rem] text-cream/70 underline-offset-4 transition-colors duration-200 hover:text-cream hover:underline"
      >
        hello@aqluma.com
      </a>

      {/* Social — logos only, no labels. Each link is a 44px tap target. */}
      <div className="mt-8 flex items-center gap-3 text-[1.2rem]">
        {SOCIALS.map((s) => {
          const placeholder = s.href === "#";
          return (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              {...(placeholder ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              className="inline-flex h-11 w-11 items-center justify-center leading-none text-cream/40 transition-colors duration-200 hover:text-cream"
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
