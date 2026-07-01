"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Reveal from "@/components/Reveal";
import Kicker from "@/components/Kicker";
import { fr } from "@/lib/typo";

/**
 * FAMILY CARDS — one pinned section, a scatter → stack morph in three states.
 *
 *   A · « Ce que vous entendez à la maison »   — six cards as a 3D scattered
 *       spread (rotation + depth), the parents' questions overheard.
 *   B · « Ce que chaque adolescent pratique »  — the cards reorganise into a
 *       clean left-aligned vertical stack and repopulate with the six gestes.
 *   C · « Ce que les parents reçoivent »        — three cards peel away (left /
 *       right) and the three that remain become the parents' deliverables.
 *
 * Cards are opaque, so while they reorganise they occlude rather than blend —
 * the morph reads as a physical deck, not a blur. Driven imperatively off a
 * single scrubbed proxy. Reduced motion / narrow: static list, never unmounted.
 */

const HOME = [
  "Tu peux me l'expliquer avec tes mots ?",
  "Qu'est-ce que tu as vérifié ?",
  "Quelle partie vient de toi ?",
  "Tu peux me l'expliquer avec tes mots ?",
  "Qu'est-ce que tu as vérifié ?",
  "Quelle partie vient de toi ?",
];

const PRACTICE = [
  "Lire une réponse générée avec un œil critique.",
  "Reformuler dans ses propres mots.",
  "Produire un travail dont il peut rendre compte.",
  "Présenter sans s'appuyer sur la machine.",
  "Identifier ce qu'il a appris, pas seulement obtenu.",
  "Distinguer ce qu'il partage de ce qui reste sien.",
];

const PARENTS = [
  "Le carnet de bord hebdomadaire.",
  "Les questions à poser pour stimuler le jugement.",
  "Un accès direct à l'équipe pédagogique.",
];

const KEEP = [0, 1, 2]; // cards that survive into state C

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

type Pose = { x: number; y: number; r: number; s: number; o: number };
const lerpPose = (a: Pose, b: Pose, u: number): Pose => ({
  x: a.x + (b.x - a.x) * u,
  y: a.y + (b.y - a.y) * u,
  r: a.r + (b.r - a.r) * u,
  s: a.s + (b.s - a.s) * u,
  o: a.o + (b.o - a.o) * u,
});

// Scatter offsets as fractions of the stage (back cards smaller + dimmer).
// Creamy paper cards: depth comes from scale + offset, NOT low opacity (cream at
// low alpha over the dark canvas muddies to grey). Keep every card near-opaque.
const SCATTER: Pose[] = [
  { x: -0.16, y: -0.30, r: -9, s: 1.0, o: 1 },
  { x: 0.18, y: -0.20, r: 8, s: 0.96, o: 0.96 },
  { x: -0.04, y: 0.02, r: -3, s: 1.05, o: 1 },
  { x: -0.22, y: 0.22, r: 11, s: 0.82, o: 0.9 },
  { x: 0.2, y: 0.26, r: -12, s: 0.8, o: 0.88 },
  { x: 0.06, y: 0.44, r: 5, s: 0.9, o: 0.92 },
];

