"use client";

import { useEffect, useRef, useState } from "react";
import { fr } from "@/lib/typo";

type Sexe = "homme" | "femme" | "autre";

type FormState = {
  prenom: string;
  nom: string;
  sexe: Sexe | "";
  email: string;
  updates: boolean;
};

const EMPTY: FormState = {
  prenom: "",
  nom: "",
  sexe: "",
  email: "",
  updates: false,
};

const SEXES: { value: Sexe; label: string }[] = [
  { value: "homme", label: "Homme" },
  { value: "femme", label: "Femme" },
  { value: "autre", label: "Autre" },
];

/**
 * App-wide "Demander le programme" modal, mounted at the body level (in layout)
 * so it sits above every pinned section. The hero CTA ("Bienvenu chez AQLUMA")
 * opens it by dispatching a window `aqluma:program` event. Frosted backdrop + a
 * dark card holding the request form (prénom, nom, sexe, email, opt-in). On
 * submit it shows a quiet thank-you state.
 *
 * TODO(aqluma): wire `submit()` to the real endpoint (CRM / mailing list).
 */
export default function ProgramModal() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Open on the shared event from the hero CTA.
  useEffect(() => {
    const onOpen = () => {
      setSent(false);
      setForm(EMPTY);
      setOpen(true);
    };
    window.addEventListener("aqluma:program", onOpen);
    return () => window.removeEventListener("aqluma:program", onOpen);
  }, []);

  // While open: lock body scroll, move focus in, trap Tab, restore focus on close.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const f = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])'
        );
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO(aqluma): POST `form` to the real endpoint (CRM / mailing list).
    setSent(true);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const fieldClass =
    "w-full rounded-lg border border-cream/12 bg-cream/[0.03] px-3.5 py-2.5 font-satoshi text-[0.95rem] text-cream placeholder:text-cream/35 outline-none transition-colors duration-200 focus:border-gold/60 focus:bg-cream/[0.05]";
  const labelClass =
    "mb-1.5 block text-left font-satoshi text-[0.85rem] font-medium text-cream/55";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Demander le programme"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{
        backgroundColor: "rgba(8,10,12,0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[30rem] rounded-2xl border border-cream/12 bg-[#0e1114] px-8 py-11 shadow-2xl"
        style={{
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
          transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-cream/55 transition-colors duration-200 hover:bg-cream/10 hover:text-cream"
        >
          ×
        </button>

        {sent ? (
          <div className="py-6 text-center">
            <h3 className="font-didot text-[clamp(1.6rem,3vw,2.2rem)] font-normal tracking-[-0.01em] text-cream">
              {fr("C’est noté !")}
            </h3>
            <p className="mx-auto mt-3 max-w-[30ch] font-satoshi text-[0.95rem] leading-relaxed text-cream/60">
              {fr(
                "Merci. Nous vous envoyons le programme AQLUMA très vite à l’adresse indiquée.",
              )}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-cream px-6 py-3 font-satoshi text-[13px] font-semibold tracking-tight text-void outline-none transition-all duration-300 ease-editorial hover:-translate-y-[1px] hover:bg-white focus-visible:ring-2 focus-visible:ring-cream/40"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-center font-didot text-[clamp(1.6rem,3vw,2.2rem)] font-normal tracking-[-0.01em] text-cream">
              Demander le programme
            </h3>
            <p className="mx-auto mt-3 max-w-[32ch] text-center font-satoshi text-[0.95rem] leading-relaxed text-cream/60">
              {fr(
                "Laissez-nous vos coordonnées : nous vous envoyons le programme AQLUMA.",
              )}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pm-prenom" className={labelClass}>
                    Prénom
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="pm-prenom"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={form.prenom}
                    onChange={(e) => set("prenom", e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="pm-nom" className={labelClass}>
                    Nom
                  </label>
                  <input
                    id="pm-nom"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={form.nom}
                    onChange={(e) => set("nom", e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <span className={labelClass}>Sexe</span>
                <div className="grid grid-cols-3 gap-2">
                  {SEXES.map((s) => {
                    const active = form.sexe === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => set("sexe", s.value)}
                        className={[
                          "rounded-lg border px-3 py-2.5 font-satoshi text-[0.9rem] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gold/40",
                          active
                            ? "border-gold/60 bg-gold/10 text-cream"
                            : "border-cream/12 bg-cream/[0.03] text-cream/65 hover:border-cream/25 hover:text-cream",
                        ].join(" ")}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="pm-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="pm-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={fieldClass}
                  placeholder="vous@exemple.com"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-left">
                <input
                  type="checkbox"
                  checked={form.updates}
                  onChange={(e) => set("updates", e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
                />
                <span className="font-satoshi text-[0.85rem] leading-snug text-cream/65">
                  {fr(
                    "Je souhaite recevoir d’autres actualités à propos d’AQLUMA.",
                  )}
                </span>
              </label>

              <button
                type="submit"
                className="group/cta mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cream px-6 py-3 font-satoshi text-[13px] font-semibold tracking-tight text-void outline-none transition-all duration-300 ease-editorial hover:-translate-y-[1px] hover:bg-white hover:shadow-[0_12px_30px_-8px_rgba(247,244,239,0.45)] focus-visible:ring-2 focus-visible:ring-cream/40"
              >
                Envoyer la demande
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  aria-hidden
                  className="translate-x-0 transition-transform duration-300 ease-editorial group-hover/cta:translate-x-[3px]"
                >
                  <path
                    d="M2.5 7h9M8 3.5L11.5 7 8 10.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
