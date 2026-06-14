import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Plus, Eye, Edit, Trash2, MapPin, X, Route as RouteIcon, Truck, Clock } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";

type RouteStatus = "active" | "completed" | "scheduled";

interface Route {
  id: string;
  name: string;
  driver: string;
  stops: number;
  distance: string;
  duration: string;
  status: RouteStatus;
}

const initialRoutes: Route[] = [
  { id: "101", name: "Cairo Downtown", driver: "Ahmed Mohamed", stops: 12, distance: "45.2 km", duration: "3h 20min", status: "active" },
  { id: "102", name: "Giza District", driver: "Mohamed Ali", stops: 15, distance: "52.8 km", duration: "4h 15min", status: "active" },
  { id: "103", name: "Nasr City", driver: "Khaled Hassan", stops: 10, distance: "38.5 km", duration: "2h 45min", status: "completed" },
  { id: "104", name: "Heliopolis", driver: "Omar Ibrahim", stops: 14, distance: "48.3 km", duration: "3h 50min", status: "scheduled" },
  { id: "105", name: "Maadi Area", driver: "Youssef Ahmed", stops: 11, distance: "42.1 km", duration: "3h 10min", status: "active" },
  { id: "106", name: "6th October", driver: "Mahmoud Said", stops: 18, distance: "65.4 km", duration: "5h 20min", status: "scheduled" },
  { id: "107", name: "Zamalek", driver: "Hassan Fouad", stops: 8, distance: "28.7 km", duration: "2h 15min", status: "completed" },
  { id: "108", name: "Mohandessin", driver: "Ibrahim Kamal", stops: 13, distance: "44.9 km", duration: "3h 30min", status: "active" },
  { id: "109", name: "New Cairo", driver: "Tarek Nabil", stops: 16, distance: "58.2 km", duration: "4h 40min", status: "scheduled" },
  { id: "110", name: "Dokki", driver: "Amr Samir", stops: 9, distance: "35.6 km", duration: "2h 50min", status: "completed" },
];

const emptyForm: Omit<Route, "id"> = { name: "", driver: "", stops: 0, distance: "", duration: "", status: "scheduled" };

