import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  BarChart3,
  LineChart,
  PieChart,
  Package,
  Truck,
  AlertCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  LineChart as RechartsLine,
  BarChart,
  PieChart as RechartsPie,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useLiveTicker } from "@/app/hooks/useLiveTicker";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import { tooltipStyle } from "@/app/utils/chartTheme";

function AnimatedCounter({ end, duration = 1.5, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let raf: number;
    const ease = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
    const tick = (t: number) => {
      if (!startTime) startTime = t;
      const p = Math.min((t - startTime) / (duration * 1000), 1);
      setCount(Math.floor(ease(p) * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return <>{count.toLocaleString()}{suffix}</>;
}

const initialWeeklyData = [
  { day: "Mon", collected: 245, processed: 230, revenue: 1850 },
  { day: "Tue", collected: 312, processed: 298, revenue: 2340 },
  { day: "Wed", collected: 278, processed: 265, revenue: 2100 },
  { day: "Thu", collected: 398, processed: 375, revenue: 2980 },
  { day: "Fri", collected: 445, processed: 420, revenue: 3350 },
  { day: "Sat", collected: 520, processed: 495, revenue: 3920 },
  { day: "Sun", collected: 380, processed: 360, revenue: 2850 },
];

const monthlyData = [
  { month: "Jan", efficiency: 85, satisfaction: 92, revenue: 45000 },
  { month: "Feb", efficiency: 88, satisfaction: 90, revenue: 48000 },
  { month: "Mar", efficiency: 92, satisfaction: 94, revenue: 52000 },
  { month: "Apr", efficiency: 89, satisfaction: 91, revenue: 49500 },
  { month: "May", efficiency: 94, satisfaction: 95, revenue: 55000 },
  { month: "Jun", efficiency: 96, satisfaction: 96, revenue: 58000 },
];

const categoryData = [
  { name: "Glass", value: 35, color: "#10b981" },
  { name: "Plastic", value: 28, color: "#14b8a6" },
  { name: "Metal", value: 22, color: "#8b5cf6" },
  { name: "Paper", value: 15, color: "#f59e0b" },
];

const radarData = [
  { metric: "Efficiency", value: 94 },
  { metric: "Quality", value: 88 },
  { metric: "Speed", value: 92 },
  { metric: "Satisfaction", value: 96 },
  { metric: "Safety", value: 90 },
  { metric: "Innovation", value: 85 },
];

const progressMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  rose: "bg-rose-500",
};

export default function PerformanceDashboardPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("week");
  const [trendMetric, setTrendMetric] = useState<"efficiency" | "satisfaction" | "both">("both");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [weeklyData, setWeeklyData] = useState(initialWeeklyData);

  useLiveTicker(
    () => {
      setWeeklyData((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const last = next[next.length - 1];
        const jitter = (v: number, pct: number) => Math.max(0, Math.round(v + v * (Math.random() * 2 - 1) * pct));
        next[next.length - 1] = {
          ...last,
          collected: jitter(last.collected, 0.05),
          processed: jitter(last.processed, 0.05),
          revenue: jitter(last.revenue, 0.05),
        };
        return next;
      });
    },
    { intervalMs: 10000 },
  );

  const rangeMultiplier = timeRange === "week" ? 1 : timeRange === "month" ? 4.3 : 13;
  const displayedTrendData = weeklyData.map((d) => ({
    ...d,
    collected: Math.round(d.collected * rangeMultiplier),
    processed: Math.round(d.processed * rangeMultiplier),
    revenue: Math.round(d.revenue * rangeMultiplier),
  }));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info("Refreshing…");
    await new Promise((r) => setTimeout(r, 600));
    setIsRefreshing(false);
    toast.success("Up to date");
  };

  const kpis = [
    { label: "Collection Rate", value: 94, suffix: "%", icon: Package, trend: "+8%", trendUp: true, accent: "emerald", target: 95 },
    { label: "Processing Efficiency", value: 89, suffix: "%", icon: Activity, trend: "+5%", trendUp: true, accent: "teal", target: 90 },
    { label: "Driver Performance", value: 92, suffix: "%", icon: Truck, trend: "+3%", trendUp: true, accent: "violet", target: 95 },
    { label: "Customer Satisfaction", value: 96, suffix: "%", icon: Award, trend: "+2%", trendUp: true, accent: "amber", target: 98 },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Performance Metrics</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Track system performance and KPIs</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-sm text-slate-700 dark:text-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => toast.success("CSV export queued")}
            className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const a = accentMap[kpi.accent];
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
            >
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${a.fg}`} />
                  </div>
                  <span className={`flex items-center text-sm ${kpi.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {kpi.trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {kpi.trend}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1 mb-3" style={{ fontWeight: 600 }}>
                  <AnimatedCounter end={kpi.value} suffix={kpi.suffix} />
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span>{kpi.target}% target</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(kpi.value / kpi.target) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${progressMap[kpi.accent]}`}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Weekly Performance</h3>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Collection vs Processing</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={displayedTrendData}>
              <defs>
                <linearGradient id="perfCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="perfProcessed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle(isDark)} />
              <Legend />
              <Area type="monotone" dataKey="collected" stroke="#10b981" fill="url(#perfCollected)" strokeWidth={2} />
              <Area type="monotone" dataKey="processed" stroke="#14b8a6" fill="url(#perfProcessed)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <LineChart className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Revenue Trend</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Weekly revenue analysis</p>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsLine data={displayedTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle(isDark)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 5 }} activeDot={{ r: 7 }} />
            </RechartsLine>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <PieChart className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Material Distribution</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">By category</p>
          <ResponsiveContainer width="100%" height={260}>
            <RechartsPie>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                dataKey="value"
              >
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle(isDark)} />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-white/5 rounded-xl">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-slate-700 dark:text-slate-200">{cat.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">{cat.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Performance Overview</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Multi-dimensional analysis</p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(148,163,184,0.3)" />
              <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
              <Radar name="Performance" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} strokeWidth={2} />
              <Tooltip contentStyle={tooltipStyle(isDark)} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Monthly Trends</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTrendMetric(trendMetric === "efficiency" ? "both" : "efficiency")}
              className={`px-3 h-8 rounded-full text-sm transition-colors ${
                trendMetric === "efficiency"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              Efficiency
            </button>
            <button
              onClick={() => setTrendMetric(trendMetric === "satisfaction" ? "both" : "satisfaction")}
              className={`px-3 h-8 rounded-full text-sm transition-colors ${
                trendMetric === "satisfaction"
                  ? "bg-teal-600 text-white"
                  : "bg-teal-500/10 text-teal-700 dark:text-teal-300"
              }`}
            >
              Satisfaction
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Efficiency, satisfaction & revenue</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle(isDark)} />
            <Legend />
            {(trendMetric === "efficiency" || trendMetric === "both") && (
              <Bar dataKey="efficiency" fill="#10b981" radius={[8, 8, 0, 0]} />
            )}
            {(trendMetric === "satisfaction" || trendMetric === "both") && (
              <Bar dataKey="satisfaction" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Top Performer", value: "Route #12", description: "98% efficiency this week", icon: Award, accent: "emerald" },
          { title: "Most Improved", value: "Center East", description: "+15% from last month", icon: TrendingUp, accent: "teal" },
          { title: "Needs Attention", value: "Route #5", description: "Below target efficiency", icon: AlertCircle, accent: "amber" },
        ].map((insight, index) => {
          const Icon = insight.icon;
          const a = accentMap[insight.accent];
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
            >
              <GlassCard className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${a.bg} ${a.fg} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{insight.title}</p>
                <p className="text-xl tracking-tight text-slate-900 dark:text-white mb-2" style={{ fontWeight: 600 }}>{insight.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{insight.description}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
