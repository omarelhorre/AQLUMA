"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { fr } from "@/lib/typo";

/**
 * LE PROGRAMME — distils the macro programme (assets/aqluma_macro_programme.txt)
 * into its three acts (Briefing → Musée → Studio), then the certification axes
 * and the closing exposition.
 *
 * Centre-piece: a SCROLL-DRIVEN Instagram-Reels phone. The section pins; as you
 * scroll, the phone flicks vertically from one reel to the next (Briefing →
 * Musée → Studio), each clip with its own engagement counts. In lock-step, the
 * text column on the LEFT cross-fades between the three acts, and each act's
 * Didot headline writes itself in with the per-character fill sweep reused from
 * the Briefing/Studio heroes.
 *
 * Reduced motion: the three acts render as a static stack, each with its own
 * autoplay reel — no pin, no scrub, no fill choreography.
 */

type Reel = {
  src: string;
  poster: string;
  caption: string;
  likes: string;
  comments: string;
  shares: string;
  views: string;
};

type Act = {
  month: string;
  act: string;
  title: string;
  question: string;
  /** word that lands in gold during the fill sweep */
  accent: RegExp;
  objective: string;
  skills: string[];
  experiences: string[];
  livrables: string[];
  reel: Reel;
};

const ACTS: Act[] = [
  {
    month: "Mois 1",
    act: "Acte I · Le Briefing",
    title: "Découvrir",
    question: "« Bienvenue dans l'ère de l'IA »",
    accent: /l'IA/i,
    objective:
      "Comprendre ce qu'est réellement l'IA, ses mécanismes, ses usages et les défis de société qu'elle soulève.",
    skills: [
      "Culture générale approfondie sur l'IA",
      "Compréhension fine des cas d'usage",
      "Réflexion prospective autonome",
    ],
    experiences: [
      "Les Grandes Questions : débats animés",
      "Cartographie du Futur : métiers en mutation",
      "Premiers Dialogues avec les outils leaders",
    ],
    livrables: ["Passeport Explorateur IA"],
    reel: {
      src: "/video/programme-briefing.mp4",
      poster: "/video/programme-briefing-poster.jpg",
      caption:
        "Acte I · le Briefing : la première porte d'entrée dans le monde de l'IA.",
      likes: "10,3 k",
      comments: "284",
      shares: "1 942",
      views: "86,7 k",
    },
  },
  {
    month: "Mois 2",
    act: "Acte II · Le Musée des Erreurs",
    title: "Questionner",
    question: "« Peut-on toujours faire confiance à l'IA ? »",
    accent: /confiance/i,
    objective:
      "Développer un regard critique, analytique et responsable sur tout ce que produisent les intelligences artificielles.",
    skills: [
      "Vérification et recoupement des informations",
      "Détection et isolation des biais",
      "Pratiques numériques responsables",
    ],
    experiences: [
      "La Source Qui N'Existe Pas : traquer les hallucinations",
      "Le Tribunal des Réponses IA",
      "L'Enveloppe Privée : protéger ses données",
    ],
    livrables: ["Badge Détective IA", "Carnet d'Enquête AQLUMA"],
    reel: {
      src: "/video/programme-musee.mp4",
      poster: "/video/programme-musee-poster.jpg",
      caption:
        "Acte II · le Musée des Erreurs : apprendre à douter, vérifier et déjouer les biais.",
      likes: "14,8 k",
      comments: "512",
      shares: "3 207",
      views: "121 k",
    },
  },
  {
    month: "Mois 3",
    act: "Acte III · Le Studio des Créateurs",
    title: "Créer",
    question: "« Et maintenant, que peux-tu créer avec l'IA ? »",
    accent: /créer/i,
    objective:
      "Se positionner en concepteur et déployer l'IA comme un copilote au service de la création et de l'innovation.",
    skills: [
      "Advanced Prompt Design & ingénierie",
      "Créativité augmentée et itérative",
      "Pitch et techniques de communication",
    ],
    experiences: [
      "Le Prompt Atelier : requêtes complexes avancées",
      "Le Prototype Express : une idée en un temps record",
      "Le Pitch AQLUMA : soutenance persuasive",
    ],
    livrables: ["Portfolio IA Créatif", "Projet Final AQLUMA"],
    reel: {
      src: "/video/programme-studio.mp4",
      poster: "/video/programme-studio-poster.jpg",
      caption:
        "Acte III · le Studio des Créateurs : passer de spectateur à créateur augmenté.",
      likes: "21,6 k",
      comments: "738",
      shares: "4 815",
      views: "168 k",
    },
  },
];

