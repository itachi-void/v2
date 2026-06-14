import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  iconColor?: string;
  className?: string;
}

export default function EmptyState({
  Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  iconColor = "text-emerald-600 dark:text-emerald-400",
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl flex flex-col items-center justify-center text-center p-10 md:p-14 gap-3 min-h-[400px] ${className}`}
    >
      <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
        <Icon className={`w-10 h-10 ${iconColor}`} />
      </div>
      <h3
        className="text-xl tracking-tight text-slate-900 dark:text-white"
        style={{ fontWeight: 600 }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">{description}</p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-5 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full text-sm hover:bg-white dark:hover:bg-white/10 transition-colors"
              style={{ fontWeight: 600 }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
