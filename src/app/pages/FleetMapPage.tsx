import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Map as MapIcon,
  Truck,
  AlertTriangle,
  Activity,
  Fuel,
  Navigation,
  Pause,
  WifiOff,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRoleContext } from "@/contexts/RoleContext";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useLiveTicker } from "@/app/hooks/useLiveTicker";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";

type TruckStatus = "en-route" | "idle" | "offline";

interface FleetTruck {
  id: string;
  driver: string;
  status: TruckStatus;
  zone: string;
  fuel: number;
  nextStop: string;
  x: number; // 0-100
  y: number; // 0-100
}

interface Zone {
  id: string;
  name: string;
  capacity: number; // 0-100
  points: string; // SVG polygon points
}

interface GeofenceAlert {
  id: string;
  truckId: string;
  driver: string;
  zone: string;
  time: string;
  severity: "high" | "medium" | "low";
}

const zones: Zone[] = [
  { id: "z1", name: "North", capacity: 82, points: "100,40 360,30 380,200 120,210" },
  { id: "z2", name: "East", capacity: 64, points: "400,40 720,60 700,240 400,210" },
  { id: "z3", name: "South", capacity: 45, points: "120,230 400,235 380,420 140,410" },
  { id: "z4", name: "West", capacity: 91, points: "420,250 720,260 740,430 410,420" },
];

const initialTrucks: FleetTruck[] = [
  { id: "TRK-001", driver: "Ahmed Hassan", status: "en-route", zone: "North", fuel: 78, nextStop: "Hub North-A", x: 24, y: 22 },
  { id: "TRK-002", driver: "Mohamed Ali", status: "en-route", zone: "East", fuel: 54, nextStop: "Depot E-12", x: 64, y: 25 },
  { id: "TRK-003", driver: "Sara Ahmed", status: "idle", zone: "South", fuel: 91, nextStop: "Awaiting dispatch", x: 32, y: 70 },
  { id: "TRK-004", driver: "Omar Khaled", status: "en-route", zone: "West", fuel: 32, nextStop: "Drop-off W-3", x: 70, y: 68 },
  { id: "TRK-005", driver: "Fatima Said", status: "offline", zone: "North", fuel: 12, nextStop: "—", x: 18, y: 38 },
  { id: "TRK-006", driver: "Karim Nabil", status: "en-route", zone: "East", fuel: 66, nextStop: "Hub East-B", x: 56, y: 18 },
  { id: "TRK-007", driver: "Layla Ibrahim", status: "idle", zone: "West", fuel: 88, nextStop: "Awaiting dispatch", x: 78, y: 52 },
  { id: "TRK-008", driver: "Tarek Younis", status: "en-route", zone: "South", fuel: 47, nextStop: "Depot S-7", x: 28, y: 58 },
];

const geofenceAlerts: GeofenceAlert[] = [
  { id: "GF-1042", truckId: "TRK-005", driver: "Fatima Said", zone: "North → Outside", time: "3 min ago", severity: "high" },
  { id: "GF-1041", truckId: "TRK-004", driver: "Omar Khaled", zone: "West boundary", time: "18 min ago", severity: "medium" },
  { id: "GF-1040", truckId: "TRK-002", driver: "Mohamed Ali", zone: "East buffer", time: "42 min ago", severity: "low" },
];

const statusConfig: Record<TruckStatus, { label: string; dot: string; chip: string; icon: any }> = {
  "en-route": {
    label: "En route",
    dot: "#10b981",
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    icon: Navigation,
  },
  idle: {
    label: "Idle",
    dot: "#f59e0b",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    icon: Pause,
  },
  offline: {
    label: "Offline",
    dot: "#94a3b8",
    chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    icon: WifiOff,
  },
};