// ── per-character fill (same recipe as the Briefing/Studio heroes) ───────────
const FILL = "#F7F4EF"; // cream
const FILL_ACCENT = "#E8B23A"; // gold
const GHOST = "rgba(247,244,239,0.2)"; // faint impression on the void

function fillGradient(fill: string, f: number): string {
  // Crisp at the ends: fully filled glyphs land as solid colour (no trailing
  // ghost), empty glyphs read as a faint impression. A 4% soft band straddles
  // the moving edge in between so a glyph can be caught mid-fill.
  if (f >= 1) return `linear-gradient(90deg, ${fill}, ${fill})`;
  if (f <= 0) return `linear-gradient(90deg, ${GHOST}, ${GHOST})`;
  const a = Math.max(0, f * 100 - 2);
  const b = Math.min(100, f * 100 + 2);
  return `linear-gradient(90deg, ${fill} 0%, ${fill} ${a}%, ${GHOST} ${b}%, ${GHOST} 100%)`;
}

// smoothstep — eased 0→1 ramp between two edges.
function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Split a headline into unbreakable words of fillable characters. */
function buildModel(question: string, accent: RegExp) {
  let idx = 0;
  const words = fr(question)
    .split(" ")
    .map((word) => {
      const fill = accent.test(word) ? FILL_ACCENT : FILL;
      const chars = [...word].map((ch) => ({ ch, fill, i: idx++ }));
      return { chars };
    });
  return { words, total: idx };
}

export default function ProgramHighlights() {
  return (
    <section
      id="programme"
      className="relative w-full bg-void"
      aria-label="AQLUMA, le programme"
    >
      <ProgramReels />
    </section>
  );
}

/** Intro headline — the first stage of the pinned programme sequence. */
function IntroHeader() {
  return (
    <header className="max-w-[44ch] text-left">
      <p className="font-satoshi text-[clamp(1rem,1.25vw,1.15rem)] font-bold text-gold">
        {fr("Un programme de trois mois pour apprendre à créer avec l'IA.")}
      </p>
      <h2 className="mt-5 font-didot text-[clamp(2.4rem,5.5vw,4.5rem)] font-normal leading-[1.04] tracking-[-0.02em] text-cream">
        {fr("Comprendre, questionner, créer.")}
      </h2>
      <p className="mt-6 max-w-[52ch] font-satoshi text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-cream/65">
        {fr(
          "De ses premières questions sur l'IA jusqu'à ses propres créations, votre adolescent apprend à penser avec elle, sans jamais lui céder sa voix.",
        )}
      </p>
    </header>
  );
}

/**
 * Closing — the finale of the pinned sequence, distilled from the certificate +
 * exposition into two STANDING editorial blocks (Didot display + Satoshi body).
 * In the pinned run they arrive one after the other: the first is anchored left
 * and slides in from the left, then the second is anchored right and slides in
 * from the right. The static fallback just renders them in place.
 */
