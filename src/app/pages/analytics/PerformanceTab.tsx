import { useState } from "react";
import { motion } from "motion/react";
import {
  Target,
  MapPin,
  Award,
  Activity,
  Package,
  DollarSign,
  PieChart as PieIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { useTheme } from "next-themes";
import { tooltipStyle } from "@/app/utils/chartTheme";
import { GlassCard } from "@/app/components/GlassCard";
import ChartCard from "./shared/ChartCard";
import {
  performanceData,
  regionData,
  monthlyData,
  rangeMonths,
  topDrivers,
  badgeColor,
  categoryData,
  TimeRange,
} from "./shared/data";

const CHART_HEIGHT = 280;

interface Props {
  timeRange: TimeRange;
}

export default function PerformanceTab({ timeRange }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const displayed = monthlyData.slice(-rangeMonths[timeRange]);
  const filteredRegions =
    regionFilter === "all" ? regionData : regionData.filter((r) => r.region === regionFilter);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          Icon={Target}
          iconClass="text-violet-600 dark:text-violet-400"
          title="Performance Metrics"
          subtitle="Multi-dimensional operational analysis"
          bodyHeight={CHART_HEIGHT}
        >
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="rgba(148,163,184,0.3)" />
              <PolarAngleAxis dataKey="category" stroke="#94a3b8" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
              <Radar name="Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              <Tooltip contentStyle={tooltipStyle(isDark)} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          Icon={MapPin}
          iconClass="text-amber-600 dark:text-amber-400"
          title="Regional Performance"
          subtitle="Filter and compare regions"
          bodyHeight={CHART_HEIGHT}
          action={
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="h-8 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              <option value="all">All regions</option>
              {regionData.map((r) => (
                <option key={r.region} value={r.region}>
                  {r.region}
                </option>
              ))}
            </select>
          }
        >
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <RechartsBarChart data={filteredRegions}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
              <XAxis dataKey="region" stroke="#94a3b8" axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle(isDark)} />
              <Legend />
              <Bar dataKey="bottles" fill="#10b981" radius={[6, 6, 0, 0]} name="Bottles" />
              <Bar dataKey="centers" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Centers" />
              <Bar dataKey="drivers" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Drivers" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        Icon={Activity}
        title="Efficiency & Quality Trends"
        subtitle="Year-over-year performance improvement"
        bodyHeight={CHART_HEIGHT}
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <AreaChart data={displayed}>
            <defs>
              <linearGradient id="perfEff" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} />
            <YAxis domain={[85, 100]} stroke="#94a3b8" axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle(isDark)} />
            <Legend />
            <Area type="monotone" dataKey="efficiency" stroke="#10b981" fill="url(#perfEff)" strokeWidth={2.5} name="Efficiency (%)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          Icon={Award}
          iconClass="text-amber-500"
          title="Top Performing Drivers"
          subtitle="Leading drivers this month"
        >
          <div className="space-y-2">
            {topDrivers.map((driver, i) => (
              <motion.div
                key={driver.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-sm text-slate-700 dark:text-slate-200" style={{ fontWeight: 700 }}>
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm text-slate-900 dark:text-white truncate" style={{ fontWeight: 700 }}>
                      {driver.name}
                    </h4>
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${badgeColor[driver.badge]} flex items-center justify-center shrink-0`}>
                      <Award className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {driver.collections.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {driver.revenue.toLocaleString()}
                    </span>
                    <span>⭐ {driver.rating}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          Icon={PieIcon}
          iconClass="text-teal-600 dark:text-teal-400"
          title="Material Distribution"
          subtitle="Breakdown by material type"
          bodyHeight={CHART_HEIGHT}
        >
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <RechartsPieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={({ name, value }) => `${name} ${value}%`}>
                {categoryData.map((c, i) => (
                  <Cell key={i} fill={c.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle(isDark)} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <GlassCard className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Route Efficiency", value: "92%", color: "bg-emerald-500" },
          { label: "Fleet Uptime", value: "98%", color: "bg-sky-500" },
          { label: "On-time Rate", value: "94%", color: "bg-violet-500" },
          { label: "Quality Score", value: "96%", color: "bg-amber-500" },
        ].map((m) => (
          <div key={m.label}>
            <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
            <p className="text-2xl text-slate-900 dark:text-white mt-1 tabular-nums" style={{ fontWeight: 700 }}>
              {m.value}
            </p>
            <div className="h-1.5 mt-2 rounded-full bg-slate-200/70 dark:bg-white/[0.08] overflow-hidden">
              <div className={`h-full ${m.color}`} style={{ width: m.value }} />
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