function heatColor(capacity: number, isDark: boolean) {
  // emerald (low) -> amber (mid) -> rose (high)
  if (capacity >= 80) return isDark ? "rgba(244,63,94,0.35)" : "rgba(244,63,94,0.25)";
  if (capacity >= 60) return isDark ? "rgba(245,158,11,0.32)" : "rgba(245,158,11,0.22)";
  return isDark ? "rgba(16,185,129,0.28)" : "rgba(16,185,129,0.18)";
}

export default function FleetMapPage() {
  const navigate = useNavigate();
  const { currentRole } = useRoleContext();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [trucks, setTrucks] = useState<FleetTruck[]>(initialTrucks);
  useLiveTicker(
    () => {
      setTrucks((prev) =>
        prev.map((t) => {
          if (t.status === "offline") return t;
          const nx = Math.max(2, Math.min(98, t.x + (Math.random() * 20 - 10) * (10 / 80)));
          const ny = Math.max(2, Math.min(98, t.y + (Math.random() * 20 - 10) * (10 / 46)));
          return { ...t, x: nx, y: ny };
        }),
      );
    },
    { intervalMs: 5000 },
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TruckStatus>("all");
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return trucks.filter((t) => {
      const matchesQuery =
        !query ||
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.driver.toLowerCase().includes(query.toLowerCase()) ||
        t.zone.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const kpis = [
    {
      label: "Active Trucks",
      value: trucks.length,
      icon: Truck,
      accent: "emerald",
    },
    {
      label: "On Route",
      value: trucks.filter((t) => t.status === "en-route").length,
      icon: Navigation,
      accent: "teal",
    },
    {
      label: "Idle",
      value: trucks.filter((t) => t.status === "idle").length,
      icon: Pause,
      accent: "amber",
    },
    {
      label: "Geofence Breaches",
      value: geofenceAlerts.length,
      icon: ShieldAlert,
      accent: "rose",
    },
  ];

  const severityChip: Record<GeofenceAlert["severity"], string> = {
    high: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    low: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info("Pinging fleet telemetry…");
    await new Promise((r) => setTimeout(r, 600));
    setIsRefreshing(false);
    toast.success("Fleet positions updated");
  };

  if (currentRole === "citizen") {
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <GlassCard className="flex flex-col items-center justify-center text-center p-16 gap-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
            <MapIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
            Fleet Map Restricted
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            Live fleet telemetry is available for operations staff only.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <MapIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Fleet Map</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Live geographic view of every truck, drop-off, and active request
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Live
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-sm text-slate-700 dark:text-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <h3 className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</h3>
                <p
                  className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1"
                  style={{ fontWeight: 600 }}
                >
                  {kpi.value}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                  Live Telemetry
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> En route
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Idle
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Offline
                </span>
              </div>
            </div>

            <div
              className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(14,165,233,0.05) 0%, rgba(16,185,129,0.05) 100%)"
                  : "linear-gradient(135deg, rgba(186,230,253,0.4) 0%, rgba(167,243,208,0.4) 100%)",
              }}
            >
              <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md" style={{ fontWeight: 600 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">● LIVE</span>
              </div>
              <svg viewBox="0 0 800 460" className="w-full h-auto block">
                {/* Grid */}
                <defs>
                  <pattern id="fleetGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke={isDark ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.25)"}
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="800" height="460" fill="url(#fleetGrid)" />

                {/* Zone polygons w/ capacity heat */}
                {zones.map((z) => (
                  <g key={z.id}>
                    <polygon
                      points={z.points}
                      fill={heatColor(z.capacity, isDark)}
                      stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.15)"}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  </g>
                ))}

                {/* Zone labels */}
                {zones.map((z) => {
                  // pick first point for label anchor (rough)
                  const pts = z.points.split(" ").map((p) => p.split(",").map(Number));
                  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
                  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
                  return (
                    <g key={`lbl-${z.id}`}>
                      <text
                        x={cx}
                        y={cy - 6}
                        textAnchor="middle"
                        fill={isDark ? "rgba(226,232,240,0.85)" : "rgba(15,23,42,0.7)"}
                        fontSize="14"
                        fontWeight="600"
                      >
                        {z.name}
                      </text>
                      <text
                        x={cx}
                        y={cy + 12}
                        textAnchor="middle"
                        fill={isDark ? "rgba(148,163,184,0.85)" : "rgba(71,85,105,0.85)"}
                        fontSize="11"
                      >
                        Capacity {z.capacity}%
                      </text>
                    </g>
                  );
                })}

                {/* Trucks */}
                {filtered.map((t) => {
                  const cx = (t.x / 100) * 800;
                  const cy = (t.y / 100) * 460;
                  const color = statusConfig[t.status].dot;
                  const isSelected = selectedTruck === t.id;
                  return (
                    <g
                      key={t.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedTruck(t.id)}
                    >
                      {t.status === "en-route" && (
                        <circle cx={cx} cy={cy} r="14" fill={color} opacity="0.25">
                          <animate
                            attributeName="r"
                            values="10;22;10"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.35;0;0.35"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 9 : 7}
                        fill={color}
                        stroke="white"
                        strokeWidth="2"
                      />
                      {isSelected && (
                        <g>
                          <rect
                            x={cx + 10}
                            y={cy - 22}
                            width="120"
                            height="32"
                            rx="8"
                            fill={isDark ? "rgba(10,14,20,0.92)" : "rgba(255,255,255,0.95)"}
                            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(148,163,184,0.3)"}
                          />
                          <text
                            x={cx + 18}
                            y={cy - 8}
                            fill={isDark ? "#fff" : "#0f172a"}
                            fontSize="11"
                            fontWeight="600"
                          >
                            {t.id}
                          </text>
                          <text
                            x={cx + 18}
                            y={cy + 5}
                            fill={isDark ? "#94a3b8" : "#64748b"}
                            fontSize="10"
                          >
                            {t.driver}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Activity className="w-3.5 h-3.5" />
              Heat overlay reflects zone capacity. Click a truck pin for details.
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Fleet Roster</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {filtered.length} of {trucks.length} trucks
            </p>

            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search truck, driver, zone…"
                  className="w-full pl-9 pr-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="all">All</option>
                <option value="en-route">En route</option>
                <option value="idle">Idle</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1" style={{ maxHeight: 480 }}>
              {filtered.map((t, index) => {
                const cfg = statusConfig[t.status];
                const StatusIcon = cfg.icon;
                const isSelected = selectedTruck === t.id;
                const fuelLow = t.fuel < 35;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => setSelectedTruck(t.id)}
                    whileHover={{ x: 4 }}
                    className={`p-3 rounded-2xl cursor-pointer border transition-colors ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cfg.dot }}
                        />
                        <span
                          className="text-sm text-slate-900 dark:text-white truncate"
                          style={{ fontWeight: 600 }}
                        >
                          {t.id}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 h-6 inline-flex items-center gap-1 rounded-full border ${cfg.chip}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{t.driver}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {t.zone}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          fuelLow ? "text-rose-600 dark:text-rose-400" : ""
                        }`}
                      >
                        <Fuel className="w-3 h-3" />
                        {t.fuel}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Next: {t.nextStop}
                    </p>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 p-6">
                  No trucks match.
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Recent Geofence Alerts
              </h3>
            </div>
            <button
              onClick={() => navigate("/alerts")}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Configure
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Drivers leaving their assigned zones
          </p>

          <div className="space-y-2">
            {geofenceAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ x: 4 }}
                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4
                      className="text-sm text-slate-900 dark:text-white"
                      style={{ fontWeight: 600 }}
                    >
                      {alert.truckId} · {alert.driver}
                    </h4>
                    <span
                      className={`text-xs px-2 h-6 inline-flex items-center rounded-full border ${severityChip[alert.severity]}`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{alert.zone}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