function CertClosing({
  leftRef,
  rightRef,
  animated = false,
}: {
  leftRef?: (el: HTMLDivElement | null) => void;
  rightRef?: (el: HTMLDivElement | null) => void;
  animated?: boolean;
}) {
  const hide = animated ? { opacity: 0 } : undefined;
  return (
    <div className="flex w-full flex-col gap-14 md:gap-20">
      {/* La certification — anchored left, reveals first. */}
      <div
        ref={leftRef}
        style={hide}
        className="max-w-[46rem] self-start text-left will-change-[opacity,transform]"
      >
        <p className="font-satoshi text-[0.95rem] font-bold text-gold">
          La certification
        </p>
        <h3 className="mt-5 font-didot text-[clamp(2.3rem,4vw,4rem)] font-normal leading-[1.06] tracking-[-0.02em] text-cream">
          {fr("Un socle de compétences, certifié.")}
        </h3>
        <p className="mt-6 max-w-[48ch] font-satoshi text-[clamp(1.3rem,1.75vw,1.75rem)] leading-relaxed text-cream/70">
          {fr(
            "Le Certificat AQLUMA · IA Créative atteste d'un niveau de haut vol, structuré autour de cinq axes cardinaux : compréhension technique et culturelle de l'IA, esprit critique appliqué, usage responsable et éthique, créativité augmentée, et conception de projets assistés par l'IA.",
          )}
        </p>
      </div>

      {/* L'Exposition — anchored right, reveals second. */}
      <div
        ref={rightRef}
        style={hide}
        className="max-w-[46rem] self-end text-right will-change-[opacity,transform]"
      >
        <p className="font-satoshi text-[0.95rem] font-bold text-gold">
          La cérémonie de clôture
        </p>
        <h3 className="mt-5 font-didot text-[clamp(2.3rem,4vw,4rem)] font-normal leading-[1.06] tracking-[-0.02em] text-cream">
          {fr("L'Exposition AQLUMA.")}
        </h3>
        <p className="ml-auto mt-6 max-w-[48ch] font-satoshi text-[clamp(1.3rem,1.75vw,1.75rem)] leading-relaxed text-cream/70">
          {fr(
            "Un événement public où chaque participant présente son projet final devant familles, enseignants et partenaires. Le fruit d'une vraie synergie entre l'esprit humain et la puissance des algorithmes. Découvrir le monde de l'IA, questionner ses réponses, créer le futur.",
          )}
        </p>
      </div>
    </div>
  );
}

// ── pinned-sequence stage timing (progress 0..1 over the whole pin) ──────────
// The programme block pins ONCE and plays three stages while you hold still:
// intro headline → reels (3 acts) → certificate/closing. Everything arrives to
// the viewer; the viewer never scrolls "to" it.
const REELS_SEQ_START = 0.16; // where the 3-act reel sequence begins
const REELS_SEQ_END = 0.8; // …and ends, before the cert cards take over

/**
 * ProgramReels — the full programme block as a single pinned, scroll-driven
 * sequence. Scroll progress drives, in order:
 *  · the intro headline holding, then lifting away;
 *  · the reels arriving — phone feed flicking reel to reel, text cross-fading,
 *    each act's headline filling character-by-character, the active clip playing;
 *  · the certificate + closing cards rising into place.
 * Reduced motion / narrow screens fall back to a plain stacked layout.
 */
