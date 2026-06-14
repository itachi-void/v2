import { motion } from "motion/react";
import type { ReactNode } from "react";
import { staggerContainer, fadeInUp, scaleIn, viewportOnce } from "@/app/constants/motion";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  /** Reveal on scroll into view (default) or immediately on mount. */
  onView?: boolean;
}

/** Container that staggers the entrance of its <StaggerItem> children. */
export function Stagger({ children, className, stagger = 0.06, delayChildren = 0, onView = true }: StaggerProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      {...(onView ? { whileInView: "show", viewport: viewportOnce } : { animate: "show" })}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  variant?: "up" | "scale";
}

export function StaggerItem({ children, className, variant = "up" }: StaggerItemProps) {
  return (
    <motion.div className={className} variants={variant === "scale" ? scaleIn : fadeInUp}>
      {children}
    </motion.div>
  );
}
