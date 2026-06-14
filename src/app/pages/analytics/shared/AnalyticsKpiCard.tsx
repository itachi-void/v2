import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";

interface Props {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  Icon: LucideIcon;
  accent?: string;
  delay?: number;
  onClick?: () => void;
}

export default function AnalyticsKpiCard({
  title,
  value,
  change,
  trend = "up",
  Icon,
  accent = "emerald",
  delay = 0,
  onClick,
}: Props) {
  const tone = accentMap[accent] || accentMap.emerald;
  const isUp = trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
    >
      <GlassCard
        as={onClick ? "button" : "div"}
        onClick={onClick}
        className={`p-5 w-full text-left ${onClick ? "cursor-pointer hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-shadow" : ""}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${tone.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${tone.fg}`} />
          </div>
          {change && (
            <div
              className={`flex items-center gap-0.5 text-xs ${
                isUp
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
              style={{ fontWeight: 700 }}
            >
              {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {change}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
        <p
          className="text-[26px] leading-none tracking-tight text-slate-900 dark:text-white mt-1.5 tabular-nums"
          style={{ fontWeight: 700 }}
        >
          {value}
        </p>
      </GlassCard>
    </motion.div>
  );
}