function ProgramReels() {
  const reduced = useReducedMotion();
  // The pinned, stacked layout only fits a wide viewport; narrower screens get
  // the static stack so the tall phone + text never overflow a pinned screen.
  const [isLg, setIsLg] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLg(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const animated = !reduced && isLg;

  const pinRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const reelsRef = useRef<HTMLDivElement>(null);
  const certRef = useRef<HTMLDivElement>(null);
  const leftCertRef = useRef<HTMLDivElement>(null);
  const rightCertRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const textTrackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // char spans grouped by act: charRefs.current[actIndex][charIndex]
  const charRefs = useRef<(HTMLSpanElement | null)[][]>([[], [], []]);

  const models = useMemo(
    () => ACTS.map((a) => buildModel(a.question, a.accent)),
    [],
  );

  useEffect(() => {
    if (!animated) return;
    const pin = pinRef.current;
    if (!pin) return;

    gsap.registerPlugin(ScrollTrigger);
    const N = ACTS.length;

    const videos = videoRefs.current;
    videos.forEach((v) => v && (v.currentTime = 0));

    // Cache each act's unlock cells (Compétences · Expériences · Livrable) + their
    // lock badges, so the scroll loop can drive the unlock sequence cheaply.
    const cellEls = panelRefs.current.map((panel) =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>("[data-cell]")) : [],
    );
    const lockEls = cellEls.map((cells) =>
      cells.map((c) => c.querySelector<HTMLElement>("[data-lock]")),
    );
    const bodyEls = cellEls.map((cells) =>
      cells.map((c) => c.querySelector<HTMLElement>("[data-cellbody]")),
    );
    const shackleEls = lockEls.map((locks) =>
      locks.map((l) => l?.querySelector<SVGPathElement>("[data-shackle]") ?? null),
    );

    // Apply the fill sweep for one act's headline (g: 0..1).
    const applyFill = (act: number, g: number) => {
      const fills = models[act].words.flatMap((w) => w.chars.map((c) => c.fill));
      const els = charRefs.current[act];
      const sweep = g * models[act].total;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        const f = Math.min(1, Math.max(0, sweep - i));
        el.style.backgroundImage = fillGradient(fills[i], f);
      }
    };

    let activeVideo = -1;
    const setActiveVideo = (idx: number) => {
      if (idx === activeVideo) return;
      activeVideo = idx;
      videos.forEach((v, i) => {
        if (!v) return;
        if (i === idx) {
          v.play().catch(() => {});
        } else {
          v.pause();
          v.currentTime = 0;
        }
      });
    };

    const render = (p: number) => {
      // ── STAGE 1 · intro headline — holds, then lifts FULLY away before the
      //    reels arrive (sequential, never overlapping the first act) ──────────
      const introOut = smoothstep(0.03, 0.11, p);
      if (introRef.current) {
        introRef.current.style.opacity = String(1 - introOut);
        introRef.current.style.transform = `translateY(${-introOut * 80}px)`;
        introRef.current.style.pointerEvents = introOut < 0.5 ? "auto" : "none";
      }

      // ── STAGE 2 · reels — arrive only once the intro is gone, run the 3 acts,
      //    then lift away before the closing stage ───────────────────────────
      const reelsIn = smoothstep(0.12, 0.2, p);
      const reelsOut = smoothstep(REELS_SEQ_END, 0.86, p);
      const reelsVis = reelsIn * (1 - reelsOut);
      if (reelsRef.current) {
        reelsRef.current.style.opacity = String(reelsVis);
        reelsRef.current.style.transform = `translateY(${(1 - reelsIn) * 60 - reelsOut * 70}px)`;
        reelsRef.current.style.pointerEvents = reelsVis > 0.5 ? "auto" : "none";
      }
      if (phoneRef.current) {
        // the phone glides up + settles to full scale as the reels arrive
        phoneRef.current.style.transform = `translateY(${(1 - reelsIn) * 36}px) scale(${0.9 + reelsIn * 0.1})`;
      }

      // remap the pin progress onto the act sequence [SEQ_START, SEQ_END] → 0..1
      const rp = Math.min(
        1,
        Math.max(0, (p - REELS_SEQ_START) / (REELS_SEQ_END - REELS_SEQ_START)),
      );
      const phase = rp * N; // 0..N

      // feedIndex holds at integers, then flicks across each boundary.
      let feedIndex = 0;
      for (let b = 1; b < N; b++) feedIndex += smoothstep(b - 0.16, b + 0.04, phase);

      // The text column and the phone slide as ONE vertical reel — same offset —
      // so the acts scroll THROUGH a clipped window instead of cross-fading. No
      // opacity blending, so two acts never overlap.
      if (trackRef.current) {
        gsap.set(trackRef.current, { yPercent: -feedIndex * (100 / N) });
      }
      if (textTrackRef.current) {
        gsap.set(textTrackRef.current, { yPercent: -feedIndex * (100 / N) });
      }

      for (let k = 0; k < N; k++) {
        // Headline fills FAST as its act takes the stage, then holds solid for
        // the rest of the act so it reads crisp (no lingering half-filled state).
        applyFill(k, smoothstep(0.02, 0.3, phase - k));

        // Unlock sequence — once the headline has landed, the three cells open in
        // turn as the act holds the stage: Compétences, then Expériences, then the
        // Livrable blooms in. Each de-blurs with a gold glow and sheds its lock.
        const local = phase - k; // 0 at this act's entry, ~0.84 as it hands off
        const steps = [
          smoothstep(0.3, 0.48, local), // Compétences
          smoothstep(0.48, 0.64, local), // Expériences
          smoothstep(0.64, 0.82, local), // Livrable
        ];
        const cells = cellEls[k];
        for (let c = 0; c < cells.length; c++) {
          const u = steps[Math.min(c, 2)];
          // the CONTENT de-blurs + rises in (the label + lock stay crisp)
          const body = bodyEls[k][c];
          if (body) {
            body.style.opacity = String(u);
            body.style.filter = `blur(${(1 - u) * 8}px)`;
            body.style.transform = `translateY(${(1 - u) * 12}px)`;
          }
          // the lock UNLOCKS first — the shackle swings open — then it fades + blurs away
          const lock = lockEls[k][c];
          if (lock) {
            const open = smoothstep(0.06, 0.46, u); // shackle swings open
            const gone = smoothstep(0.48, 0.9, u); // then the lock leaves
            const shackle = shackleEls[k][c];
            if (shackle)
              shackle.style.transform = `rotate(${-open * 44}deg) translateY(${-open * 2.5}px)`;
            lock.style.opacity = String(1 - gone);
            lock.style.transform = `scale(${1 + gone * 0.45}) translateY(${-gone * 4}px)`;
            lock.style.filter = `blur(${gone * 6}px)`;
          }
        }
      }

      setActiveVideo(reelsVis > 0.35 ? Math.round(feedIndex) : -1);

      // ── STAGE 3 · closing — arrives only after the reels have fully gone, so
      //    nothing overlaps; then the two blocks rise in turn ─────────────────
      const stageIn = smoothstep(0.87, 0.91, p);
      if (certRef.current) {
        certRef.current.style.opacity = String(stageIn);
        certRef.current.style.pointerEvents = stageIn > 0.5 ? "auto" : "none";
      }
      const leftIn = smoothstep(0.88, 0.94, p);
      if (leftCertRef.current) {
        leftCertRef.current.style.opacity = String(leftIn);
        leftCertRef.current.style.transform = `translateY(${(1 - leftIn) * 70}px)`;
      }
      const rightIn = smoothstep(0.94, 0.995, p);
      if (rightCertRef.current) {
        rightCertRef.current.style.opacity = String(rightIn);
        rightCertRef.current.style.transform = `translateY(${(1 - rightIn) * 70}px)`;
      }
    };

    const ctx = gsap.context(() => {
      // One long pin covering all three stages. The viewer holds still while the
      // intro, the reels and the closing cards each scroll into place.
      ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: "+=520%",
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
        onLeave: () => setActiveVideo(-1),
        onLeaveBack: () => setActiveVideo(-1),
      });
      render(0);
    }, pin);

    return () => ctx.revert();
  }, [animated, models]);

  if (!animated) return <StaticProgram />;

  return (
    <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
      {/* STAGE 1 — intro headline, centred */}
      <div
        ref={introRef}
        className="absolute inset-0 z-10 flex flex-col items-start justify-center px-[min(6vw,5rem)] will-change-[opacity,transform]"
      >
        <IntroHeader />
      </div>

      {/* STAGE 2 — the reels: cross-fading act panels + one flicking phone */}
      <div
        ref={reelsRef}
        className="absolute inset-0 z-20 flex items-center px-[min(6vw,5rem)] will-change-[opacity,transform]"
        style={{ opacity: 0 }}
      >
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          {/* LEFT — a clipped window; the three acts stack in a vertical track and
              slide through it in lock-step with the phone (one act at a time). */}
          <div className="relative h-[clamp(30rem,76vh,42rem)] overflow-hidden">
            <div
              ref={textTrackRef}
              className="absolute inset-x-0 top-0 h-[300%] will-change-transform"
            >
              {ACTS.map((a, k) => (
                <div
                  key={a.act}
                  ref={(el) => {
                    panelRefs.current[k] = el;
                  }}
                  className="flex h-1/3 flex-col justify-center"
                >
                  <ActText
                    act={a}
                    model={models[k]}
                    charRefs={charRefs}
                    index={k}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — one phone; its feed flicks between the three reels. */}
          <div
            ref={phoneRef}
            className="will-change-transform lg:justify-self-end"
          >
            <PhoneShell>
              <div
                ref={trackRef}
                className="absolute inset-x-0 top-0 h-[300%] will-change-transform"
              >
                {ACTS.map((a, k) => (
                  <div
                    key={a.act}
                    className="relative h-1/3 w-full overflow-hidden"
                  >
                    <ReelScreen
                      reel={a.reel}
                      videoRef={(el) => {
                        videoRefs.current[k] = el;
                      }}
                    />
                  </div>
                ))}
              </div>
            </PhoneShell>
          </div>
        </div>
      </div>

      {/* STAGE 3 — certificate + closing cards */}
      <div
        ref={certRef}
        className="absolute inset-0 z-30 flex items-start px-[min(6vw,5rem)] pt-[13vh] will-change-[opacity,transform]"
        style={{ opacity: 0 }}
      >
        <CertClosing
          animated
          leftRef={(el) => {
            leftCertRef.current = el;
          }}
          rightRef={(el) => {
            rightCertRef.current = el;
          }}
        />
      </div>
    </div>
  );
}

/**
 * Reduced-motion / narrow-screen fallback: the whole programme block in normal
 * flow — intro headline, the three acts stacked (each with its reel), then the
 * certificate + closing cards. No pin, no scrub.
 */
function StaticProgram() {
  return (
    <div className="px-[min(6vw,5rem)] py-28 md:py-40">
      <IntroHeader />
      <StaticReels />
      <div className="mt-20">
        <CertClosing />
      </div>
    </div>
  );
}

/** Three acts stacked, each with its reel (used by the static fallback). */
function StaticReels() {
  return (
    <div className="mt-16 flex flex-col gap-24">
      {ACTS.map((a, k) => (
        <div
          key={a.act}
          className="grid items-center gap-10 lg:grid-cols-[1fr_0.82fr] lg:gap-16"
        >
          <ActText act={a} reduced />
          <div className="lg:justify-self-end">
            <PhoneShell>
              <ReelScreen reel={a.reel} autoPlay />
            </PhoneShell>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ActText — the left reading column for one act: section marker, month/title
 * kicker, the Didot headline (fillable), the objective, the skills/experiences
 * blocks and the livrable chips.
 */
function ActText({
  act,
  model,
  charRefs,
  index,
  reduced = false,
}: {
  act: Act;
  model?: { words: { chars: { ch: string; fill: string; i: number }[] }[] };
  charRefs?: React.MutableRefObject<(HTMLSpanElement | null)[][]>;
  index?: number;
  reduced?: boolean;
}) {
  const m = model ?? buildModel(act.question, act.accent);
  const numeral = ["I", "II", "III"][index ?? ACTS.indexOf(act)] ?? "";
  const name = act.act.split("·").pop()?.trim() ?? act.act;
  return (
    <div className="w-full">
      {/* editorial index — serif numeral + act name + the month/phase line */}
      <div className="flex items-baseline gap-5">
        <span
          aria-hidden
          className="font-didot text-[clamp(2.6rem,4vw,3.6rem)] font-normal leading-none text-gold/85"
        >
          {numeral}
        </span>
        <div>
          <p className="font-didot text-[clamp(1.2rem,1.7vw,1.55rem)] font-normal leading-none text-cream">
            {fr(name)}
          </p>
          <p className="mt-2.5 font-satoshi text-[0.82rem] font-medium text-cream/50">
            {act.month} · {act.title}
          </p>
        </div>
      </div>

      {/* the fillable headline */}
      <h3 className="mt-8 max-w-[20ch] font-didot text-[clamp(1.7rem,4.4vw,3.75rem)] font-normal leading-[1.18] tracking-[-0.018em]">
        {m.words.map((word, wi) => (
          <span key={wi} className="mr-[0.26em] inline-block whitespace-nowrap">
            {word.chars.map((c) => (
              <span
                key={c.i}
                ref={
                  charRefs && index !== undefined
                    ? (el) => {
                        charRefs.current[index][c.i] = el;
                      }
                    : undefined
                }
                style={
                  reduced
                    ? { color: c.fill }
                    : {
                        backgroundImage: fillGradient(c.fill, 0),
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                      }
                }
              >
                {c.ch}
              </span>
            ))}
          </span>
        ))}
      </h3>

      <p className="mt-6 max-w-[44ch] font-satoshi text-[clamp(0.98rem,1.15vw,1.1rem)] leading-relaxed text-cream/60">
        {fr(act.objective)}
      </p>

      {/* Compétences · Expériences · Livrable — three cells that unlock in turn as
          the act holds the stage (driven by the scroll loop). Each sheds a lock
          and de-blurs with a gold glow; the Livrable blooms in last. */}
      <div className="mt-12 grid gap-x-12 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        <UnlockCell label="Compétences" reduced={reduced} lock>
          <SpecItems items={act.skills} />
        </UnlockCell>
        <UnlockCell label="Expériences" reduced={reduced} lock>
          <SpecItems items={act.experiences} />
        </UnlockCell>
        <UnlockCell label="Livrable" reduced={reduced}>
          <div className="space-y-1 pt-0.5">
            {act.livrables.map((l) => (
              <p
                key={l}
                className="font-didot text-[clamp(1.1rem,1.4vw,1.35rem)] italic leading-snug text-gold/90"
              >
                {fr(l)}
              </p>
            ))}
          </div>
        </UnlockCell>
      </div>
    </div>
  );
}

/** A spare padlock. Its shackle (`data-shackle`) swings open on its lower-left
 * pivot as the cell unlocks, then the whole lock fades + blurs away. */
function LockIcon() {
  return (
    <svg
      width="15"
      height="17"
      viewBox="0 0 24 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ overflow: "visible" }}
    >
      <rect x="3.5" y="12" width="17" height="13.5" rx="2.6" />
      <path
        data-shackle
        d="M7 12V8a5 5 0 0 1 10 0v4"
        style={{ transformBox: "fill-box", transformOrigin: "bottom left" }}
      />
    </svg>
  );
}

/**
 * One spec cell. In the animated runway the scroll loop drives its `[data-cell]`
 * (blur → clear + a gold bloom via `--glow`) and its `[data-lock]` badge (fades +
 * scales away). Under reduced motion it's just a plain, fully-open block.
 */
function UnlockCell({
  label,
  children,
  reduced = false,
  lock = false,
}: {
  label: string;
  children: React.ReactNode;
  reduced?: boolean;
  lock?: boolean;
}) {
  return (
    <div data-cell className="relative">
      <div className="relative flex items-center gap-3">
        <p className="font-satoshi text-[0.88rem] font-bold leading-none text-gold">
          {label}
        </p>
        {lock && !reduced && (
          <span
            data-lock
            aria-hidden
            className="ml-auto text-gold/65 will-change-[opacity,transform,filter]"
          >
            <LockIcon />
          </span>
        )}
      </div>
      <div
        data-cellbody
        className="relative mt-3"
        style={reduced ? undefined : { opacity: 0, willChange: "opacity, filter, transform" }}
      >
        {children}
      </div>
    </div>
  );
}

/** Hairline-separated list of spec items (Compétences / Expériences). */
function SpecItems({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li
          key={it}
          className="font-satoshi text-[0.95rem] leading-snug text-cream/75"
        >
          {fr(it)}
        </li>
      ))}
    </ul>
  );
}

/**
 * PhoneShell — the device frame: dark bezel, dynamic island, gold ambient glow
 * and a fixed 9:19.5 screen window. Children render inside the screen.
 */
function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[clamp(280px,38vh,360px)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(232,178,58,0.22), rgba(8,10,12,0) 70%)",
        }}
      />
      <div className="relative rounded-[2.6rem] border border-cream/15 bg-[#0a0b0d] p-2.5 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85),inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.05rem] bg-black">
          {children}
          {/* dynamic island — sits above the feed */}
          <div
            aria-hidden
            className="absolute left-1/2 top-3 z-30 h-[26px] w-[34%] -translate-x-1/2 rounded-full bg-black"
          />
        </div>
      </div>
    </div>
  );
}

