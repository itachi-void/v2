import { motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeInUp, viewportOnce, ease, duration } from "@/app/constants/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger order within a parent list. */
  delay?: number;
  /** Vertical travel distance; kept small by default. */
  y?: number;
  as?: "div" | "section" | "li" | "span";
}

/**
 * Scroll-triggered reveal using the shared motion tokens.
 * Subtle rise + fade, fires once as it enters the viewport.
 */
export function Reveal({ children, className, delay = 0, y, as = "div" }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={
        y == null
          ? fadeInUp
          : {
              hidden: { opacity: 0, y },
              show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.standard, delay } },
            }
      }
      transition={y == null ? { delay } : undefined}
    >
      {children}
    </Tag>
  );
}
