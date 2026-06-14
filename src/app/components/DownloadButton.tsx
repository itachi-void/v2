import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, Check } from "lucide-react";

const SIZE   = 72;
const RING_R = 28;
const CIRC   = 2 * Math.PI * RING_R; // ≈ 175.9

// Dot journey in unrotated SVG coords (ring top = SIZE/2 - RING_R = 8)
const DOT_START = SIZE / 2 - RING_R - 22; // above button: -14
const DOT_HIT   = SIZE / 2 - RING_R;       // ring top: 8
const DOT_BOUNCE = SIZE / 2 - RING_R - 14; // bounced up: -6
const DOT_END   = SIZE / 2 - RING_R - 24;  // fades here: -16
const DOT_DUR   = 0.88;                     // seconds
const AFTER_DOT = 920;                      // ms before counter starts

type Phase = "idle" | "downloading" | "done";

// ─── Seamless looping wave ────────────────────────────────────────────────────
// Path starts one full period (-14) BEFORE the visible window so the wave
// fills edge-to-edge at all animation frames. overflow="hidden" clips cleanly.
function WaveLine() {
  return (
    <svg width={34} height={10} viewBox="0 0 68 10" style={{ overflow: "hidden" }}>
      <motion.path
        d="M-14 5 C-9 1 -5 9 0 5 C5 1 9 9 14 5 C19 1 23 9 28 5 C33 1 37 9 42 5 C47 1 51 9 56 5 C61 1 65 9 70 5 C75 1 79 9 84 5 C89 1 93 9 98 5"
        fill="none"
        stroke="#22d3ee"
        strokeWidth={1.6}
        strokeLinecap="round"
        animate={{ x: [0, -14] }}
        transition={{ repeat: Infinity, duration: 0.55, ease: "linear" }}
        style={{ opacity: 0.7 }}
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DownloadButton() {
  const [phase,   setPhase]   = useState<Phase>("idle");
  const [pct,     setPct]     = useState(0);
  const [dotDone, setDotDone] = useState(false); // true after dot animation finishes

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetRef    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const dotRef      = useRef<ReturnType<typeof setTimeout>  | null>(null);

  function handleClick() {
    if (phase !== "idle") return;
    setPhase("downloading");
    setDotDone(false);
    setPct(0);

    // Wait for dot to fall, hit ring, bounce, and disappear — then start counter + wave
    dotRef.current = setTimeout(() => {
      setDotDone(true);
      let p = 0;
      intervalRef.current = setInterval(() => {
        p = Math.min(100, p + 1);
        setPct(p);
        if (p >= 100) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setPhase("done");
          setDotDone(false);
          resetRef.current = setTimeout(() => {
            setPhase("idle");
            setPct(0);
          }, 2200);
        }
      }, 20);
    }, AFTER_DOT);
  }

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (resetRef.current)    clearTimeout(resetRef.current);
    if (dotRef.current)      clearTimeout(dotRef.current);
  }, []);

  const strokeDash = CIRC * (1 - pct / 100);
  const isDown = phase === "downloading";
  const isDone = phase === "done";

  return (
    <motion.button
      onClick={handleClick}
      whileHover={phase === "idle" ? { scale: 1.07 } : {}}
      whileTap={phase  === "idle" ? { scale: 0.93 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      style={{
        width: SIZE, height: SIZE,
        borderRadius: "50%",
        background: "#0c1525",
        border: "none",
        cursor: phase === "idle" ? "pointer" : "default",
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 0 1px rgba(34,211,238,0.14), 0 10px 28px rgba(0,0,0,0.45)",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* ── SVG ring ────────────────────────────────────────────────────────── */}
      {/*
        SVG is NOT rotated globally — rotation lives inside <g> so we can place
        the falling dot in normal (upright) screen coordinates above the button.
        overflow="visible" lets the dot appear above the SVG's bounding box.
      */}
      <svg
        width={SIZE} height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        overflow="visible"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          {/* Dot glow */}
          <filter id="dotglow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Arc-tip glow */}
          <filter id="tipglow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* ✨ Comet-tail gradient: cyan at bottom → transparent at top */}
          <linearGradient id="cometGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* ── Ring group — rotated so arc starts from 12 o'clock ──────────── */}
        <g style={{ transformOrigin: `${SIZE/2}px ${SIZE/2}px`, transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={SIZE/2} cy={SIZE/2} r={RING_R}
            fill="none" stroke="rgba(34,211,238,0.10)" strokeWidth={3} />

          {/* ✨ Idle: dual-ring halo — two rings pulsing in opposite phase */}
          {!isDown && !isDone && (
            <>
              <motion.circle cx={SIZE/2} cy={SIZE/2} r={RING_R}
                fill="none" stroke="#22d3ee" strokeWidth={2.5}
                animate={{ strokeOpacity: [0.22, 0.48, 0.22] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              />
              <motion.circle cx={SIZE/2} cy={SIZE/2} r={RING_R + 5}
                fill="none" stroke="#22d3ee" strokeWidth={1}
                animate={{ strokeOpacity: [0.14, 0.05, 0.14] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 1.1 }}
              />
            </>
          )}

          {/* Downloading: clockwise fill */}
          {isDown && dotDone && (
            <circle cx={SIZE/2} cy={SIZE/2} r={RING_R}
              fill="none" stroke="#22d3ee" strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={strokeDash}
              style={{ transition: "stroke-dashoffset 0.06s linear" }}
            />
          )}

          {/* ✨ Done: ring fill + brief bright flash on completion */}
          {isDone && (
            <>
              <motion.circle cx={SIZE/2} cy={SIZE/2} r={RING_R}
                fill="none" stroke="#22d3ee" strokeWidth={3}
                strokeDasharray={CIRC} strokeDashoffset={0}
                initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
              <motion.circle cx={SIZE/2} cy={SIZE/2} r={RING_R}
                fill="none" stroke="#22d3ee" strokeWidth={7}
                initial={{ strokeOpacity: 0.55 }}
                animate={{ strokeOpacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.30 }}
              />
            </>
          )}
        </g>

        {/* ✨ Arc-tip glow — bright dot rides leading edge while filling */}
        {isDown && dotDone && pct > 0 && pct < 100 && (
          <circle
            cx={SIZE/2 + RING_R * Math.sin((pct / 100) * Math.PI * 2)}
            cy={SIZE/2 - RING_R * Math.cos((pct / 100) * Math.PI * 2)}
            r={3.2}
            fill="#22d3ee"
            filter="url(#tipglow)"
            opacity={0.92}
          />
        )}

        {/* ✨ Static wave-line — pulses gently while dot is airborne */}
        {isDown && !dotDone && (
          <motion.line
            x1={SIZE/2 - 17} y1={26}
            x2={SIZE/2 + 17} y2={26}
            stroke="#22d3ee"
            strokeWidth={1.5}
            strokeLinecap="round"
            animate={{ strokeOpacity: [0.30, 0.68, 0.30] }}
            transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
          />
        )}

        {/* ── Falling dot + effects ─────────────────────────────────────────── */}
        {isDown && !dotDone && (
          <>
            {/* ✨ Comet tail — gradient rect that trails above the dot */}
            <motion.rect
              x={SIZE/2 - 1.5}
              y={0}
              width={3}
              height={18}
              rx={1.5}
              fill="url(#cometGrad)"
              initial={{ y: -34, opacity: 0.9 }}
              animate={{
                y:       [-34,  8,   -5,  -16],
                opacity: [0.9,  0,    0,    0 ],
              }}
              transition={{
                y:       { duration: DOT_DUR, times: [0, 0.46, 0.76, 1.0], ease: ["easeIn","easeOut","easeIn"] },
                opacity: { duration: DOT_DUR, times: [0, 0.46, 0.60, 1.0], ease: "linear" },
              }}
            />

            {/* ✨ Dot — elongates during fall, squash & stretch on impact */}
            <motion.circle
              cx={SIZE / 2}
              r={3.5}
              fill="#22d3ee"
              filter="url(#dotglow)"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              initial={{ cy: -16, opacity: 1, scaleX: 1, scaleY: 1 }}
              animate={{
                cy:     [-16,  -16,  26,    13,  2 ],
                scaleX: [1,    0.75, 1.75,  1,   1 ],  // narrows while falling, widens at impact
                scaleY: [1,    1.65, 0.42,  1,   1 ],  // elongates while falling, squashes at impact
                opacity:[1,    1,    1,     1,   0 ],
              }}
              transition={{
                cy:     { duration: DOT_DUR, times: [0, 0.0, 0.46, 0.76, 1.0], ease: ["easeIn","easeIn","easeOut","easeIn"] },
                scaleX: { duration: DOT_DUR, times: [0, 0.30, 0.46, 0.58, 1.0], ease: "easeOut" },
                scaleY: { duration: DOT_DUR, times: [0, 0.30, 0.46, 0.58, 1.0], ease: "easeOut" },
                opacity:{ duration: DOT_DUR, times: [0, 0.0,  0.72, 0.88, 1.0], ease: "linear" },
              }}
            />

            {/* ✨ Horizontal energy smear — kinetic energy disperses sideways */}
            <motion.line
              x1={SIZE/2 - 8} y1={26}
              x2={SIZE/2 + 8} y2={26}
              stroke="#22d3ee"
              strokeWidth={1.4}
              strokeLinecap="round"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 0, 2.6, 0], opacity: [0, 0, 0.85, 0] }}
              transition={{ duration: DOT_DUR, times: [0, 0.44, 0.54, 0.72], ease: "easeOut" }}
            />

            {/* Ripple 1 — fast, tight */}
            <motion.circle
              cx={SIZE / 2} cy={26} r={4}
              fill="none" stroke="#22d3ee" strokeWidth={1.5}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 0, 2.0, 0], opacity: [0, 0, 0.80, 0] }}
              transition={{ duration: DOT_DUR, times: [0, 0.44, 0.57, 0.78], ease: "easeOut" }}
            />

            {/* Ripple 2 — wider, slower */}
            <motion.circle
              cx={SIZE / 2} cy={26} r={4}
              fill="none" stroke="#22d3ee" strokeWidth={0.85}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 0, 3.0, 0], opacity: [0, 0, 0.42, 0] }}
              transition={{ duration: DOT_DUR, times: [0, 0.50, 0.69, 0.94], ease: "easeOut" }}
            />
          </>
        )}
      </svg>

      {/* ── Content (AnimatePresence for smooth state transitions) ─────────── */}
      <AnimatePresence mode="wait">
        {/* Idle: arrow */}
        {!isDown && !isDone && (
          <motion.div key="idle"
            initial={{ opacity: 0, y: 8, scale: 0.75 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.75 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
          >
            <ArrowDown size={24} color="#22d3ee" strokeWidth={2.3} />
          </motion.div>
        )}

        {/* Downloading: counter + wave — appear only after dot lands */}
        {isDown && dotDone && (
          <motion.div key="downloading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.22 }}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4,
            }}
          >
            <WaveLine />
            <span style={{
              color: "#22d3ee", fontSize: 14, fontWeight: 700,
              fontVariantNumeric: "tabular-nums", lineHeight: 1,
              letterSpacing: "-0.02em",
            }}>
              {pct}%
            </span>
          </motion.div>
        )}

        {/* Done: checkmark + flash */}
        {isDone && (
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            style={{ position: "relative" }}
          >
            <Check size={24} color="#22d3ee" strokeWidth={2.5} />
            {/* Glow flash */}
            <motion.div
              initial={{ opacity: 0.9, scale: 0.4 }}
              animate={{ opacity: 0, scale: 2.4 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{
                position: "absolute", inset: -12,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(34,211,238,0.45) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
