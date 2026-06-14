import { LucideIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  accent?: string;
  bullets?: string[];
}

export default function PlaceholderPage({
  title,
  subtitle,
  Icon,
  accent = "emerald",
  bullets = [],
}: PlaceholderPageProps) {
  const a = accentMap[accent] ?? accentMap.emerald;

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${a.fg}`} />
          </div>
          <div>
            <h1
              className="text-3xl tracking-tight text-slate-900 dark:text-white"
              style={{ fontWeight: 700 }}
            >
              {title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${a.bg} ${a.fg} text-xs`}
          style={{ fontWeight: 600 }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Coming soon
        </div>
      </motion.div>

      {bullets.length > 0 && (
        <GlassCard className="p-6">
          <ul className="space-y-3">
            {bullets.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${a.fg}`} />
                <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {b}
                </span>
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
