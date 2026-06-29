"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

/**
 * LA MÉTHODE — six gestes (id="methode").
 *
 * A pinned, scrubbed section. The six gestes sit as a column of hairline rows;
 * each starts faint + blurred and resolves to full focus one at a time as the
 * page scrolls, the earlier ones holding once revealed. A gold rail runs down the
 * left of the column with a glowing marker that travels alongside the geste being
 * revealed — an elegant progress thread, not a flashy reveal.
 *
 * Reduced motion / narrow: both subtrees stay mounted; the static one shows every
 * geste sharp (no pin), and the pinned node is never unmounted (pin × removeChild).
 */

type Geste = { n: string; title: string; body: string };

const GESTES: Geste[] = [
  { n: "01", title: "Vérifier", body: "Débusquer les erreurs et approximations contenues dans les réponses générées." },
  { n: "02", title: "Reformuler", body: "Traduire la pensée technique en mots personnels, vivants, et traçables." },
  { n: "03", title: "Expliquer", body: "Savoir justifier chaque étape du raisonnement, à voix haute, sans notes." },
  { n: "04", title: "Créer", body: "Utiliser l'outil pour amplifier une intention originale, pas pour la remplacer." },
  { n: "05", title: "Présenter", body: "Soutenir son travail avec assurance devant un jury, un parent, un professeur." },
  { n: "06", title: "Protéger", body: "Comprendre ce qu'on partage, ce qu'on garde, et ce qui reste sien." },
];

function Header() {
  return (
    <header>
      <div className="mb-6 flex items-center gap-3.5">
        <span className="font-satoshi text-[0.95rem] font-bold text-gold">La Méthode</span>
        <span
          aria-hidden
          className="h-px w-12 flex-shrink-0"
          style={{ background: "linear-gradient(90deg, rgba(232,178,58,0.7), rgba(232,178,58,0))" }}
        />
      </div>
      <h2 className="font-didot text-[clamp(2.2rem,4.4vw,3.8rem)] font-normal leading-[1.06] tracking-[-0.02em] text-cream">
        La Méthode AQLUMA
      </h2>
      <p className="mt-6 max-w-[34ch] font-satoshi text-[clamp(1rem,1.3vw,1.2rem)] leading-relaxed text-cream/55">
        {fr("Six gestes pour transformer l'IA en partenaire de réflexion.")}
      </p>
    </header>
  );
}

function GesteRow({ g }: { g: Geste }) {
  return (
    <div className="flex items-baseline gap-5 md:gap-7">
      <span className="font-satoshi text-[12px] font-medium tabular-nums tracking-tight text-gold/70">
        {g.n}
      </span>
      <div className="flex-1">
        <h3 className="font-satoshi text-[clamp(1.15rem,1.9vw,1.55rem)] font-medium leading-snug tracking-tight text-cream">
          {g.title}
        </h3>
        <p className="mt-1.5 max-w-[46ch] font-satoshi text-[clamp(0.95rem,1.15vw,1.08rem)] leading-relaxed text-cream/60">
          {fr(g.body)}
        </p>
      </div>
    </div>
  );
}

export default function LaMethode() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const railFillRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const [narrow, setNarrow] = useState(false);
  const still = reduced || narrow;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (reduced || !window.matchMedia("(min-width: 1024px)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const N = GESTES.length;

    const apply = (p: number) => {
      // active position runs 0 → N across the scrub; each row reveals as the
      // sweep passes it and holds once revealed.
      const active = p * N;
      for (let i = 0; i < N; i++) {
        const el = cardsRef.current[i];
        if (!el) continue;
        const r = Math.min(1, Math.max(0, active - i));
        el.style.filter = `blur(${(1 - r) * 7}px)`;
        el.style.opacity = String(0.28 + 0.72 * r);
        el.style.transform = `translateY(${(1 - r) * 18}px)`;
      }
      const rail = railRef.current;
      if (rail) {
        const h = rail.clientHeight;
        const y = Math.min(1, Math.max(0, p)) * h;
        if (railFillRef.current) railFillRef.current.style.height = `${y}px`;
        if (markerRef.current) markerRef.current.style.transform = `translateY(${y}px)`;
      }
    };

    const ctx = gsap.context(() => {
      const proxy = { p: 0 };
      apply(0);
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      }).to(proxy, { p: 1, ease: "none", duration: 1, onUpdate: () => apply(proxy.p) });
    }, section);

    return () => ctx.revert();
  }, [reduced, narrow]);

  return (
    <section
      ref={sectionRef}
      id="methode"
      data-loupe
      className="relative w-full overflow-hidden border-t border-cream/[0.06] bg-void"
      aria-label="La Méthode AQLUMA"
    >
      {/* ── Pinned scrubbed rendering ── */}
      <div
        aria-hidden={still}
        className="h-screen w-full"
        style={{ display: still ? "none" : "block" }}
      >
        <div className="shell grid h-full grid-cols-[0.62fr_1.38fr] items-center gap-20">
          <Header />

          <div className="flex items-stretch gap-8">
            {/* Progress rail + traveling marker. */}
            <div ref={railRef} className="relative w-px flex-shrink-0 self-stretch bg-cream/12">
              <div
                ref={railFillRef}
                className="absolute left-0 top-0 w-px"
                style={{ height: 0, background: "linear-gradient(180deg, rgba(232,178,58,0.9), rgba(232,178,58,0.4))" }}
              />
              <div
                ref={markerRef}
                aria-hidden
                className="absolute -left-[5px] top-0 h-[11px] w-[11px] -translate-y-1/2 rounded-full will-change-transform"
                style={{
                  background: "radial-gradient(circle, #FFF4D6 0%, #F0C25A 45%, rgba(232,178,58,0) 76%)",
                  boxShadow: "0 0 18px 5px rgba(232,178,58,0.5)",
                }}
              />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-7 py-1">
              {GESTES.map((g, i) => (
                <div
                  key={g.n}
                  ref={(el) => {
                    cardsRef.current[i] = el;
                  }}
                  className="will-change-[transform,opacity,filter]"
                >
                  <GesteRow g={g} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Static rendering (reduced motion / narrow) ── */}
      <div
        className="shell flex-col gap-14 py-24 md:py-32"
        style={{ display: still ? "flex" : "none" }}
      >
        <Header />
        <div className="grid gap-10 sm:grid-cols-2">
          {GESTES.map((g) => (
            <GesteRow key={g.n} g={g} />
          ))}
        </div>
      </div>
    </section>
  );
}
