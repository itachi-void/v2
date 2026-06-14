import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

/**
 * Person lives as a separate absolutely-positioned element inside the button,
 * ~50px to the left of the door chip. Walks toward it then falls face-first.
 */

type Phase = "idle" | "walking" | "falling" | "collapsed";

const THEMES = {
  dark:  { bg: "#1E1E28", text: "#FFFFFF", icon: "#4A4A68", iconHover: "#5E5E86" },
  light: { bg: "#FFFFFF", text: "#1E1E28", icon: "#5A5A8C", iconHover: "#6E6EA8" },
};

const spring = { type: "spring" as const, stiffness: 320, damping: 26 };
const W = "#FFFFFF";

// Person SVG is 20 × 24. Feet sit at y=24 (bottom edge).
// transformOrigin:"center bottom" on the wrapper = pivot at feet. ✓
const PCX = 10; // horizontal center
const PSH = 9;  // shoulder y
const PHY = 14; // hip y

export default function LogoutButton({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const t = THEMES[theme];
  const [phase, setPhase] = useState<Phase>("idle");
  const [hover, setHover] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function handleClick() {
    if (phase !== "idle") return;
    setPhase("walking");
    timers.current.push(
      window.setTimeout(() => setPhase("falling"),   420),
      window.setTimeout(() => setPhase("collapsed"), 760),
      window.setTimeout(() => setPhase("idle"),     2800),
    );
  }

  const isActive    = phase !== "idle";
  const isWalking   = phase === "walking";
  const isFalling   = phase === "falling" || phase === "collapsed";
  const isCollapsed = phase === "collapsed";

  // Layout (button 200px expanded):
  //   label:      left 20px
  //   person:     left 90px, width 20px  → right edge at 110px
  //   door chip:  40px + 12px margin → left edge at 148px
  //   gap:        148 - 110 = 38px ≈ "50 حء"
  const walkX = isActive ? 38 : hover ? 5 : 0;

  const limbT = {
    duration:   0.22,
    repeat:     isWalking ? Infinity : 0,
    repeatType: "mirror" as const,
    ease:       "easeInOut" as const,
  };

  // Cross-coordination: left-arm ↔ right-leg share phase; right-arm ↔ left-leg share phase
  const leftArmV  = { animate: { rotate: isWalking ? [-25,  25] : 0 }, transition: limbT };
  const rightArmV = { animate: { rotate: isWalking ? [ 25, -25] : 0 }, transition: limbT };
  const leftLegV  = { animate: { rotate: isWalking ? [ 35, -35] : 0 }, transition: limbT };
  const rightLegV = { animate: { rotate: isWalking ? [-35,  35] : 0 }, transition: limbT };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      aria-label="Log out"
      className="relative flex items-center justify-end overflow-hidden"
      style={{
        height: 56,
        background: t.bg,
        border: theme === "light" ? "1px solid rgba(0,0,0,0.08)" : "none",
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        cursor: phase === "idle" ? "pointer" : "default",
      }}
      animate={{
        width:        isCollapsed ? 56 : 200,
        borderRadius: isCollapsed ? 28 : 16,
        scale:        hover && phase === "idle" ? 0.98 : 1,
      }}
      transition={isCollapsed ? { duration: 0.4, ease: [0.4, 0, 0.2, 1] } : spring}
    >
      {/* Label */}
      <motion.span
        className="absolute left-5 whitespace-nowrap"
        style={{ color: t.text, fontWeight: 600, fontSize: 15 }}
        animate={{ x: isActive ? -20 : 0, opacity: isActive ? 0 : 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        Log Out
      </motion.span>

      {/* ── Person ───────────────────────────────────────────────────────
          Separate from door chip. ~38px gap at rest, walks to door on click.
      ── */}
      <motion.div
        className="absolute"
        style={{
          left: 90,
          top: 0,
          bottom: 0,
          width: 20,
          display: "flex",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 1,
        }}
        animate={{ x: walkX, opacity: isCollapsed ? 0 : 1 }}
        transition={{
          x:       { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.18 },
        }}
      >
        {/* Fall: rotate 90° CW around center-bottom = feet pivot */}
        <motion.div
          style={{ transformOrigin: "center bottom" }}
          animate={{ rotate: isFalling ? 90 : 0 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 1, 1] }}
        >
          <svg width={20} height={24} viewBox="0 0 20 24" fill="none">
            {/* Head */}
            <circle cx={PCX} cy={3} r={2.4} fill={W} />

            {/* Torso */}
            <line x1={PCX} y1={5.4} x2={PCX} y2={PHY}
              stroke={W} strokeWidth={1.8} strokeLinecap="round" />

            {/* Left arm */}
            <motion.g style={{ transformOrigin: `${PCX}px ${PSH}px` }} {...leftArmV}>
              <line x1={PCX} y1={PSH} x2={PCX - 3} y2={PSH + 4}
                stroke={W} strokeWidth={1.5} strokeLinecap="round" />
            </motion.g>

            {/* Right arm */}
            <motion.g style={{ transformOrigin: `${PCX}px ${PSH}px` }} {...rightArmV}>
              <line x1={PCX} y1={PSH} x2={PCX + 3} y2={PSH + 4}
                stroke={W} strokeWidth={1.5} strokeLinecap="round" />
            </motion.g>

            {/* Left leg */}
            <motion.g style={{ transformOrigin: `${PCX}px ${PHY}px` }} {...leftLegV}>
              <line x1={PCX} y1={PHY} x2={PCX - 2} y2={24}
                stroke={W} strokeWidth={1.5} strokeLinecap="round" />
            </motion.g>

            {/* Right leg */}
            <motion.g style={{ transformOrigin: `${PCX}px ${PHY}px` }} {...rightLegV}>
              <line x1={PCX} y1={PHY} x2={PCX + 2} y2={24}
                stroke={W} strokeWidth={1.5} strokeLinecap="round" />
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>

      {/* ── Door chip — just the door, person is separate ─────────────── */}
      <motion.div
        className="relative mr-3 flex items-center justify-center overflow-hidden rounded-xl"
        style={{ width: 40, height: 40 }}
        animate={{ backgroundColor: hover ? t.iconHover : t.icon }}
        transition={{ duration: 0.15 }}
      >
        <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
          <rect x={9} y={8} width={22} height={24} rx={1.5}
            stroke={W} strokeWidth={2} fill="none" />
          {/* Knob on interior (left) side */}
          <circle cx={10.8} cy={20} r={1.3} fill={W} />
        </svg>
      </motion.div>
    </motion.button>
  );
}
