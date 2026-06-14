import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UsersRound, Search, UserPlus, Mail, Phone, MapPin, Award, TrendingUp, Calendar,
  Edit, Trash2, Eye, Star, Package, Coins, Activity, CheckCircle, Clock, X,
} from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

interface Citizen {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  bottlesRecycled: number;
  pointsEarned: number;
  rank: "bronze" | "silver" | "gold" | "platinum";
  status: "active" | "inactive";
  avatar: string;
  lastActivity: string;
  activeTickets: number;
  recentRequests: number;
}

const seedCitizens: Citizen[] = [
  { id: "1", name: "Ahmed Hassan", email: "ahmed.hassan@email.com", phone: "+20 123 456 7890", location: "Cairo, Egypt", joinDate: "Jan 2024", bottlesRecycled: 1250, pointsEarned: 12500, rank: "platinum", status: "active", avatar: "AH", lastActivity: "2 hours ago", activeTickets: 0, recentRequests: 12 },
  { id: "2", name: "Sara Mohamed", email: "sara.mohamed@email.com", phone: "+20 123 456 7891", location: "Giza, Egypt", joinDate: "Feb 2024", bottlesRecycled: 850, pointsEarned: 8500, rank: "gold", status: "active", avatar: "SM", lastActivity: "5 hours ago", activeTickets: 1, recentRequests: 8 },
  { id: "3", name: "Omar Ali", email: "omar.ali@email.com", phone: "+20 123 456 7892", location: "Alexandria, Egypt", joinDate: "Mar 2024", bottlesRecycled: 450, pointsEarned: 4500, rank: "silver", status: "active", avatar: "OA", lastActivity: "1 day ago", activeTickets: 0, recentRequests: 5 },
  { id: "4", name: "Fatma Ibrahim", email: "fatma.ibrahim@email.com", phone: "+20 123 456 7893", location: "Cairo, Egypt", joinDate: "Apr 2024", bottlesRecycled: 180, pointsEarned: 1800, rank: "bronze", status: "active", avatar: "FI", lastActivity: "3 days ago", activeTickets: 2, recentRequests: 3 },
  { id: "5", name: "Khaled Mahmoud", email: "khaled.mahmoud@email.com", phone: "+20 123 456 7894", location: "Mansoura, Egypt", joinDate: "May 2024", bottlesRecycled: 320, pointsEarned: 3200, rank: "silver", status: "inactive", avatar: "KM", lastActivity: "2 weeks ago", activeTickets: 0, recentRequests: 2 },
];

const rankAccent: Record<Citizen["rank"], { bg: string; fg: string; icon: string }> = {
  platinum: { bg: "bg-violet-500/10", fg: "text-violet-700 dark:text-violet-300", icon: "💎" },
  gold: { bg: "bg-amber-500/10", fg: "text-amber-700 dark:text-amber-300", icon: "🏆" },
  silver: { bg: "bg-slate-500/10", fg: "text-slate-700 dark:text-slate-300", icon: "🥈" },
  bronze: { bg: "bg-orange-500/10", fg: "text-orange-700 dark:text-orange-300", icon: "🥉" },
};

type Mode = "view" | "edit" | "add";

interface CitizenModalProps {
  mode: Mode;
  citizen: Citizen | null;
  onClose: () => void;
  onSave: (c: Citizen) => void;
}

function emptyCitizen(): Citizen {
  return {
    id: `C-${Date.now()}`,
    name: "",
    email: "",
    phone: "",
    location: "",
    joinDate: new Date().toLocaleString("en-US", { month: "short", year: "numeric" }),
    bottlesRecycled: 0,
    pointsEarned: 0,
    rank: "bronze",
    status: "active",
    avatar: "",
    lastActivity: "just now",
    activeTickets: 0,
    recentRequests: 0,
  };
}