export default function FamilyCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const layerRefs = useRef<(HTMLSpanElement | null)[][]>([]);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    const stage = stageRef.current;
    if (!section || !stage) return;
    if (reduced || !window.matchMedia("(min-width: 1024px)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const apply = (p: number) => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const cardW = Math.min(W * 0.82, 470);
      const cx = W * 0.5 - cardW / 2;
      const colX = cx; // cards centred in their column — balanced, no lopsided rail
      const stackRowH = (H * 0.96) / 6;
      const finalRowH = (H * 0.66) / 3;

      const uAB = smoothstep(0.26, 0.42, p); // scatter → stack
      const uBC = smoothstep(0.6, 0.76, p); // stack → final

      for (let i = 0; i < 6; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const ch = card.offsetHeight;

        const A: Pose = {
          x: cx + SCATTER[i].x * W,
          y: H * 0.5 - ch / 2 + SCATTER[i].y * H,
          r: SCATTER[i].r,
          s: SCATTER[i].s,
          o: SCATTER[i].o,
        };
        const B: Pose = { x: colX, y: H * 0.02 + i * stackRowH, r: 0, s: 1, o: 1 };
        const keepIdx = KEEP.indexOf(i);
        const C: Pose =
          keepIdx >= 0
            ? { x: colX, y: H * 0.13 + keepIdx * finalRowH, r: 0, s: 1.05, o: 1 }
            : { x: colX + (i % 2 === 0 ? -1 : 1) * W * 1.1, y: H * 0.04 + i * stackRowH, r: (i % 2 === 0 ? -1 : 1) * 16, s: 0.8, o: 0 };

        const pose = lerpPose(lerpPose(A, B, uAB), C, uBC);
        card.style.transform = `translate(${pose.x}px, ${pose.y}px) rotate(${pose.r}deg) scale(${pose.s})`;
        card.style.opacity = String(pose.o);
        card.style.zIndex = String(10 + i);

        const aO = 1 - smoothstep(0.26, 0.4, p);
        const bO = smoothstep(0.28, 0.42, p) * (1 - smoothstep(0.6, 0.72, p));
        const cO = smoothstep(0.62, 0.74, p);
        const layers = layerRefs.current[i] || [];
        if (layers[0]) layers[0].style.opacity = String(aO);
        if (layers[1]) layers[1].style.opacity = String(bO);
        if (layers[2]) layers[2].style.opacity = String(cO);
      }

      const tA = 1 - smoothstep(0.24, 0.36, p);
      const tB = smoothstep(0.28, 0.4, p) * (1 - smoothstep(0.6, 0.7, p));
      const tC = smoothstep(0.64, 0.74, p);
      const ty = (o: number) => `translateY(${(1 - o) * 14}px)`;
      if (titleRefs.current[0]) { titleRefs.current[0].style.opacity = String(tA); titleRefs.current[0].style.transform = ty(tA); }
      if (titleRefs.current[1]) { titleRefs.current[1].style.opacity = String(tB); titleRefs.current[1].style.transform = ty(tB); }
      if (titleRefs.current[2]) { titleRefs.current[2].style.opacity = String(tC); titleRefs.current[2].style.transform = ty(tC); }
    };

    const ctx = gsap.context(() => {
      apply(0);
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=440%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      }).to({ p: 0 }, { p: 1, ease: "none", duration: 1, onUpdate() { apply(this.targets()[0].p); } });
    }, section);

    return () => ctx.revert();
  }, [reduced, narrow]);

  return (
    <section
      ref={sectionRef}
      data-loupe
      className="relative w-full overflow-hidden border-t border-cream/[0.06] bg-void"
      aria-label="Ce que vit votre adolescent"
    >
      {/* ── Pinned scatter → stack morph ── */}
      <div
        aria-hidden={still}
        className="h-screen w-full"
        style={{ display: still ? "none" : "block" }}
      >
        <div className="mx-auto grid h-full w-full max-w-[1280px] grid-cols-[0.9fr_1fr] items-center gap-10 px-6 md:px-10">
          {/* Left — the three cross-fading titles, stacked in place. */}
          <div className="relative">
            {[
              { k: "FAMILLE", h: "Ce que vous entendez à la maison", sub: "" },
              { k: "PRATIQUE", h: "Ce que chaque adolescent pratique", sub: "À chaque session, il ne subit pas l'IA — il la travaille." },
              { k: "PARENTS", h: "Ce que les parents reçoivent", sub: "" },
            ].map((t, ti) => (
              <div
                key={t.k}
                ref={(el) => { titleRefs.current[ti] = el; }}
                className={ti === 0 ? "relative" : "absolute inset-0"}
                style={{ opacity: ti === 0 ? 1 : 0 }}
              >
                <div className="mb-5">
                  <Kicker>{t.k}</Kicker>
                </div>
                <h2 className="section-title text-cream">
                  {fr(t.h)}
                </h2>
                {t.sub ? (
                  <p className="mt-6 max-w-[34ch] font-satoshi text-[clamp(1rem,1.2vw,1.15rem)] leading-relaxed text-cream/55">{fr(t.sub)}</p>
                ) : null}
              </div>
            ))}
          </div>

          {/* Right — the card stage. */}
          <div ref={stageRef} className="relative h-[74vh]" style={{ perspective: 1300 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="absolute left-0 top-0 flex w-[min(82%,470px)] min-h-[96px] items-center rounded-2xl border border-black/[0.06] bg-paper px-9 py-7 shadow-[0_40px_80px_-32px_rgba(0,0,0,0.85)] will-change-transform"
                style={{ minWidth: 260 }}
              >
                {[HOME[i], PRACTICE[i], KEEP.includes(i) ? PARENTS[KEEP.indexOf(i)] : ""].map((txt, li) => (
                  <span
                    key={li}
                    ref={(el) => { (layerRefs.current[i] ||= [])[li] = el; }}
                    className={[
                      // Uniform type across all three morph states — one family
                      // + one size, so a card's text never changes font as it
                      // reorganises (only the colour weight distinguishes them).
                      "absolute inset-0 flex items-center px-9 font-didot text-[clamp(1.15rem,1.5vw,1.45rem)] leading-snug",
                      li === 0 ? "text-void" : "text-void/75",
                    ].join(" ")}
                    style={{ opacity: li === 0 ? 1 : 0 }}
                  >
                    {fr(txt)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Static rendering (reduced motion / narrow) ── */}
      <div className="shell flex-col gap-16 py-24 md:py-32" style={{ display: still ? "flex" : "none" }}>
        <StaticGroup kicker="FAMILLE" title="Ce que vous entendez à la maison" items={HOME.slice(0, 3)} didot />
        <StaticGroup kicker="PRATIQUE" title="Ce que chaque adolescent pratique" sub="À chaque session, il ne subit pas l'IA — il la travaille." items={PRACTICE} />
        <StaticGroup kicker="PARENTS" title="Ce que les parents reçoivent" items={PARENTS} />
      </div>
    </section>
  );
}

function StaticGroup({ kicker, title, sub, items, didot }: { kicker: string; title: string; sub?: string; items: string[]; didot?: boolean }) {
  return (
    <Reveal>
      <div className="mb-7">
        <Kicker>{kicker}</Kicker>
      </div>
      <h2 className="section-title text-cream">{fr(title)}</h2>
      {sub ? <p className="mt-5 max-w-[44ch] font-satoshi text-[1.05rem] leading-relaxed text-cream/55">{fr(sub)}</p> : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((t) => (
          <div key={t} className="rounded-2xl border border-black/[0.06] bg-paper px-8 py-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.7)]">
            <p className={didot ? "font-didot text-[1.3rem] text-void" : "font-satoshi text-[1.05rem] text-void/75"}>{fr(t)}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
