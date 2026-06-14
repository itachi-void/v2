import { useState } from "react";
import { motion } from "motion/react";
import { Building2, MapPin, Users, Trash2, Edit, Plus, X, Activity } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";

interface Center {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentLoad: number;
  status: "active" | "inactive" | "maintenance";
  manager: string;
  contact: string;
}

const initial: Center[] = [
  { id: "1", name: "Downtown Center", location: "123 Main St, City Center", capacity: 5000, currentLoad: 3200, status: "active", manager: "John Doe", contact: "+1 234-567-8900" },
  { id: "2", name: "North District Center", location: "456 North Ave", capacity: 3000, currentLoad: 2800, status: "active", manager: "Jane Smith", contact: "+1 234-567-8901" },
  { id: "3", name: "East Side Center", location: "789 East Blvd", capacity: 4000, currentLoad: 1500, status: "maintenance", manager: "Bob Johnson", contact: "+1 234-567-8902" },
  { id: "4", name: "West Hub", location: "321 West Way", capacity: 6000, currentLoad: 4100, status: "active", manager: "Alice Brown", contact: "+1 234-567-8903" },
];

const statusAccent: Record<Center["status"], { bg: string; fg: string; dot: string }> = {
  active: { bg: "bg-emerald-500/10", fg: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  inactive: { bg: "bg-slate-500/10", fg: "text-slate-700 dark:text-slate-300", dot: "bg-slate-500" },
  maintenance: { bg: "bg-amber-500/10", fg: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
};


const inputCls = "w-full px-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

function CenterForm({ form, setForm }: { form: Center; setForm: (c: Center) => void }) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Name</span>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
      </label>
      <label className="block">
        <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Location</span>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Capacity</span>
          <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className={inputCls} />
        </label>
        <label className="block">
          <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Current Load</span>
          <input type="number" value={form.currentLoad} onChange={(e) => setForm({ ...form, currentLoad: Number(e.target.value) })} className={inputCls} />
        </label>
      </div>
      <label className="block">
        <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Status</span>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Center["status"] })} className={inputCls}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </label>
      <label className="block">
        <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Manager</span>
        <input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} className={inputCls} />
      </label>
      <label className="block">
        <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Contact</span>
        <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className={inputCls} />
      </label>
    </div>
  );
}

export default function CentersListPage() {
  const { currentRole } = useRoleContext();
  const { addNotification } = useNotifications();
  const [centers, setCenters] = useState<Center[]>(initial);
  const [editing, setEditing] = useState<Center | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Center>({ id: "", name: "", location: "", capacity: 0, currentLoad: 0, status: "active", manager: "", contact: "" });

  const stats = [
    { label: "Total Centers", value: centers.length, icon: Building2, accent: "emerald" },
    { label: "Active Centers", value: centers.filter((c) => c.status === "active").length, icon: Users, accent: "teal" },
    { label: "Total Capacity", value: centers.reduce((a, c) => a + c.capacity, 0).toLocaleString(), icon: Activity, accent: "violet" },
  ];

  const handleDelete = (id: string) => {
    const c = centers.find((x) => x.id === id);
    setCenters(centers.filter((x) => x.id !== id));
    toast.success(`Deleted ${c?.name}`);
    addNotification({ title: "Center deleted", body: `${c?.name ?? "Center"} was removed.`, severity: "critical", icon: "Trash2", link: "/centers" });
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    setCenters((prev) => prev.map((c) => (c.id === editing.id ? form : c)));
    setEditing(null);
    toast.success("Center updated");
    addNotification({ title: "Center updated", body: `${form.name} details saved.`, severity: "success", icon: "Building2", link: "/centers" });
  };

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setCenters([...centers, { ...form, id: `CEN-${Date.now()}` }]);
    setCreating(false);
    toast.success("Center created");
    addNotification({ title: "Center created", body: `${form.name} was added.`, severity: "success", icon: "Building2", link: "/centers" });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Collection Centers</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage recycling collection centers</p>
          </div>
        </div>
        {(currentRole === "admin" || currentRole === "manager") && (
          <button
            onClick={() => { setForm({ id: "", name: "", location: "", capacity: 0, currentLoad: 0, status: "active", manager: "", contact: "" }); setCreating(true); }}
            className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Center
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-left">
                {["Center", "Location", "Capacity", "Load", "Status", "Manager", "Actions"].map((h) => (
                  <th key={h} className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {centers.map((c) => {
                const sa = statusAccent[c.status];
                const pct = Math.min(100, Math.round((c.currentLoad / c.capacity) * 100));
                return (
                  <tr key={c.id} className="border-b last:border-0 border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{c.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-200">{c.capacity.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 min-w-[140px]">
                        <div className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{c.currentLoad.toLocaleString()}</div>
                        <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5 ${sa.bg} ${sa.fg}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${sa.dot}`} />
                        <span className="capitalize">{c.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{c.manager}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{c.contact}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        {(currentRole === "admin" || currentRole === "manager") && (
                          <>
                            <button onClick={() => { setForm(c); setEditing(c); }} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors">
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

      {(editing || creating) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setEditing(null); setCreating(false); }}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{editing ? "Edit Center" : "Add Center"}</h2>
              <button onClick={() => { setEditing(null); setCreating(false); }} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <CenterForm form={form} setForm={setForm} />
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => { setEditing(null); setCreating(false); }} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">
                Cancel
              </button>
              <button onClick={editing ? handleSaveEdit : handleCreate} className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
                {editing ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
