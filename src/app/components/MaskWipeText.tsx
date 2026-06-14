import { motion } from "motion/react";

/**
 * MaskWipeText — premium left-to-right reveal (Apple / Stripe style).
 *
 * The text stays static while a clip mask wipes across it from left to right,
 * uncovering it cleanly. No per-character or per-word churn — one calm sweep.
 */
export function MaskWipeText({
  text,
  className = "",
  delay = 0.35,
  duration = 1,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      transition={{ delay, duration, ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </motion.span>
  );
}

export default MaskWipeText;
