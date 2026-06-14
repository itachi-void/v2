import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, animate } from "motion/react";

// ─── Layout ───────────────────────────────────────────────────────────────────
const BW          = 190;
const BH          = 52;
const DW          = 22;
const DH          = 34;
const DOOR_MARGIN = 14;
const DX          = BW - DW - DOOR_MARGIN;   // 154
const CS          = 20;                        // char rest x
const CE          = DX + 6;                   // 160 — 6 px inside door
const FALL_L      = DX + DW / 2 - 7;         // 158
const FALL_T      = Math.round((BH - 22) / 2); // 15

// ─── Springs ──────────────────────────────────────────────────────────────────
const SP_SNAPPY = { type: "spring", stiffness: 520, damping: 30 } as const;
const SP_HEAVY  = { type: "spring", stiffness: 260, damping: 24, mass: 1.2 } as const;
const SP_BOUNCY = { type: "spring", stiffness: 320, damping: 20 } as const;
const SP_NUDGE  = { type: "spring", stiffness: 88,  damping: 15 } as const;

// ─── Themes ───────────────────────────────────────────────────────────────────
const T = {
  dark: {
    bg:         "linear-gradient(148deg,#1c1c2e 0%,#242438 100%)",
    border:     "rgba(255,255,255,0.08)",
    text:       "rgba(255,255,255,0.92)",
    char:       "rgba(255,255,255,0.90)",
    doorFill:   "rgba(90,80,155,0.60)",
    doorBorder: "rgba(255,255,255,0.18)",
    doorHover:  "#9b7ef8",
    glow:       "rgba(155,126,248,0.30)",
    shadow:     "rgba(0,0,0,0.32)",
  },
  light: {
    bg:         "linear-gradient(148deg,#f5f5fd 0%,#eeeef8 100%)",
    border:     "rgba(0,0,0,0.07)",
    text:       "rgba(18,18,42,0.90)",
    char:       "rgba(22,22,52,0.82)",
    doorFill:   "rgba(140,125,215,0.35)",
    doorBorder: "rgba(0,0,0,0.16)",
    doorHover:  "#7c5ce8",
    glow:       "rgba(124,92,232,0.20)",
    shadow:     "rgba(0,0,0,0.12)",
  },
} as const;

type Phase = "idle" | "clicking" | "falling" | "closing";

