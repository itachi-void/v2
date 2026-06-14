import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, animate } from "motion/react";

// ─── Layout ───────────────────────────────────────────────────────────────────
const BW          = 190;
const BH          = 52;
const ICON_D      = 22;
const ICON_MARGIN = 14;
const CS          = 20;
const CE          = BW - ICON_MARGIN - ICON_D - 4;

const RING_R = 8;
const RING_C = 2 * Math.PI * RING_R;

const SP_SNAPPY = { type: "spring", stiffness: 520, damping: 30 } as const;
const SP_BOUNCY = { type: "spring", stiffness: 320, damping: 20 } as const;
const SP_NUDGE  = { type: "spring", stiffness: 88,  damping: 15 } as const;
const SP_JUMP   = { type: "spring", stiffness: 300, damping: 18 } as const;

const T = {
  dark: {
    bg:         "linear-gradient(148deg,#1c1c2e 0%,#242438 100%)",
    border:     "rgba(255,255,255,0.08)",
    text:       "rgba(255,255,255,0.92)",
    char:       "rgba(255,255,255,0.90)",
    iconBg:     "rgba(34,211,238,0.12)",
    iconBorder: "rgba(34,211,238,0.40)",
    accent:     "#22d3ee",
    success:    "#4ade80",
    glow:       "rgba(34,211,238,0.25)",
    shadow:     "rgba(0,0,0,0.32)",
  },
  light: {
    bg:         "linear-gradient(148deg,#f5f5fd 0%,#eeeef8 100%)",
    border:     "rgba(0,0,0,0.07)",
    text:       "rgba(18,18,42,0.90)",
    char:       "rgba(22,22,52,0.82)",
    iconBg:     "rgba(14,165,233,0.10)",
    iconBorder: "rgba(14,165,233,0.38)",
    accent:     "#0ea5e9",
    success:    "#16a34a",
    glow:       "rgba(14,165,233,0.20)",
    shadow:     "rgba(0,0,0,0.12)",
  },
} as const;

type Phase = "idle" | "loading" | "success";

