import type { Transition, Variants } from "motion/react";

/**
 * Centralized motion system — inspired by Linear, Stripe, and Framer.
 *
 * Principles:
 *  - Short, purposeful durations. Micro-interactions live in 150–250ms.
 *  - One primary easing curve (easeOutExpo-like) for a calm, decisive feel.
 *  - Springs are low-bounce; no decorative wobble.
 *  - Movement supports hierarchy and feedback, never decoration.
 */

/* ----------------------------- Duration tokens ---------------------------- */
export const duration = {
  /** Instant feedback — taps, toggles. */
  instant: 0.12,
  /** Fast micro-interactions — hovers, small state changes. */
  fast: 0.18,
  /** Default UI transitions — most elements. */
  base: 0.24,
  /** Entrance reveals, larger surfaces. */
  slow: 0.4,
  /** Hero / first-paint moments only. */
  hero: 0.6,
} as const;

/* ------------------------------ Easing curves ----------------------------- */
export const ease = {
  /** Primary curve — decisive out-ease (Linear/Stripe feel). */
  standard: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** Symmetric in/out for moving existing elements. */
  inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  /** Quick acceleration for exits. */
  in: [0.4, 0, 1, 1] as [number, number, number, number],
} as const;

/* ------------------------------- Springs ---------------------------------- */
/** Low-bounce spring for shared-layout transitions (layoutId pills, tabs). */
export const springLayout: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.8,
};

/** Snappy spring for small interactive elements. */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 34,
};

/* --------------------------- Reusable transitions ------------------------- */
export const tFast: Transition = { duration: duration.fast, ease: ease.standard };
export const tBase: Transition = { duration: duration.base, ease: ease.standard };
export const tSlow: Transition = { duration: duration.slow, ease: ease.standard };

/* ------------------------------- Variants --------------------------------- */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: tBase },
};

/** Subtle rise — the workhorse reveal. Distance kept small on purpose. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: tSlow },
};

/** Gentle scale for cards/modals. No overshoot. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: tBase },
};

/** Container that staggers its children's entrance. */
export const staggerContainer = (stagger = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Default viewport config for scroll-triggered reveals — fire once, slightly early. */
export const viewportOnce = { once: true, margin: "-80px" } as const;

/* --------------------------- Micro-interactions --------------------------- */
/** Minimal, clarity-focused hover/press for interactive surfaces. */
export const hoverLift = {
  whileHover: { y: -2, transition: tFast },
  whileTap: { scale: 0.985, transition: { duration: duration.instant } },
};

/** Pressable without vertical movement — buttons, chips. */
export const pressable = {
  whileHover: { scale: 1.02, transition: tFast },
  whileTap: { scale: 0.97, transition: { duration: duration.instant } },
};
