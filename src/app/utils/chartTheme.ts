import type { CSSProperties } from "react";

/**
 * Recharts tooltip style. Pass `isDark` derived from the active theme
 * (e.g. `const { resolvedTheme } = useTheme(); const isDark = resolvedTheme === "dark"`).
 */
export function tooltipStyle(isDark: boolean = false): CSSProperties {
  if (isDark) {
    return {
      backgroundColor: "rgba(10,14,20,0.92)",
      border: "1px solid rgba(51,65,85,0.6)", // slate-700
      borderRadius: "12px",
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
      backdropFilter: "blur(12px)",
      color: "rgba(226,232,240,1)", // slate-200
    };
  }
  return {
    backgroundColor: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(148,163,184,0.3)",
    borderRadius: "12px",
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
    backdropFilter: "blur(12px)",
    color: "rgba(15,23,42,1)", // slate-900
  };
}

export default tooltipStyle;