export default function PremiumDownloadButton({
  theme = "dark",
  onDownload,
}: {
  theme?: "dark" | "light";
  onDownload?: () => void;
}) {
  const c = T[theme];

  const [phase,         setPhase]         = useState<Phase>("idle");
  const [progress,      setProgress]      = useState(0);
  const [isHovered,     setIsHovered]     = useState(false);
  const [isSprinting,   setIsSprinting]   = useState(false);
  const [isWorking,     setIsWorking]     = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const timers      = useRef<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const charX     = useMotionValue(CS);
  const charY     = useMotionValue(0);
  const charAlpha = useMotionValue(1);
  const btnScale  = useSpring(1, SP_SNAPPY);
  const btnY      = useMotionValue(0);

  const leftArmRot  = useMotionValue(0);
  const rightArmRot = useMotionValue(0);
  const leftLegRot  = useMotionValue(0);
  const rightLegRot = useMotionValue(0);

  useEffect(() => {
    if (!isSprinting) return;
    const c1 = animate(leftArmRot,  [ 30,-30], { repeat: Infinity, repeatType: "mirror", duration: 0.17, ease: "easeInOut" });
    const c2 = animate(rightArmRot, [-30, 30], { repeat: Infinity, repeatType: "mirror", duration: 0.17, ease: "easeInOut" });
    const c3 = animate(leftLegRot,  [-36, 36], { repeat: Infinity, repeatType: "mirror", duration: 0.17, ease: "easeInOut" });
    const c4 = animate(rightLegRot, [ 36,-36], { repeat: Infinity, repeatType: "mirror", duration: 0.17, ease: "easeInOut" });
    return () => { c1.stop(); c2.stop(); c3.stop(); c4.stop(); };
  }, [isSprinting]);

  useEffect(() => {
    if (!isWorking) return;
    const c1 = animate(leftArmRot,  [-38, 8], { repeat: Infinity, repeatType: "mirror", duration: 0.45, ease: "easeInOut" });
    const c2 = animate(rightArmRot, [ 38,-8], { repeat: Infinity, repeatType: "mirror", duration: 0.45, ease: "easeInOut" });
    return () => { c1.stop(); c2.stop(); };
  }, [isWorking]);

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
    charX.set(CS); charY.set(0); charAlpha.set(1);
    setIsSprinting(false); setIsWorking(false); setIsCelebrating(false);
    setProgress(0); resetLimbs();
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const onHoverStart = () => {
    if (phase !== "idle") return;
    setIsHovered(true);
    btnScale.set(1.03);
    animate(charX, CS + 10, SP_NUDGE);
    animate(leftArmRot,  [0,  22, 0], { duration: 0.46, ease: "easeInOut" });
    animate(rightArmRot, [0, -22, 0], { duration: 0.46, ease: "easeInOut" });
    animate(leftLegRot,  [0, -28, 0], { duration: 0.46, ease: "easeInOut" });
    animate(rightLegRot, [0,  28, 0], { duration: 0.46, ease: "easeInOut" });
  };

  const onHoverEnd = () => {
    if (phase !== "idle") return;
    setIsHovered(false);
    btnScale.set(1);
    animate(charX, CS, SP_NUDGE);
    resetLimbs();
  };

  const handleClick = () => {
    if (phase !== "idle") return;
    clearT(); resetAll(); setIsHovered(false);
    setPhase("loading"); btnScale.set(0.96);

    sched([
      [() => {
        btnScale.set(1);
        setIsSprinting(true);
        animate(charX, CE, { duration: 0.30, ease: [0.22, 0, 0.6, 1] });
      }, 75],
      [() => {
        setIsSprinting(false);
        setIsWorking(true);
        let p = 0;
        intervalRef.current = setInterval(() => {
          p = Math.min(100, p + 1);
          setProgress(p);
          if (p >= 100) { clearInterval(intervalRef.current!); intervalRef.current = null; }
        }, 20);
      }, 430],
      [() => {
        setIsWorking(false);
        setIsCelebrating(true);
        setPhase("success");
        animate(leftArmRot,  -52, { duration: 0.18 });
        animate(rightArmRot,  52, { duration: 0.18 });
        animate(charY, -9, { duration: 0.14, ease: "easeOut" });
        onDownload?.();
      }, 2460],
      [() => { animate(charY, 0, SP_JUMP); btnScale.set(1.06); }, 2620],
      [() => { btnScale.set(1); }, 2820],
      [() => {
        animate(leftArmRot,  0, { duration: 0.35 });
        animate(rightArmRot, 0, { duration: 0.35 });
        setIsCelebrating(false);
      }, 3200],
      [() => { setPhase("idle"); animate(charX, CS, SP_NUDGE); }, 3800],
      [() => { resetAll(); }, 4400],
    ]);
  };

  useEffect(() => () => {
    clearT();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const isLoading = phase === "loading";
  const isSuccess = phase === "success";
  const ringDashoffset = RING_C * (1 - progress / 100);
  const label      = isLoading ? `${progress}%` : isSuccess ? "Done!" : "Download";
  const labelColor = isLoading ? c.accent : isSuccess ? c.success : c.text;

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
        width: BW, height: BH, scale: btnScale, y: btnY,
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 14, border: `1px solid ${c.border}`, background: c.bg,
        cursor: phase === "idle" ? "pointer" : "default", overflow: "visible",
        userSelect: "none", outline: "none", WebkitTapHighlightColor: "transparent", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "44%",
        borderRadius: "14px 14px 0 0",
        background: "linear-gradient(180deg,rgba(255,255,255,0.07) 0%,transparent 100%)",
        pointerEvents: "none",
      }} />
      <motion.span
        animate={{ x: (isLoading || isSuccess) ? -4 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          color: labelColor, fontSize: 14, fontWeight: 600, letterSpacing: "0.015em",
          userSelect: "none", pointerEvents: "none", zIndex: 1,
          minWidth: 64, textAlign: "center", transition: "color 0.25s ease",
        }}
      >
        {label}
      </motion.span>
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 2,
      }}>
        <motion.div style={{ x: charX, y: charY, opacity: charAlpha }}>
          <motion.div animate={{ rotate: isSprinting ? 10 : 0 }} transition={SP_BOUNCY}>
            <svg width={14} height={22} viewBox="0 0 14 22" fill="none">
              <motion.ellipse cx={7} cy={3.6} rx={2.8}
                animate={{ ry: isSprinting ? [2.3,3.1,2.3] : [2.8,3.2,2.8], cy: phase === "idle" ? [3.6,3.1,3.6] : 3.6 }}
                transition={{ duration: isSprinting ? 0.17 : 1.9, repeat: Infinity, ease: "easeInOut" }}
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
      <div style={{
        position: "absolute", right: ICON_MARGIN, top: "50%",
        transform: "translateY(-50%)", width: ICON_D, height: ICON_D, zIndex: 3,
      }}>
        {!isLoading && !isSuccess && (
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            background: c.iconBg, border: `1.5px solid ${c.iconBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isHovered ? `0 0 10px ${c.glow}` : "none", transition: "box-shadow 0.3s ease",
          }}>
            <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
              <line x1={5.5} y1={1} x2={5.5} y2={8} stroke={c.accent} strokeWidth={1.6} strokeLinecap="round" />
              <path d="M2.5 5.5 L5.5 8.5 L8.5 5.5" stroke={c.accent} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {isLoading && (
          <svg width={ICON_D} height={ICON_D} viewBox={`0 0 ${ICON_D} ${ICON_D}`}>
            <circle cx={ICON_D/2} cy={ICON_D/2} r={RING_R} fill="none" stroke={`${c.accent}28`} strokeWidth={2} />
            <circle cx={ICON_D/2} cy={ICON_D/2} r={RING_R} fill="none" stroke={c.accent} strokeWidth={2}
              strokeLinecap="round" strokeDasharray={RING_C} strokeDashoffset={ringDashoffset}
              transform={`rotate(-90 ${ICON_D/2} ${ICON_D/2})`} style={{ transition: "stroke-dashoffset 0.08s linear" }}
            />
          </svg>
        )}
        {isSuccess && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: `${c.success}1a`, border: `1.5px solid ${c.success}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
              <path d="M1.5 5.5 L4.5 8.5 L9.5 2.5" stroke={c.success} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.7 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute", inset: -5, borderRadius: "50%", pointerEvents: "none",
            background: `radial-gradient(ellipse at center,${c.glow} 0%,transparent 70%)`,
          }}
        />
      </div>
    </motion.button>
  );
}