/** ReelScreen — one reel's video + Instagram chrome (handle, counts, caption). */
function ReelScreen({
  reel,
  videoRef,
  autoPlay = false,
}: {
  reel: Reel;
  videoRef?: (el: HTMLVideoElement | null) => void;
  autoPlay?: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={reel.src}
        poster={reel.poster}
        muted
        loop
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        tabIndex={-1}
      />

      {/* legibility gradient for the chrome */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 56%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* side action rail */}
      <div className="absolute bottom-24 right-3 z-20 flex flex-col items-center gap-4 text-cream">
        <ReelAction
          label="J'aime"
          count={reel.likes}
          path="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
        />
        <ReelAction
          label="Commentaires"
          count={reel.comments}
          path="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"
        />
        <ReelAction
          label="Partager"
          count={reel.shares}
          path="M22 3 11 14M22 3l-7 19-4-8-8-4 19-7z"
        />
      </div>

      {/* bottom caption block */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-4 pr-14">
        <div className="flex items-center gap-2">
          <a
            href="https://www.instagram.com/aqluma.education/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="aqluma.education sur Instagram"
            className="flex items-center gap-2 outline-none focus-visible:ring-1 focus-visible:ring-cream/40"
          >
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-cream/20 bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/aqluma-mark.png"
                alt="aqluma.education"
                className="h-[60%] w-[60%] object-contain"
              />
            </span>
            <span className="font-satoshi text-[13px] font-semibold text-cream transition-opacity hover:opacity-80">
              aqluma.education
            </span>
          </a>
          <a
            href="https://www.instagram.com/aqluma.education/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[5px] border border-cream/40 px-1.5 py-px font-satoshi text-[10px] font-medium text-cream/85 outline-none transition-colors hover:border-cream/70 hover:text-cream focus-visible:ring-1 focus-visible:ring-cream/40"
          >
            Suivre
          </a>
        </div>
        <p className="mt-2.5 line-clamp-2 font-satoshi text-[12px] leading-snug text-cream/90">
          {fr(reel.caption)}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-cream/80">
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="h-3.5 w-3.5"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="font-satoshi text-[11px] font-medium">
            {reel.views} vues
          </span>
        </div>
      </div>
    </div>
  );
}

function ReelAction({
  label,
  path,
  count,
}: {
  label: string;
  path: string;
  count: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 24 24"
        className="h-6 w-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
      <span className="font-satoshi text-[11px] font-semibold leading-none text-cream drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
        {count}
      </span>
    </div>
  );
}

