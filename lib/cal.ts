/**
 * cal.com booking link — the slug after `cal.com/`.
 *
 * TODO(aqluma): set this to your real event link, e.g. "aqluma/decouverte" or
 * "aqluma/30min". It's the path you see in the browser on your cal.com booking
 * page. Used by the header CTA to open the popup embed (see components/CalInit).
 */
export const CAL_LINK = "aqluma";

/** Per-CTA config passed via `data-cal-config` (kept on-brand: dark + month view). */
export const CAL_CONFIG = JSON.stringify({ layout: "month_view", theme: "dark" });
