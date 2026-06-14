import { useMemo, useState } from "react";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Trash2,
  Eye,
  MoreVertical,
  Activity,
  Settings,
  Shield,
  LucideIcon,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { useLiveTicker } from "@/app/hooks/useLiveTicker";

type AlertType = "critical" | "warning" | "info" | "success";
type AlertStatus = "active" | "resolved" | "pending";
type AlertPriority = "high" | "medium" | "low";

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  time: string;
  location: string;
  status: AlertStatus;
  priority: AlertPriority;
}

const seed: Alert[] = [
  { id: "1", type: "critical", title: "Center Capacity Critical", description: "Downtown Center has reached 95% capacity. Immediate action required.", time: "5 minutes ago", location: "Downtown Center", status: "active", priority: "high" },
  { id: "2", type: "warning", title: "Route Delay Detected", description: "Route A-5 is experiencing 30 minute delay due to traffic.", time: "15 minutes ago", location: "Route A-5", status: "active", priority: "medium" },
  { id: "3", type: "info", title: "New Driver Assigned", description: "John Smith has been assigned to Route B-3.", time: "1 hour ago", location: "Route B-3", status: "resolved", priority: "low" },
  { id: "4", type: "success", title: "Collection Completed", description: "North Center collection completed successfully — 850 bottles.", time: "2 hours ago", location: "North Center", status: "resolved", priority: "low" },
  { id: "5", type: "warning", title: "Maintenance Required", description: "Vehicle #12 requires scheduled maintenance check.", time: "3 hours ago", location: "Vehicle Fleet", status: "pending", priority: "medium" },
  { id: "6", type: "info", title: "System Update Available", description: "New software update available for all collection devices.", time: "5 hours ago", location: "System", status: "pending", priority: "low" },
];

const toneMap: Record<AlertType, { tone: string; glow: string; border: string; Icon: LucideIcon }> = {
  critical: { tone: "text-rose-600 dark:text-rose-400", glow: "bg-rose-500/10", border: "border-l-rose-500/60", Icon: AlertTriangle },
  warning: { tone: "text-amber-600 dark:text-amber-400", glow: "bg-amber-500/10", border: "border-l-amber-500/60", Icon: AlertCircle },
  info: { tone: "text-cyan-600 dark:text-cyan-400", glow: "bg-cyan-500/10", border: "border-l-cyan-500/60", Icon: Info },
  success: { tone: "text-emerald-600 dark:text-emerald-400", glow: "bg-emerald-500/10", border: "border-l-emerald-500/60", Icon: CheckCircle },
};

