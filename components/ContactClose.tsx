"use client";

import { CAL_LINK, CAL_CONFIG } from "@/lib/cal";
import { fr } from "@/lib/typo";

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
      className="relative flex w-full flex-col items-center justify-center bg-void px-6 py-32 text-center md:py-44"
      aria-label="AQLUMA — contact"
    >
      <p className="font-satoshi text-[0.8rem] font-bold uppercase tracking-kicker text-gold">
        Prêt à commencer ?
      </p>
      <h2 className="mt-5 max-w-[20ch] font-didot text-[clamp(2.4rem,6vw,5rem)] font-normal leading-[1.02] tracking-[-0.02em] text-cream">
        {fr("Rejoignez le programme AQLUMA.")}
      </h2>
      <p className="mx-auto mt-6 max-w-[46ch] font-satoshi text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-cream/65">
        {fr(
          "Réservez un appel gratuit ou demandez le programme — nous vous répondons sous 24 heures.",
        )}
      </p>

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
    </section>
  );
}
