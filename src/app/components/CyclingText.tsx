import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * CyclingText — calm phrase rotator.
 *
 * Crossfades between phrases with a soft blur + slide. No per-character churn,
 * just one clean reveal per phrase on a gentle Stripe/Linear easing curve.
 */
export function CyclingText({
  texts,
  interval = 2600,
  className = "text-emerald-600",
}: {
  texts: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((p) => (p + 1) % texts.length),
      interval,
    );
    return () => window.clearInterval(id);
  }, [texts, interval]);

  return (
    <span className="relative inline-block align-bottom">
      {/* keeps layout height stable while phrases swap */}
      <span className="invisible whitespace-nowrap">{texts[index]}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          className={`absolute inset-0 whitespace-nowrap ${className}`}
          initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default CyclingText;
