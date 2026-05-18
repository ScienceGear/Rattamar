import React from "react";

const SYMBOLS: Record<string, string> = {
  // logical (kept for completeness)
  AND: "∧",
  OR: "∨",
  NOT: "¬",
  IMPLIES: "→",
  EQUIV: "↔",
  FORALL: "∀",
  EXISTS: "∃",
  TOP: "⊤",
  BOTTOM: "⊥",
  // GD&T / engineering symbols
  DIAMETER: "Ø",
  RADIUS: "R",
  PERPENDICULAR: "⊥",
  PARALLEL: "∥",
  POSITION: "⌖",
  CIRCULARITY: "○",
  FLATNESS: "▱",
  CONCENTRICITY: "◎",
  CYLINDRICITY: "⌭",
  PROFILE_LINE: "⌒",
  TOTAL_RUNOUT: "⌰",
  PROFILE_SURFACE: "⌓",
  SYMMETRY: "⌯",
  STRAIGHT_LINE: "―",
};

export default function GDNTSymbol({ name, className }: { name: string; className?: string }) {
  const sym = SYMBOLS[name] ?? "?";
  return (
    <span className={className ? className : "inline-block align-middle mr-1"} aria-hidden>
      {sym}
    </span>
  );
}

export { SYMBOLS };