function CitizenModal({ mode, citizen, onClose, onSave }: CitizenModalProps) {
  const [form, setForm] = useState<Citizen>(citizen ?? emptyCitizen());
  const readonly = mode === "view";

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const initials = form.name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
    onSave({ ...form, avatar: initials || form.avatar || "C" });
  };

  const ra = rankAccent[form.rank];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${ra.bg} ${ra.fg} flex items-center justify-center`} style={{ fontWeight: 700 }}>
              {form.avatar || form.name.slice(0, 2).toUpperCase() || "C"}
            </div>
            <div>
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
                {mode === "add" ? "Add Citizen" : mode === "edit" ? "Edit Citizen" : form.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {mode === "view" ? `${form.rank} · ${form.status}` : "Update citizen details"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {[
            { key: "name", label: "Full Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "phone", label: "Phone", type: "text" },
            { key: "location", label: "Location", type: "text" },
          ].map((f) => (
            <label key={f.key} className="block">
              <span className="block text-xs text-slate-600 dark:text-slate-300 mb-1" style={{ fontWeight: 600 }}>
                {f.label}
              </span>
              <input
                type={f.type}
                disabled={readonly}
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-70"
              />
            </label>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs text-slate-600 dark:text-slate-300 mb-1" style={{ fontWeight: 600 }}>
                Rank
              </span>
              <select
                disabled={readonly}
                value={form.rank}
                onChange={(e) => setForm({ ...form, rank: e.target.value as Citizen["rank"] })}
                className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-70"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-slate-600 dark:text-slate-300 mb-1" style={{ fontWeight: 600 }}>
                Status
              </span>
              <select
                disabled={readonly}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Citizen["status"] })}
                className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-70"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-slate-600 dark:text-slate-300 mb-1" style={{ fontWeight: 600 }}>
                Bottles Recycled
              </span>
              <input
                type="number"
                disabled={readonly}
                value={form.bottlesRecycled}
                onChange={(e) => setForm({ ...form, bottlesRecycled: Number(e.target.value) })}
                className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-70"
              />
            </label>
            <label className="block">
              <span className="block text-xs text-slate-600 dark:text-slate-300 mb-1" style={{ fontWeight: 600 }}>
                Points Earned
              </span>
              <input
                type="number"
                disabled={readonly}
                value={form.pointsEarned}
                onChange={(e) => setForm({ ...form, pointsEarned: Number(e.target.value) })}
                className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-70"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200"
          >
            {readonly ? "Close" : "Cancel"}
          </button>
          {!readonly && (
            <button
              onClick={handleSave}
              className="px-5 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
              style={{ fontWeight: 600 }}
            >
              {mode === "add" ? "Add Citizen" : "Save Changes"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

interface ConfirmProps {
  title: string;
  body: string;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({ title, body, onClose, onConfirm }: ConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            {title}
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{body}</p>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm"
            style={{ fontWeight: 600 }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CitizenStatsPage() {
  const { currentRole } = useRoleContext();
  const [citizens, setCitizens] = useLocalStorage<Citizen[]>("ecovoid.citizens.v1", seedCitizens);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRank, setFilterRank] = useState<"all" | Citizen["rank"]>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [modal, setModal] = useState<{ mode: Mode; citizen: Citizen | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Citizen | null>(null);

  const filtered = citizens.filter((c) => {
    const ms =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    const mr = filterRank === "all" || c.rank === filterRank;
    const mst = filterStatus === "all" || c.status === filterStatus;
    return ms && mr && mst;
  });

  const handleSave = (c: Citizen) => {
    if (modal?.mode === "add") {
      setCitizens([c, ...citizens]);
      toast.success(`${c.name} added`);
    } else {
      setCitizens(citizens.map((x) => (x.id === c.id ? c : x)));
      toast.success(`${c.name} updated`);
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    setCitizens(citizens.filter((c) => c.id !== pendingDelete.id));
    toast.success(`${pendingDelete.name} removed`);
    setPendingDelete(null);
  };

  const stats = [
    { label: "Total Citizens", value: citizens.length, change: "+12%", icon: UsersRound, accent: "emerald" },
    { label: "Active", value: citizens.filter((c) => c.status === "active").length, change: "+8%", icon: Activity, accent: "teal" },
    { label: "Total Bottles", value: citizens.reduce((s, c) => s + c.bottlesRecycled, 0), change: "+15%", icon: Package, accent: "violet" },
    { label: "Points Distributed", value: citizens.reduce((s, c) => s + c.pointsEarned, 0), change: "+20%", icon: Coins, accent: "amber" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <UsersRound className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Citizens Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage citizen accounts and track recycling activity</p>
          </div>
        </div>
        {(currentRole === "admin" || currentRole === "manager") && (
          <button
            onClick={() => setModal({ mode: "add", citizen: null })}
            className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Citizen
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon; const a = accentMap[s.accent];
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${a.fg}`} />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    {s.change}
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>{s.value.toLocaleString()}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search citizens by name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Rank:</span>
          {(["all", "platinum", "gold", "silver", "bronze"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterRank(v)}
              className={`px-3 h-8 rounded-full text-xs capitalize transition-colors ${
                filterRank === v
                  ? "bg-emerald-600 text-white"
                  : "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
              }`}
            >
              {v}
            </button>
          ))}
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-3">Status:</span>
          {(["all", "active", "inactive"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterStatus(v)}
              className={`px-3 h-8 rounded-full text-xs capitalize transition-colors ${
                filterStatus === v
                  ? "bg-emerald-600 text-white"
                  : "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <GlassCard className="col-span-full p-12 text-center">
            <UsersRound className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>No citizens found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
          </GlassCard>
        )}
        {filtered.map((c, i) => {
          const ra = rankAccent[c.rank];
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
              <GlassCard className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${ra.bg} ${ra.fg} flex items-center justify-center text-xl flex-shrink-0`} style={{ fontWeight: 600 }}>
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2" style={{ fontWeight: 600 }}>
                          {c.name}
                          {c.status === "active" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs ${ra.bg} ${ra.fg} flex items-center gap-1`}>
                            <span>{ra.icon}</span>
                            {c.rank.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            c.status === "active" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-slate-500/10 text-slate-600 dark:text-slate-300"
                          }`}>
                            {c.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ mode: "view", citizen: c })} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl" aria-label="View">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        {(currentRole === "admin" || currentRole === "manager") && (
                          <>
                            <button onClick={() => setModal({ mode: "edit", citizen: c })} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl" aria-label="Edit">
                              <Edit className="w-4 h-4 text-slate-500" />
                            </button>
                            <button onClick={() => setPendingDelete(c)} className="p-2 hover:bg-rose-500/10 rounded-xl" aria-label="Delete">
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300 mb-4">
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><span className="truncate">{c.email}</span></div>
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{c.phone}</div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{c.location}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                      <div className="text-center">
                        <Package className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                        <p className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{c.bottlesRecycled.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Bottles</p>
                      </div>
                      <div className="text-center">
                        <Coins className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                        <p className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{c.pointsEarned.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Points</p>
                      </div>
                      <div className="text-center">
                        <Calendar className="w-4 h-4 text-sky-500 mx-auto mb-1" />
                        <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{c.joinDate}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Joined</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-xl p-2 text-center">
                        <span className="block text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{c.recentRequests}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Requests</span>
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-xl p-2 text-center">
                        <span className={`block text-lg ${c.activeTickets > 0 ? "text-rose-500" : "text-slate-900 dark:text-white"}`} style={{ fontWeight: 600 }}>{c.activeTickets}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Tickets</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>Last active {c.lastActivity}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Top Citizens</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Ranked by bottles recycled</p>
        <div className="space-y-2">
          {citizens.slice().sort((a, b) => b.bottlesRecycled - a.bottlesRecycled).slice(0, 5).map((c, i) => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>#{i + 1}</div>
                <div>
                  <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{c.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{c.bottlesRecycled.toLocaleString()} bottles</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{c.pointsEarned.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {modal && (
          <CitizenModal
            mode={modal.mode}
            citizen={modal.citizen}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
        {pendingDelete && (
          <ConfirmDialog
            title="Remove citizen"
            body={`Are you sure you want to remove ${pendingDelete.name}? This action cannot be undone.`}
            onClose={() => setPendingDelete(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