// ─── Falling character (logout only) ─────────────────────────────────────────
function FallingChar({ color, flailing }: { color: string; flailing: boolean }) {
  const ft = { duration: 0.13, repeat: flailing ? Infinity : 0, repeatType: "mirror" as const, ease: "easeInOut" as const };
  const fl = { ...ft, duration: 0.16 };
  return (
    <svg width={14} height={22} viewBox="0 0 14 22" fill="none">
      <circle cx={7} cy={3.5} r={2.6} fill={color} />
      <circle cx={7} cy={4.3} r={1.0} fill="rgba(0,0,0,0.30)" />
      <line x1={7} y1={6.1} x2={7} y2={12.5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <motion.g style={{ transformOrigin: "7px 8.5px" }} animate={{ rotate: flailing ? [-55,-20] : -45 }} transition={ft}>
        <line x1={7} y1={8.5} x2={2} y2={4} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </motion.g>
      <motion.g style={{ transformOrigin: "7px 8.5px" }} animate={{ rotate: flailing ? [55,20] : 45 }} transition={ft}>
        <line x1={7} y1={8.5} x2={12} y2={4} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </motion.g>
      <motion.g style={{ transformOrigin: "7px 12.5px" }} animate={{ rotate: flailing ? [30,-12] : 22 }} transition={fl}>
        <line x1={7} y1={12.5} x2={3.5} y2={19} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </motion.g>
      <motion.g style={{ transformOrigin: "7px 12.5px" }} animate={{ rotate: flailing ? [-30,12] : -22 }} transition={fl}>
        <line x1={7} y1={12.5} x2={10.5} y2={19} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PremiumAuthButton({
  theme   = "dark",
  variant = "logout",
  label,
  accent,
  flashColor,
  onLogout,
  onLogin,
  onSignup,
  onClick,
}: {
  theme?:   "dark" | "light";
  variant?: "login" | "logout" | "signup";
  /** Optional label override. Defaults to variant-appropriate text. */
  label?:   string;
  /** CSS color (any format). Overrides door / glow / hover tint. */
  accent?:  string;
  /** CSS color used for the success flash. Defaults: login=green, signup=amber. */
  flashColor?: string;
  onLogout?: () => void;
  onLogin?:  () => void;
  onSignup?: () => void;
  /** Optional generic click hook called when the door-closes phase triggers. */
  onClick?:  () => void;
}) {
  const base = T[theme];
  const c = accent
    ? {
        ...base,
        doorFill:   `color-mix(in srgb, ${accent} 55%, ${base.doorFill})`,
        doorBorder: `color-mix(in srgb, ${accent} 45%, ${base.doorBorder})`,
        doorHover:  accent,
        glow:       `color-mix(in srgb, ${accent} 60%, transparent)`,
      }
    : base;
  const isEntering = variant === "login" || variant === "signup";
  const isLogin    = isEntering;
  const defaultFlash =
    variant === "signup"
      ? "rgba(251,191,36,0.22)"     /* amber */
      : "rgba(74,222,128,0.18)";    /* emerald */
  const flash = flashColor ?? defaultFlash;
  const finalLabel =
    label ?? (variant === "login" ? "Log In" : variant === "signup" ? "Sign Up" : "Log Out");

  const [phase,          setPhase]          = useState<Phase>("idle");
  const [isHovered,      setIsHovered]      = useState(false);
  const [doorIsOpen,     setDoorIsOpen]     = useState(false);
  const [charFlailing,   setCharFlailing]   = useState(false);
  const [loginSuccess,   setLoginSuccess]   = useState(false);
  const [isCharRunning,  setIsCharRunning]  = useState(false);
  const [charFacesRight, setCharFacesRight] = useState(true);
  const timers = useRef<number[]>([]);

  // Motion values
  const charX            = useMotionValue(CS); // plain MV — animate() is exact
  const charAlpha        = useMotionValue(1);
  const btnScale         = useSpring(1, SP_SNAPPY);
  const btnY             = useMotionValue(0);
  const fallingCharY     = useMotionValue(0);
  const fallingCharAlpha = useMotionValue(0);

  // Limb rotation values (imperative, guaranteed to fire)
  const leftArmRot  = useMotionValue(0);
  const rightArmRot = useMotionValue(0);
  const leftLegRot  = useMotionValue(0);
  const rightLegRot = useMotionValue(0);

  // Continuous limb animation while running
  useEffect(() => {
    if (!isCharRunning) return;
    const c1 = animate(leftArmRot,  [ 30,-30], { repeat: Infinity, repeatType: "mirror", duration: 0.17, ease: "easeInOut" });
    const c2 = animate(rightArmRot, [-30, 30], { repeat: Infinity, repeatType: "mirror", duration: 0.17, ease: "easeInOut" });
    const c3 = animate(leftLegRot,  [-36, 36], { repeat: Infinity, repeatType: "mirror", duration: 0.17, ease: "easeInOut" });
    const c4 = animate(rightLegRot, [ 36,-36], { repeat: Infinity, repeatType: "mirror", duration: 0.17, ease: "easeInOut" });
    return () => { c1.stop(); c2.stop(); c3.stop(); c4.stop(); };
  }, [isCharRunning]);

  // Idle float
  useEffect(() => {
    if (phase !== "idle") return;
    const ctrl = animate(btnY, [0,-1.5,0], { repeat: Infinity, duration: 2.8, ease: "easeInOut" });
    return () => ctrl.stop();
  }, [phase]);

  const clearT = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const sched  = (pairs: [() => void, number][]) =>
    pairs.forEach(([fn, d]) => timers.current.push(window.setTimeout(fn, d)));

  const resetLimbs = () => {
    leftArmRot.set(0); rightArmRot.set(0); leftLegRot.set(0); rightLegRot.set(0);
  };

  const resetAll = () => {
    charX.set(CS);
    charAlpha.set(1);
    setDoorIsOpen(false);
    setIsCharRunning(false);
    setCharFacesRight(true);
    setCharFlailing(false);
    setLoginSuccess(false);
    fallingCharY.set(0);
    fallingCharAlpha.set(0);
    resetLimbs();
  };

  // ── Hover: 10 px nudge + one-shot step ───────────────────────────────────
  const onHoverStart = () => {
    if (isLocked) return;
    setIsHovered(true);
    btnScale.set(1.03);
    animate(charX, CS + 10, SP_NUDGE);
    animate(leftArmRot,  [0,  22, 0], { duration: 0.46, ease: "easeInOut" });
    animate(rightArmRot, [0, -22, 0], { duration: 0.46, ease: "easeInOut" });
    animate(leftLegRot,  [0, -28, 0], { duration: 0.46, ease: "easeInOut" });
    animate(rightLegRot, [0,  28, 0], { duration: 0.46, ease: "easeInOut" });
  };

  const onHoverEnd = () => {
    if (isLocked) return;
    setIsHovered(false);
    btnScale.set(1);
    animate(charX, CS, SP_NUDGE);
    resetLimbs();
  };

  // ── Logout click: sprint right → fall ────────────────────────────────────
  const handleLogoutClick = () => {
    clearT(); resetAll(); setIsHovered(false);
    setPhase("clicking"); btnScale.set(0.96);

    sched([
      [() => {
        btnScale.set(1);
        setIsCharRunning(true); setCharFacesRight(true);
        animate(charX, CE, { duration: 0.30, ease: [0.22, 0, 0.6, 1] });
        setDoorIsOpen(true);
      }, 75],
      [() => {
        setIsCharRunning(false);
        animate(charAlpha, 0, { duration: 0.10 });
        animate(fallingCharAlpha, 1, { duration: 0.08 });
        setPhase("falling");
      }, 430],
      [() => {
        setCharFlailing(true);
        animate(fallingCharY, 100, { duration: 0.82, ease: [0.22, 0, 1, 0.88] });
      }, 570],
      [() => animate(fallingCharAlpha, 0, { duration: 0.30 }), 1100],
      [() => { setPhase("closing"); setDoorIsOpen(false); }, 1380],
      [() => { btnScale.set(1.06); onLogout?.(); }, 1640],
      [() => { btnScale.set(1); }, 1840],
      [() => { resetAll(); setPhase("idle"); }, 2600],
    ]);
  };

  // ── Login click: sprint right → enter door → door slams → green flash ───────
  const handleLoginClick = () => {
    clearT(); resetAll(); setIsHovered(false);
    setLoginSuccess(false);
    setPhase("clicking"); btnScale.set(0.96);

    sched([
      // ① Release — char sprints RIGHT to door + door opens simultaneously
      [() => {
        btnScale.set(1);
        setIsCharRunning(true);
        setCharFacesRight(true);
        animate(charX, CE, { duration: 0.30, ease: [0.22, 0, 0.6, 1] });
        setDoorIsOpen(true);
      }, 75],

      // ② Char at door → fade out (system absorbs them)
      [() => {
        setIsCharRunning(false);
        animate(charAlpha, 0, { duration: 0.14 });
      }, 430],

      // ③ Door slams SHUT — spring overshoot makes it feel weighty
      [() => {
        setDoorIsOpen(false);
        setPhase("closing");
      }, 620],

      // ④ Green flash — system confirms login
      [() => {
        setLoginSuccess(true);
        btnScale.set(1.06);
        if (variant === "signup") onSignup?.(); else onLogin?.();
        onClick?.();
      }, 880],
      [() => { btnScale.set(1); }, 1080],

      // ⑤ Flash fades out
      [() => { setLoginSuccess(false); }, 1500],

      // ⑥ Full reset
      [() => { resetAll(); setPhase("idle"); }, 1700],
    ]);
  };

  const handleClick = () => {
    if (isLocked) return;
    if (isLogin) handleLoginClick(); else handleLogoutClick();
  };

  useEffect(() => () => clearT(), []);

  const isLocked = ["clicking", "falling", "closing"].includes(phase);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.button
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={handleClick}
      animate={{
        boxShadow: isHovered
          ? `0 18px 44px ${c.shadow}, 0 0 26px ${c.glow}`
          : `0 6px 20px ${c.shadow}`,
      }}
      transition={{ boxShadow: { duration: 0.4, ease: "easeOut" } }}
      style={{
        width: BW, height: BH,
        scale: btnScale, y: btnY,
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 14,
        border: `1px solid ${c.border}`,
        background: c.bg,
        cursor: isLocked ? "default" : "pointer",
        overflow: "visible",
        userSelect: "none",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        flexShrink: 0,
      }}
    >
      {/* Glassy sheen */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "44%",
        borderRadius: "14px 14px 0 0",
        background: "linear-gradient(180deg,rgba(255,255,255,0.07) 0%,transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* Green flash — login success confirmation */}
      <motion.div
        animate={{ opacity: loginSuccess ? 1 : 0 }}
        transition={{ duration: loginSuccess ? 0.15 : 0.5 }}
        style={{
          position: "absolute", inset: 0, borderRadius: 14,
          background: `radial-gradient(ellipse at 60% 50%, ${flash} 0%, transparent 70%)`,
          pointerEvents: "none", zIndex: 10,
        }}
      />

      {/* ── Label ─────────────────────────────────────────────────────────── */}
      <motion.span
        animate={{ opacity: doorIsOpen ? 0.38 : 1, x: doorIsOpen ? -4 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          color: c.text, fontSize: 14, fontWeight: 600,
          letterSpacing: "0.015em", userSelect: "none",
          pointerEvents: "none", zIndex: 1,
        }}
      >
        {finalLabel}
      </motion.span>

      {/* ── Character ─────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        display: "flex", alignItems: "center",
        pointerEvents: "none", zIndex: 2,
      }}>
        <motion.div style={{ x: charX, opacity: charAlpha }}>
          {/* scaleX flips char for login (faces left); rotate leans forward in both cases */}
          <motion.div
            animate={{
              rotate:  isCharRunning ? 10 : 0,
              scaleX:  charFacesRight ? 1 : -1,
            }}
            transition={SP_BOUNCY}
          >
            <svg width={14} height={22} viewBox="0 0 14 22" fill="none">
              <motion.ellipse cx={7} cy={3.6} rx={2.8}
                animate={{
                  ry: isCharRunning ? [2.3, 3.1, 2.3] : [2.8, 3.2, 2.8],
                  cy: phase === "idle" ? [3.6, 3.1, 3.6] : 3.6,
                }}
                transition={{
                  duration: isCharRunning ? 0.17 : 1.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                fill={c.char}
              />
              <line x1={7} y1={6.4} x2={7} y2={13.5} stroke={c.char} strokeWidth={1.9} strokeLinecap="round" />
              <motion.g style={{ transformOrigin: "7px 9px", rotate: leftArmRot }}>
                <line x1={7} y1={9} x2={2.5} y2={12.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" />
              </motion.g>
              <motion.g style={{ transformOrigin: "7px 9px", rotate: rightArmRot }}>
                <line x1={7} y1={9} x2={11.5} y2={12.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" />
              </motion.g>
              <motion.g style={{ transformOrigin: "7px 13.5px", rotate: leftLegRot }}>
                <line x1={7} y1={13.5} x2={4} y2={20.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" />
              </motion.g>
              <motion.g style={{ transformOrigin: "7px 13.5px", rotate: rightLegRot }}>
                <line x1={7} y1={13.5} x2={10} y2={20.5} stroke={c.char} strokeWidth={1.4} strokeLinecap="round" />
              </motion.g>
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Falling character (logout only) ───────────────────────────────── */}
      {!isLogin && (
        <motion.div style={{
          position: "absolute", left: FALL_L, top: FALL_T,
          y: fallingCharY, opacity: fallingCharAlpha,
          pointerEvents: "none", zIndex: 4,
        }}>
          <FallingChar color={c.char} flailing={charFlailing} />
        </motion.div>
      )}

      {/* ── Door ──────────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", right: DOOR_MARGIN, top: "50%",
        transform: "translateY(-50%)",
        width: DW, height: DH, zIndex: 3,
      }}>
        {/* Dark shaft */}
        <div style={{ position: "absolute", inset: "2px", borderRadius: 2 }}>
          <motion.div
            animate={{ opacity: doorIsOpen ? 1 : 0 }}
            transition={{ duration: 0.22 }}
            style={{
              position: "absolute", inset: 0, borderRadius: 2,
              background: "linear-gradient(180deg,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0.95) 100%)",
            }}
          />
        </div>
        {/* Door panel */}
        <div style={{ perspective: 68, position: "absolute", inset: "2px", zIndex: 3 }}>
          <motion.div
            animate={{ rotateY: doorIsOpen ? -86 : 0 }}
            transition={SP_HEAVY}
            style={{
              position: "absolute", inset: 0,
              background: c.doorFill, borderRadius: 2,
              transformOrigin: "left center",
            }}
          />
        </div>
        {/* Frame */}
        <motion.div
          animate={{ borderColor: isHovered ? c.doorHover : c.doorBorder }}
          transition={{ duration: 0.35 }}
          style={{
            position: "absolute", inset: 0, borderRadius: 3,
            border: `1.5px solid ${c.doorBorder}`,
            pointerEvents: "none", zIndex: 4,
          }}
        />
        {/* Knob */}
        <motion.div
          animate={{ x: doorIsOpen ? -7 : 0, opacity: doorIsOpen ? 0.12 : 1 }}
          transition={SP_BOUNCY}
          style={{
            position: "absolute", right: 3, top: "50%",
            width: 3, height: 3, borderRadius: "50%",
            background: c.doorBorder, transform: "translateY(-50%)", zIndex: 5,
          }}
        />
        {/* Glow */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.7 }}
          transition={{ duration: 0.45 }}
          style={{
            position: "absolute", inset: -6, borderRadius: 8, pointerEvents: "none",
            background: `radial-gradient(ellipse at center,${c.glow} 0%,transparent 68%)`,
          }}
        />
      </div>
    </motion.button>
  );
}
