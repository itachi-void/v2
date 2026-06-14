import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  RefreshCw,
  Truck,
  Users,
  LayoutDashboard,
  Activity,
  Lightbulb,
  Download,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useRoleContext } from "@/contexts/RoleContext";
import { GlassCard } from "@/app/components/GlassCard";
import { springLayout, tBase } from "@/app/constants/motion";
import OverviewTab from "./analytics/OverviewTab";
import PerformanceTab from "./analytics/PerformanceTab";
import InsightsTab from "./analytics/InsightsTab";
import ExportsTab from "./analytics/ExportsTab";
import ChartSkeleton from "./analytics/shared/ChartSkeleton";
import { TimeRange } from "./analytics/shared/data";

type TabKey = "overview" | "performance" | "insights" | "exports";

interface TabDef {
  key: TabKey;
  label: string;
  Icon: typeof LayoutDashboard;
}

const tabs: TabDef[] = [
  { key: "overview", label: "Overview", Icon: LayoutDashboard },
  { key: "performance", label: "Performance", Icon: Activity },
  { key: "insights", label: "Insights", Icon: Lightbulb },
  { key: "exports", label: "Exports", Icon: Download },
];

export default function AnalyticsPage() {
  const { currentRole } = useRoleContext();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("year");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(id);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info("Refreshing analytics…");
    await new Promise((r) => setTimeout(r, 600));
    setIsRefreshing(false);
    toast.success("Up to date");
  };

  if (currentRole === "driver" || currentRole === "citizen") {
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <GlassCard className="flex flex-col items-center justify-center text-center p-16 gap-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
            {currentRole === "driver" ? (
              <Truck className="w-10 h-10 text-slate-400" />
            ) : (
              <Users className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
            Analytics Access Restricted
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            The analytics dashboard is available for Admin and Manager roles. Check your personalized
            overview instead.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
              {t("pages.AnalyticsTitle")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Structured insights across operations, performance, and impact.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-sm text-slate-700 dark:text-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      <GlassCard className="p-1.5 overflow-x-auto">
        <div role="tablist" className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.Icon;
            const active = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={`relative inline-flex items-center gap-2 h-10 px-4 rounded-2xl text-sm transition-colors ${
                  active
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
                style={{ fontWeight: 700 }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {active && (
                  <motion.span
                    layoutId="analytics-tab-pill"
                    className="absolute inset-0 rounded-2xl ring-1 ring-emerald-500/30 pointer-events-none"
                    transition={springLayout}
                  />
                )}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[110px] rounded-3xl bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 animate-pulse" />
            ))}
          </div>
          <ChartSkeleton height={280} />
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={tBase}
        >
          {activeTab === "overview" && <OverviewTab timeRange={timeRange} />}
          {activeTab === "performance" && <PerformanceTab timeRange={timeRange} />}
          {activeTab === "insights" && <InsightsTab />}
          {activeTab === "exports" && <ExportsTab timeRange={timeRange} />}
        </motion.div>
      )}
    </div>
  );
}
