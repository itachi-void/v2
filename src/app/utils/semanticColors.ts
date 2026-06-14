import { accentMap, type AccentEntry } from "@/app/utils/accent";

/**
 * Maps semantic UI roles to canonical accent palette keys.
 *
 * Use these names instead of color names when expressing intent
 * (e.g. an error message, a warning badge). This keeps color choices
 * consistent across the dashboard and makes future palette swaps
 * trivial — change the mapping here, every consumer updates.
 *
 * @example
 *   const a = getSemanticAccent("danger");
 *   <div className={a.bg}>...
 */
export const semantic = {
  /** Positive outcomes: success states, completed milestones, gains. */
  success: "emerald",
  /** Negative outcomes: errors, destructive actions, critical alerts. */
  danger: "rose",
  /** Caution: pending review, soft warnings, attention-needed states. */
  warning: "amber",
  /** Informational: tips, neutral notifications, secondary data. */
  info: "sky",
  /** Neutral / muted: disabled, archived, low-emphasis chrome. */
  neutral: "slate",
  /** Highlight: featured items, premium tiers, special callouts. */
  highlight: "violet",
} as const;

export type SemanticKind = keyof typeof semantic;

/**
 * Returns the {@link AccentEntry} for a semantic role.
 *
 * Prefer this helper over indexing `accentMap` directly when the
 * color choice represents meaning rather than aesthetic preference.
 *
 * @param kind - The semantic role (e.g. "success", "danger").
 * @returns The matching accent entry with bg/fg/text/border/ring/gradient strings.
 */
export function getSemanticAccent(kind: SemanticKind): AccentEntry {
  return accentMap[semantic[kind]];
}
