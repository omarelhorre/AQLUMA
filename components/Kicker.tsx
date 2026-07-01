/**
 * Kicker — the one gold eyebrow used above section titles.
 *
 * Every section was inventing its own eyebrow (0.9 vs 0.95 vs 1.05rem, bold vs
 * semibold), which is the most visible "not one system" tell. This is that one
 * recipe: Satoshi, bold, TIGHT tracking, sentence/word case, gold. Deliberately
 * NOT wide-spaced caps — spaced caps read as AI-slop in this design (see the
 * removed `letterSpacing.kicker` token). Pass `className` to nudge colour/size
 * for a one-off without forking the recipe.
 */
export default function Kicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-satoshi text-[0.9rem] font-bold tracking-tight text-gold ${className}`}
    >
      {children}
    </span>
  );
}
