/**
 * Single source of truth for the AQLUMA conversion CTA.
 *
 * The landing page funnels to ONE action: the parent writes the keyword "ADO"
 * to AQLUMA on WhatsApp, and receives the programme + next steps by reply.
 * Button label is always "Recevoir le programme"; the support microcopy says
 * how (per the architecture doc's WhatsApp channel rule: "sur WhatsApp", not
 * "en message privé").
 *
 * TODO: replace WHATSAPP_NUMBER with AQLUMA's real WhatsApp line before launch.
 */
export const WHATSAPP_NUMBER = "212600000000"; // PLACEHOLDER — international, no "+"
export const CTA_KEYWORD = "ADO";

/** WhatsApp deep link, prefilled with the keyword the copy asks parents to send. */
export function waLink(text: string = CTA_KEYWORD): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Canonical button label, used at every CTA moment. */
export const CTA_LABEL = "Recevoir le programme";

/** Support microcopy variants (raw — pass through fr() at render). */
export const CTA_SUPPORT =
  "Écrivez ADO sur WhatsApp. On vous envoie le programme et les prochaines étapes, simplement.";
export const CTA_SUPPORT_COHORT =
  "Écrivez ADO sur WhatsApp. On vous envoie le programme et les prochaines étapes. Sans engagement.";
export const CTA_SUPPORT_FINAL =
  "Écrivez ADO sur WhatsApp. On vous envoie les prochaines étapes.";
