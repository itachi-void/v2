export type AccentEntry = {
  bg: string;
  /** Foreground text color (canonical 600/400 light/dark). */
  fg: string;
  /** Alias for `fg` kept for callers that expect a `text` property. */
  text: string;
  border: string;
  ring: string;
  gradient: string;
};

// All class strings are written as literals so Tailwind's JIT can detect them.
export const accentMap: Record<string, AccentEntry> = {
  emerald: {
    bg: "bg-emerald-500/10",
    fg: "text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    ring: "ring-emerald-500/30",
    gradient: "from-emerald-400 to-emerald-600",
  },
  teal: {
    bg: "bg-teal-500/10",
    fg: "text-teal-600 dark:text-teal-400",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/20",
    ring: "ring-teal-500/30",
    gradient: "from-teal-400 to-teal-600",
  },
  amber: {
    bg: "bg-amber-500/10",
    fg: "text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    ring: "ring-amber-500/30",
    gradient: "from-amber-400 to-amber-600",
  },
  sky: {
    bg: "bg-sky-500/10",
    fg: "text-sky-600 dark:text-sky-400",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
    ring: "ring-sky-500/30",
    gradient: "from-sky-400 to-sky-600",
  },
  violet: {
    bg: "bg-violet-500/10",
    fg: "text-violet-600 dark:text-violet-400",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    ring: "ring-violet-500/30",
    gradient: "from-violet-400 to-violet-600",
  },
  rose: {
    bg: "bg-rose-500/10",
    fg: "text-rose-600 dark:text-rose-400",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    ring: "ring-rose-500/30",
    gradient: "from-rose-400 to-rose-600",
  },
  lime: {
    bg: "bg-lime-500/10",
    fg: "text-lime-600 dark:text-lime-400",
    text: "text-lime-600 dark:text-lime-400",
    border: "border-lime-500/20",
    ring: "ring-lime-500/30",
    gradient: "from-lime-400 to-lime-600",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10",
    fg: "text-fuchsia-600 dark:text-fuchsia-400",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    border: "border-fuchsia-500/20",
    ring: "ring-fuchsia-500/30",
    gradient: "from-fuchsia-400 to-fuchsia-600",
  },
  slate: {
    bg: "bg-slate-500/10",
    fg: "text-slate-600 dark:text-slate-300",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-500/20",
    ring: "ring-slate-500/30",
    gradient: "from-slate-400 to-slate-500",
  },
  blue: {
    bg: "bg-blue-500/10",
    fg: "text-blue-600 dark:text-blue-400",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    ring: "ring-blue-500/30",
    gradient: "from-blue-400 to-blue-600",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    fg: "text-indigo-600 dark:text-indigo-400",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    ring: "ring-indigo-500/30",
    gradient: "from-indigo-400 to-indigo-600",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    fg: "text-cyan-600 dark:text-cyan-400",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
    ring: "ring-cyan-500/30",
    gradient: "from-cyan-400 to-cyan-600",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    fg: "text-yellow-600 dark:text-yellow-400",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-500/20",
    ring: "ring-yellow-500/30",
    gradient: "from-yellow-400 to-yellow-600",
  },
  orange: {
    bg: "bg-orange-500/10",
    fg: "text-orange-600 dark:text-orange-400",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
    ring: "ring-orange-500/30",
    gradient: "from-orange-400 to-orange-600",
  },
};

export default accentMap;
