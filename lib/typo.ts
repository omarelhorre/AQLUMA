/**
 * French micro-typography — "espaces fines insécables".
 *
 * French sets a NARROW no-break space (U+202F) before high punctuation
 * (; : ! ?) and on the inner side of guillemets « … », and a normal no-break
 * space (U+00A0) before a percent sign. Browsers never insert these on their
 * own, so we do it at render time. The spaces are non-breaking, so a line never
 * wraps with a dangling «, », ?, : etc.
 *
 * Apply ONLY to human-readable French copy — never to class names, attributes,
 * URLs, or code (it would happily mangle a ternary or a `width:100%`).
 *
 *   {fr('Pourquoi "lire" sans croire ?')}
 *   → Pourquoi «·lire·» sans croire·?    (· = U+202F: invisible, non-breaking)
 */
const NNBSP = " "; // espace fine insécable (narrow no-break space)
const NBSP = " "; // espace insécable (no-break space)

export function fr(input: string): string {
  return (
    input
      // straight "double quotes" → guillemets with thin inner spaces
      .replace(
        /"([^"]*)"/g,
        (_, inner: string) => `«${NNBSP}${inner.trim()}${NNBSP}»`,
      )
      // thin space on the inside of any guillemets already in the copy
      .replace(/«\s*/g, `«${NNBSP}`)
      .replace(/\s*»/g, `${NNBSP}»`)
      // straight apostrophe → typographic apostrophe (élision: l'IA → l’IA)
      .replace(/'/g, "’")
      // thin space before ; : ! ? (swap a normal space, or insert when missing)
      .replace(/ ?([;:!?])/g, `${NNBSP}$1`)
      // normal no-break space before a percent sign
      .replace(/ ?%/g, `${NBSP}%`)
      // collapse any doubled thin spaces we may have introduced
      .replace(new RegExp(`${NNBSP}{2,}`, "g"), NNBSP)
  );
}
