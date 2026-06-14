import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";

interface Props {
  Icon: LucideIcon;
  iconClass?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Fixed chart body height so all chart cards align. */
  bodyHeight?: number;
}

export default function ChartCard({
  Icon,
  iconClass = "text-emerald-600 dark:text-emerald-400",
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyHeight,
}: Props) {
  return (
    <GlassCard className={`p-6 h-full flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
            <Icon className={`w-4 h-4 ${iconClass}`} />
          </div>
          <div className="min-w-0">
            <h3
              className="text-sm tracking-tight text-slate-900 dark:text-white truncate"
              style={{ fontWeight: 700 }}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="flex-1" style={bodyHeight ? { minHeight: bodyHeight } : undefined}>
        {children}
      </div>
    </GlassCard>
  );
}
