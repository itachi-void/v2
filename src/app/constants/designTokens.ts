/**
 * EcoVision Design System - Standardized Design Tokens
 * 
 * Ensures consistency across all components and pages
 */

// Button Sizes (standardized heights)
export const buttonSizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

// Icon Sizes (standardized dimensions)
export const iconSizes = {
  header: "w-6 h-6",        // Page header icons
  button: "w-4 h-4",        // Button icons
  card: "w-5 h-5",          // Card section icons
  large: "w-8 h-8",         // Large display icons
  xl: "w-10 h-10",          // Extra large icons
} as const;

// Border Radius (standardized rounded corners)
export const borderRadius = {
  card: "rounded-3xl",      // Cards and major sections
  button: "rounded-full",   // Buttons and pills
  input: "rounded-full",    // Input fields
  badge: "rounded-full",    // Badges and tags
  modal: "rounded-3xl",     // Modals and dialogs
  image: "rounded-2xl",     // Images and avatars
} as const;

// Typography Weights (standardized font weights)
export const fontWeights = {
  heading: 700,             // Page titles and major headings
  subheading: 600,          // Section titles
  body: 400,                // Regular text
  label: 500,               // Form labels and secondary text
} as const;

// Spacing Scale (4px grid system)
export const spacing = {
  xs: "gap-1",              // 4px - Inline icon/text spacing
  sm: "gap-2",              // 8px - Chip/button groups
  md: "gap-3",              // 12px - Form fields
  lg: "gap-4",              // 16px - Section elements
  xl: "gap-6",              // 24px - Major sections
  "2xl": "gap-8",           // 32px - Page sections
} as const;

// Focus Ring (WCAG accessibility)
export const focusRing = "focus:outline-none focus:ring-2 focus:ring-emerald-400/50 dark:focus:ring-emerald-400/70";

// Input Field Styles (dark mode fix)
export const inputClasses = {
  base: "w-full px-4 rounded-full border text-sm transition-all",
  light: "bg-white/80 border-slate-200 text-slate-700",
  dark: "dark:bg-white/10 dark:border-white/20 dark:text-slate-200", // Increased contrast
  focus: focusRing,
} as const;

export const inputClassFull = `${inputClasses.base} ${inputClasses.light} ${inputClasses.dark} ${inputClasses.focus}`;

// Hover States (dark mode fix)
export const hoverStates = {
  card: "hover:bg-slate-50 dark:hover:bg-white/10",        // Increased from /5 to /10
  button: "hover:bg-slate-100 dark:hover:bg-white/10",
  subtle: "hover:bg-slate-50 dark:hover:bg-white/5",
} as const;

// Glass Card (base component style)
export const glassCard = "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl";

export default {
  buttonSizes,
  iconSizes,
  borderRadius,
  fontWeights,
  spacing,
  focusRing,
  inputClasses,
  inputClassFull,
  hoverStates,
  glassCard,
};
