"use client";

import { useEffect } from "react";

/**
 * cal.com popup-embed bootstrap. Loads the embed script once and themes the
 * booking modal to AQLUMA (dark + gold). Any element carrying `data-cal-link`
 * opens the booking popup on click (see the header CTA). Mounted globally in
 * the root layout. The link itself lives in lib/cal.ts (CAL_LINK).
 */
/* eslint-disable @typescript-eslint/no-explicit-any, prefer-rest-params */
declare global {
  interface Window {
    Cal?: any;
  }
}

export default function CalInit() {
  useEffect(() => {
    // Official cal.com embed loader (vanilla): defines window.Cal as a queue and
    // lazy-loads embed.js, which then binds every [data-cal-link] element.
    (function (C: any, A: string, L: string) {
      const p = function (a: any, ar: any) {
        a.q.push(ar);
      };
      const d = C.document;
      C.Cal =
        C.Cal ||
        function () {
          const cal = C.Cal;
          const ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api: any = function () {
              p(api, arguments);
            };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    window.Cal("init", { origin: "https://cal.com" });
    window.Cal("ui", {
      theme: "dark",
      cssVarsPerTheme: { dark: { "cal-brand": "#E8B23A" } },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
  }, []);

  return null;
}