const statusAccent: Record<RouteStatus, { bg: string; fg: string; dot: string }> = {
  active: { bg: "bg-emerald-500/10", fg: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  completed: { bg: "bg-sky-500/10", fg: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  scheduled: { bg: "bg-amber-500/10", fg: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
};


function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full px-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

export default function RoutesPage() {
  const { currentRole } = useRoleContext();
  const { addNotification } = useNotifications();
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RouteStatus>("all");
  const [viewing, setViewing] = useState<Route | null>(null);
  const [editing, setEditing] = useState<Route | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Route, "id">>(emptyForm);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return routes.filter((r) => {
      const mq = !q || r.name.toLowerCase().includes(q) || r.driver.toLowerCase().includes(q) || r.id.includes(q);
      const ms = statusFilter === "all" || r.status === statusFilter;
      return mq && ms;
    });
  }, [routes, searchQuery, statusFilter]);

  const handleDelete = (route: Route) => {
    setRoutes((prev) => prev.filter((r) => r.id !== route.id));
    toast.success(`Route ${route.name} deleted`);
    addNotification({ title: "Route deleted", body: `Route ${route.name} (#${route.id}) was removed.`, severity: "critical", icon: "Route", link: "/routes" });
  };

  const openCreate = () => { setForm(emptyForm); setCreating(true); };
  const openEdit = (r: Route) => {
    setForm({ name: r.name, driver: r.driver, stops: r.stops, distance: r.distance, duration: r.duration, status: r.status });
    setEditing(r);
  };

  const handleSubmitCreate = () => {
    if (!form.name.trim() || !form.driver.trim()) { toast.error("Please fill route name and driver"); return; }
    const nextId = String(Math.max(...routes.map((r) => Number(r.id)), 100) + 1);
    setRoutes((prev) => [{ id: nextId, ...form }, ...prev]);
    setCreating(false); setForm(emptyForm);
    toast.success("Route created");
    addNotification({ title: "Route created", body: `${form.name} assigned to ${form.driver}.`, severity: "success", icon: "Route", link: "/routes" });
  };

  const handleSubmitEdit = () => {
    if (!editing) return;
    if (!form.name.trim() || !form.driver.trim()) { toast.error("Please fill route name and driver"); return; }
    setRoutes((prev) => prev.map((r) => (r.id === editing.id ? { ...editing, ...form } : r)));
    setEditing(null); setForm(emptyForm);
    toast.success("Route updated");
    addNotification({ title: "Route updated", body: `${form.name} details saved.`, severity: "success", icon: "Route", link: "/routes" });
  };

  const stats = [
    { label: "Total Routes", value: routes.length, icon: RouteIcon, accent: "emerald" },
    { label: "Active", value: routes.filter((r) => r.status === "active").length, icon: Truck, accent: "teal" },
    { label: "Scheduled", value: routes.filter((r) => r.status === "scheduled").length, icon: Clock, accent: "amber" },
    { label: "Completed", value: routes.filter((r) => r.status === "completed").length, icon: MapPin, accent: "sky" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <RouteIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Routes</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage collection routes</p>
          </div>
        </div>
        {(currentRole === "admin" || currentRole === "manager") && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm">
            <Plus className="w-4 h-4" />
            New Route
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon; const a = accentMap[s.accent];
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>{s.value}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-left">
                {["Route", "Driver", "Stops", "Distance", "Duration", "Status", "Actions"].map((h) => (
                  <th key={h} className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">No routes match your filters.</td></tr>
              )}
              {filtered.map((route) => {
                const sa = statusAccent[route.status];
                return (
                  <tr key={route.id} className="border-b last:border-0 border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm" style={{ fontWeight: 600 }}>
                          #{route.id}
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{route.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Route #{route.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs" style={{ fontWeight: 600 }}>
                          {route.driver.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-slate-700 dark:text-slate-200">{route.driver}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span style={{ fontWeight: 600 }}>{route.stops}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{route.distance}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{route.duration}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5 ${sa.bg} ${sa.fg}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${sa.dot}`} />
                        <span className="capitalize">{route.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewing(route)} className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {(currentRole === "admin" || currentRole === "manager") && (
                          <>
                            <button onClick={() => openEdit(route)} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(route)} className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {viewing && (
        <Modal title={`Route #${viewing.id} — ${viewing.name}`} onClose={() => setViewing(null)}>
          <div className="space-y-2 text-sm">
            {[
              ["Driver", viewing.driver],
              ["Stops", String(viewing.stops)],
              ["Distance", viewing.distance],
              ["Duration", viewing.duration],
              ["Status", viewing.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                <span className="text-slate-500 dark:text-slate-400">{k}</span>
                <span className="text-slate-900 dark:text-white capitalize" style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setViewing(null)} className="mt-6 w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors">
            Close
          </button>
        </Modal>
      )}

      {(creating || editing) && (
        <Modal title={editing ? `Edit Route #${editing.id}` : "New Route"} onClose={() => { setCreating(false); setEditing(null); }}>
          <div className="space-y-3">
            <Field label="Route Name">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Driver">
              <input value={form.driver} onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))} className={inputCls} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Stops">
                <input type="number" min={0} value={form.stops} onChange={(e) => setForm((f) => ({ ...f, stops: Number(e.target.value) }))} className={inputCls} />
              </Field>
              <Field label="Distance">
                <input placeholder="45.2 km" value={form.distance} onChange={(e) => setForm((f) => ({ ...f, distance: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Duration">
                <input placeholder="3h 20min" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as RouteStatus }))} className={inputCls}>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">
              Cancel
            </button>
            <button onClick={editing ? handleSubmitEdit : handleSubmitCreate} className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
              {editing ? "Save Changes" : "Create Route"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