const statusChip: Record<AlertStatus, string> = {
  active: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const priorityChip: Record<AlertPriority, string> = {
  high: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low: "bg-slate-200/60 dark:bg-white/[0.06] text-slate-600 dark:text-white/60",
};

const glassCard =
  "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.04)]";

function StatCard({
  label,
  value,
  Icon,
  tone,
  glow,
  accent,
}: {
  label: string;
  value: number;
  Icon: LucideIcon;
  tone: string;
  glow: string;
  accent: string;
}) {
  return (
    <div className={`${glassCard} rounded-2xl p-5 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${glow} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${tone}`} />
        </div>
        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${tone}`}>{value}</span>
      </div>
      <p className="text-[10px] font-extrabold uppercase tracking-[2px] text-slate-500 dark:text-white/45">{label}</p>
      <p className="text-3xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{value}</p>
    </div>
  );
}

function AlertRow({
  alert,
  onResolve,
  onDelete,
}: {
  alert: Alert;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { tone, glow, border, Icon } = toneMap[alert.type];

  return (
    <div className={`${glassCard} rounded-2xl p-5 border-l-4 ${border} relative group hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all`}>
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl ${glow} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${tone}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-base text-slate-900 dark:text-white tracking-tight" style={{ fontWeight: 600 }}>{alert.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${priorityChip[alert.priority]}`}>
                  {alert.priority}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-white/55 leading-relaxed">{alert.description}</p>
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
                className="p-1.5 rounded-lg text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-white/80 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-1 z-20">
                    <button
                      onClick={() => {
                        toast.info(alert.title, { description: `${alert.location} · ${alert.status}` });
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        onResolve();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => {
                        onDelete();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-white/45">
              <Clock className="w-3 h-3" />
              {alert.time}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-white/45">
              <Activity className="w-3 h-3" />
              {alert.location}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${statusChip[alert.status]}`}>
              {alert.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SmartAlertsPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [alerts, setAlerts] = useState<Alert[]>(seed);
  const [filter, setFilter] = useState<"all" | AlertType | AlertStatus>("all");
  const [query, setQuery] = useState("");

  useLiveTicker(
    () => {
      const types: AlertType[] = ["critical", "warning", "info", "success"];
      const priorities: AlertPriority[] = ["high", "medium", "low"];
      const zones = ["Downtown Center", "Route A-5", "Route B-3", "North Center", "South Hub", "East Depot", "West Depot"];
      const messages = [
        "Container fill level rising rapidly",
        "Driver reported route obstruction",
        "Pickup window slipping past SLA",
        "Sensor signal degraded",
        "Recycling target met for today",
        "Maintenance overdue",
      ];
      const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
      const type = pick(types);
      const newAlert: Alert = {
        id: `live-${Date.now()}`,
        type,
        title: pick(messages),
        description: `Auto-generated event from ${pick(zones)}.`,
        time: "just now",
        location: pick(zones),
        status: "active",
        priority: pick(priorities),
      };
      setAlerts((prev) => [newAlert, ...prev]);
    },
    { intervalMs: 20000 },
  );

  const stats = useMemo(() => {
    const active = alerts.filter((a) => a.status === "active").length;
    const critical = alerts.filter((a) => a.type === "critical").length;
    const warnings = alerts.filter((a) => a.type === "warning").length;
    const resolved = alerts.filter((a) => a.status === "resolved").length;
    return { active, critical, warnings, resolved };
  }, [alerts]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return alerts.filter((a) => {
      const matchesFilter = filter === "all" || a.type === filter || a.status === filter;
      const matchesQuery = !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [alerts, filter, query]);

  const handleResolve = (id: string) => {
    const a = alerts.find((x) => x.id === id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a)));
    toast.success("Alert resolved");
    addNotification({ title: "Alert resolved", body: a?.title ?? `Alert #${id} resolved.`, severity: "success", icon: "CheckCircle", link: "/alerts" });
  };
  const handleDelete = (id: string) => {
    const a = alerts.find((x) => x.id === id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert deleted");
    addNotification({ title: "Alert deleted", body: a?.title ?? `Alert #${id} removed.`, severity: "critical", icon: "Trash2", link: "/alerts" });
  };

  const filterPills: { value: typeof filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "critical", label: "Critical" },
    { value: "warning", label: "Warning" },
    { value: "resolved", label: "Resolved" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 flex flex-col gap-6">
      {/* Header */}
      <div className={`${glassCard} rounded-[32px] p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Smart Alerts</h1>
            <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">Monitor and manage system alerts in real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Smart Guard Active
            </span>
          </div>

          <button
            onClick={() => navigate("/settings")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-white/60" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-white/70">Configure</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Alerts" value={stats.active} Icon={Activity} tone="text-rose-600 dark:text-rose-400" glow="bg-rose-500/10" accent="bg-rose-500/60" />
        <StatCard label="Critical" value={stats.critical} Icon={AlertTriangle} tone="text-orange-600 dark:text-orange-400" glow="bg-orange-500/10" accent="bg-orange-500/60" />
        <StatCard label="Warnings" value={stats.warnings} Icon={AlertCircle} tone="text-amber-600 dark:text-amber-400" glow="bg-amber-500/10" accent="bg-amber-500/60" />
        <StatCard label="Resolved" value={stats.resolved} Icon={CheckCircle} tone="text-emerald-600 dark:text-emerald-400" glow="bg-emerald-500/10" accent="bg-emerald-500/60" />
      </div>

      {/* Filters */}
      <div className={`${glassCard} rounded-2xl p-4 flex flex-col lg:flex-row gap-3`}>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none focus:border-cyan-400 dark:focus:border-cyan-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-white/30 shrink-0" />
          {filterPills.map((p) => (
            <button
              key={p.value}
              onClick={() => setFilter(p.value)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === p.value
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/50 hover:bg-slate-200/80 dark:hover:bg-white/[0.08]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      <div className="flex flex-col gap-3">
        {filtered.length > 0 ? (
          filtered.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onResolve={() => handleResolve(alert.id)}
              onDelete={() => handleDelete(alert.id)}
            />
          ))
        ) : (
          <div className={`${glassCard} rounded-2xl p-16 text-center`}>
            <Bell className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-3" />
            <h3 className="text-base text-slate-900 dark:text-white mb-1" style={{ fontWeight: 600 }}>No alerts found</h3>
            <p className="text-xs text-slate-500 dark:text-white/45">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
