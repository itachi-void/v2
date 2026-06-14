import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  /** Seconds. Tied to the hero/slow token by default. */
  durationSec?: number;
  prefix?: string;
  suffix?: string;
  /** Decimal places to preserve. */
  decimals?: number;
  className?: string;
  /** Trigger when scrolled into view rather than on mount. */
  onView?: boolean;
}

/**
 * Counts up to `value` with an easeOutExpo curve — the same decisive feel
 * as the rest of the motion system. Respects prefers-reduced-motion.
 */
export function AnimatedNumber({
  value,
  durationSec = 1.4,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  onView = true,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (onView && !inView) return;

    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let start = 0;
    const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
    const tick = (t: number) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / (durationSec * 1000), 1);
      setDisplay(easeOutExpo(progress) * value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationSec, inView, onView]);

  const formatted = display.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
