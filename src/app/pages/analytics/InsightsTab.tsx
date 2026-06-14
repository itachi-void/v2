import { motion } from "motion/react";
import {
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Leaf,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { tooltipStyle } from "@/app/utils/chartTheme";
import { GlassCard } from "@/app/components/GlassCard";
import ChartCard from "./shared/ChartCard";
import { predictiveData } from "./shared/data";

const CHART_HEIGHT = 300;

const anomalies = [
  {
    severity: "high" as const,
    title: "Drop in West region collections",
    detail: "Volume fell 22% below 14-day baseline. Possible route disruption.",
  },
  {
    severity: "medium" as const,
    title: "Spike in maintenance alerts",
    detail: "3 vehicles flagged within 2 hours — investigate fleet age.",
  },
  {
    severity: "low" as const,
    title: "Off-peak pickup surge",
    detail: "Friday evening pickups +14% vs trend. Likely event-driven.",
  },
];

const opportunities = [
  {
    Icon: TrendingUp,
    title: "Expand Central capacity",
    body: "Central region runs at 92% utilization. Adding 2 drivers projects +14% throughput.",
    impact: "+14% throughput",
  },
  {
    Icon: Lightbulb,
    title: "Consolidate low-volume routes",
    body: "Routes 9 and 14 average <40% capacity. Merging saves ~6 fuel hours/week.",
    impact: "Save 6h/week",
  },
  {
    Icon: Leaf,
    title: "Switch HDPE supplier",
    body: "Vendor B pricing 9% lower with equivalent recycling rates.",
    impact: "Save $2.1K/mo",
  },
];

const recommendations = [
  "Pre-position 2 trucks at Central Hub before Q1 surge (AI projects +17.3%).",
  "Schedule maintenance for VEH-104 within 5 days based on fuel-efficiency drift.",
  "Run sustainability campaign in North to lift recycling rate (-3.2% MoM).",
];

const sustainability = [
  { label: "CO₂ Saved", value: "412 t", delta: "+8% MoM", tone: "emerald" },
  { label: "Plastic Diverted", value: "98,420 kg", delta: "+11% MoM", tone: "sky" },
  { label: "Energy Recovered", value: "1.4 GWh", delta: "+4% MoM", tone: "amber" },
  { label: "Water Saved", value: "62 ML", delta: "+6% MoM", tone: "violet" },
];

const severityTone: Record<"high" | "medium" | "low", string> = {
  high: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
  medium: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  low: "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300",
};

const sustainTone: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

export default function InsightsTab() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-6">
      <ChartCard
        Icon={Zap}
        title="Predictive Forecast"
        subtitle="3-month projection based on historical trends"
        bodyHeight={CHART_HEIGHT}
        action={
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300" style={{ fontWeight: 700 }}>
            <Sparkles className="w-3.5 h-3.5" />
            +17.3% projected
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <ComposedChart data={predictiveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle(isDark)} />
            <Legend />
            <Bar dataKey="collections" name="Collections" fill="#10b981" radius={[4, 4, 0, 0]} barSize={26} />
            <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="5 5" />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          Icon={AlertTriangle}
          iconClass="text-rose-600 dark:text-rose-400"
          title="Anomaly Detection"
          subtitle="Unusual patterns from the last 14 days"
        >
          <div className="space-y-2.5">
            {anomalies.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 rounded-2xl border ${severityTone[a.severity]}`}
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm" style={{ fontWeight: 700 }}>
                        {a.title}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider opacity-75" style={{ fontWeight: 700 }}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 opacity-90">{a.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          Icon={Lightbulb}
          iconClass="text-amber-500"
          title="Opportunities"
          subtitle="Improvements ranked by impact"
        >
          <div className="space-y-2.5">
            {opportunities.map((o, i) => {
              const Icon = o.Icon;
              return (
                <motion.div
                  key={o.title}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
                          {o.title}
                        </p>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shrink-0" style={{ fontWeight: 700 }}>
                          {o.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{o.body}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      <ChartCard
        Icon={Leaf}
        iconClass="text-emerald-600 dark:text-emerald-400"
        title="Sustainability Impact"
        subtitle="Environmental contribution this period"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sustainability.map((s) => (
            <div key={s.label} className={`p-4 rounded-2xl ${sustainTone[s.tone]}`}>
              <p className="text-xs opacity-80">{s.label}</p>
              <p className="text-2xl mt-1 tabular-nums" style={{ fontWeight: 700 }}>
                {s.value}
              </p>
              <p className="text-[11px] mt-1" style={{ fontWeight: 600 }}>
                {s.delta}
              </p>
            </div>
          ))}
        </div>
      </ChartCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            Recommended Actions
          </h3>
        </div>
        <ul className="space-y-2">
          {recommendations.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10"
            >
              <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-200">{r}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
