import { motion } from "motion/react";
import {
  Package,
  DollarSign,
  Users,
  Recycle,
  MapPin,
  Clock,
  LineChart as LineIcon,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { useRoleContext } from "@/contexts/RoleContext";
import { tooltipStyle } from "@/app/utils/chartTheme";
import { GlassCard } from "@/app/components/GlassCard";
import AnalyticsKpiCard from "./shared/AnalyticsKpiCard";
import ChartCard from "./shared/ChartCard";
import { monthlyData, rangeMonths, TimeRange } from "./shared/data";

interface Props {
  timeRange: TimeRange;
}

const CHART_HEIGHT = 280;

export default function OverviewTab({ timeRange }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { currentRole } = useRoleContext();

  const displayed = monthlyData.slice(-rangeMonths[timeRange]);

  const kpis = [
    { title: "Total Collections", value: "85,240", change: "+12.5%", trend: "up" as const, Icon: Package, accent: "emerald" },
    ...(currentRole === "admin"
      ? [{ title: "Total Revenue", value: "$170.4K", change: "+18.2%", trend: "up" as const, Icon: DollarSign, accent: "teal" }]
      : []),
    { title: "Active Users", value: "12,456", change: "+8.7%", trend: "up" as const, Icon: Users, accent: "violet" },
    { title: "Recycling Rate", value: "96.4%", change: "+2.1%", trend: "up" as const, Icon: Recycle, accent: "lime" },
    { title: "Active Routes", value: "234", change: "-3.2%", trend: "down" as const, Icon: MapPin, accent: "amber" },
    { title: "Avg Response", value: "2.4h", change: "-15.3%", trend: "up" as const, Icon: Clock, accent: "sky" },
  ];

  const insights = [
    {
      Icon: TrendingUp,
      tone: "from-emerald-500/15 to-emerald-500/0 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
      title: "Collections surging",
      body: "Up 12.5% week over week — driven by Central and East regions.",
    },
    {
      Icon: Target,
      tone: "from-sky-500/15 to-sky-500/0 border-sky-500/20 text-sky-700 dark:text-sky-300",
      title: "On track to hit goal",
      body: "87% of the monthly collection target reached with 8 days remaining.",
    },
    {
      Icon: Lightbulb,
      tone: "from-violet-500/15 to-violet-500/0 border-violet-500/20 text-violet-700 dark:text-violet-300",
      title: "Optimization opportunity",
      body: "Route #12 averages 18% idle time. Reassign 2 stops to Route #8.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k, i) => (
          <AnalyticsKpiCard key={k.title} {...k} delay={i * 0.04} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            Icon={LineIcon}
            title="Collections & Revenue Trend"
            subtitle="Monthly performance overview"
            bodyHeight={CHART_HEIGHT}
          >
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <ComposedChart data={displayed}>
                <defs>
                  <linearGradient id="overviewCollections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle(isDark)} />
                <Legend />
                <Area type="monotone" dataKey="collections" fill="url(#overviewCollections)" stroke="#10b981" strokeWidth={2} name="Collections" />
                {currentRole === "admin" && (
                  <Bar dataKey="revenue" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Revenue ($)" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <GlassCard className="p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
              Top Insights
            </h3>
          </div>
          <div className="relative space-y-3">
            {insights.map((ins, i) => {
              const Icon = ins.Icon;
              return (
                <motion.div
                  key={ins.title}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`p-3 rounded-2xl border bg-gradient-to-r ${ins.tone}`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm" style={{ fontWeight: 700 }}>
                        {ins.title}
                      </p>
                      <p className="text-xs mt-0.5 opacity-90">{ins.body}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
              Weekly Snapshot
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Last 7 days vs prior 7 days
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pickups", value: "1,842", delta: "+9.2%" },
            { label: "Avg Route Time", value: "2.1h", delta: "-6.4%" },
            { label: "Quality Score", value: "94%", delta: "+1.2%" },
            { label: "Active Drivers", value: "42", delta: "+3" },
          ].map((m) => (
            <div
              key={m.label}
              className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
              <p className="text-xl text-slate-900 dark:text-white mt-0.5 tabular-nums" style={{ fontWeight: 700 }}>
                {m.value}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5" style={{ fontWeight: 600 }}>
                {m.delta}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
