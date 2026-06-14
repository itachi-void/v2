import { useState } from "react";
import { motion } from "motion/react";
import {
  Eye, CheckCircle, XCircle, AlertTriangle, Search, Image as ImageIcon, ShieldAlert,
  Clock, X, Zap,
} from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";

type Status = "Pending" | "Approved" | "Rejected" | "Flagged";

interface Submission {
  id: string;
  citizenId: string;
  citizenName: string;
  submittedAt: Date;
  imageUrl: string;
  detectedType: string;
  detectedQuantity: number;
  detectedWeightKg: number;
  confidenceScore: number;
  status: Status;
  fraudFlags?: string[];
  pointsToAward: number;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
}

const seed: Submission[] = [
  { id: "VAL-001", citizenId: "CIT-12345", citizenName: "Ahmed Hassan", submittedAt: new Date("2026-05-22T10:30:00"), imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400", detectedType: "PET", detectedQuantity: 5, detectedWeightKg: 0.5, confidenceScore: 98, status: "Pending", pointsToAward: 50 },
  { id: "VAL-002", citizenId: "CIT-12346", citizenName: "Fatma Mohamed", submittedAt: new Date("2026-05-22T09:15:00"), imageUrl: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400", detectedType: "HDPE", detectedQuantity: 3, detectedWeightKg: 0.3, confidenceScore: 92, status: "Pending", pointsToAward: 30 },
  { id: "VAL-003", citizenId: "CIT-12347", citizenName: "Omar Ali", submittedAt: new Date("2026-05-22T08:00:00"), imageUrl: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400", detectedType: "PET", detectedQuantity: 8, detectedWeightKg: 0.8, confidenceScore: 65, status: "Flagged", fraudFlags: ["Low confidence score", "Possible duplicate image"], pointsToAward: 80 },
  { id: "VAL-004", citizenId: "CIT-12348", citizenName: "Sara Mahmoud", submittedAt: new Date("2026-05-21T16:45:00"), imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400", detectedType: "PP", detectedQuantity: 4, detectedWeightKg: 0.4, confidenceScore: 95, status: "Approved", reviewedBy: "Admin User", reviewedAt: new Date("2026-05-21T17:00:00"), pointsToAward: 40 },
  { id: "VAL-005", citizenId: "CIT-12349", citizenName: "Karim Youssef", submittedAt: new Date("2026-05-21T14:20:00"), imageUrl: "https://images.unsplash.com/photo-1572098661174-87690fb6c527?w=400", detectedType: "PET", detectedQuantity: 2, detectedWeightKg: 0.2, confidenceScore: 45, status: "Rejected", reviewedBy: "Manager User", reviewedAt: new Date("2026-05-21T15:00:00"), rejectionReason: "Image quality too low for accurate detection", pointsToAward: 0 },
];

const statusAccent: Record<Status, { bg: string; fg: string }> = {
  Pending: { bg: "bg-amber-500/10", fg: "text-amber-700 dark:text-amber-300" },
  Approved: { bg: "bg-emerald-500/10", fg: "text-emerald-700 dark:text-emerald-300" },
  Rejected: { bg: "bg-rose-500/10", fg: "text-rose-700 dark:text-rose-300" },
  Flagged: { bg: "bg-fuchsia-500/10", fg: "text-fuchsia-700 dark:text-fuchsia-300" },
};

function statusIcon(s: Status) {
  if (s === "Pending") return <Clock className="w-4 h-4" />;
  if (s === "Approved") return <CheckCircle className="w-4 h-4" />;
  if (s === "Rejected") return <XCircle className="w-4 h-4" />;
  return <AlertTriangle className="w-4 h-4" />;
}

function confidenceColor(score: number): string {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}


export default function AiValidationPage() {
  useRoleContext();
  const [submissions, setSubmissions] = useState<Submission[]>(seed);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<Submission | null>(null);

  const approve = (id: string) => {
    setSubmissions((p) => p.map((s) => (s.id === id ? { ...s, status: "Approved", reviewedBy: "Admin", reviewedAt: new Date() } : s)));
    setSelected(null);
    toast.success("Submission approved");
  };

  const reject = (id: string) => {
    const reason = prompt("Rejection reason:") || "Rejected by reviewer";
    setSubmissions((p) => p.map((s) => (s.id === id ? { ...s, status: "Rejected", reviewedBy: "Admin", reviewedAt: new Date(), rejectionReason: reason, pointsToAward: 0 } : s)));
    setSelected(null);
    toast.success("Submission rejected");
  };

  const filtered = submissions.filter((s) => {
    const ms = s.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    return ms && (filterStatus === "all" || s.status === filterStatus);
  });

  const stats = [
    { label: "Pending Review", value: submissions.filter((s) => s.status === "Pending").length, icon: Clock, accent: "amber" },
    { label: "Flagged Items", value: submissions.filter((s) => s.status === "Flagged").length, icon: AlertTriangle, accent: "fuchsia" },
    { label: "Approved", value: submissions.filter((s) => s.status === "Approved").length, icon: CheckCircle, accent: "emerald" },
    { label: "Rejected", value: submissions.filter((s) => s.status === "Rejected").length, icon: XCircle, accent: "rose" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>AI Validation Review</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Review and validate AI-detected recycling submissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm text-emerald-700 dark:text-emerald-300" style={{ fontWeight: 600 }}>AI-Powered Detection</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon; const a = accentMap[s.accent];
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-3xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>{s.value}</p>
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
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Flagged">Flagged</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, i) => {
          const sa = statusAccent[s.status];
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
              <GlassCard className="overflow-hidden">
                <div className="relative h-48 bg-slate-100 dark:bg-white/5">
                  <img src={s.imageUrl} alt="Submission" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center gap-1 ${sa.bg} ${sa.fg}`} style={{ fontWeight: 600 }}>
                      {statusIcon(s.status)}
                      {s.status}
                    </span>
                  </div>
                  {s.fraudFlags && s.fraudFlags.length > 0 && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-xs rounded-full inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
                      <ShieldAlert className="w-3 h-3" />
                      Fraud Alert
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{s.id}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{s.citizenName}</p>
                    </div>
                    <button onClick={() => setSelected(s)} className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Type:</span><span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{s.detectedType}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Quantity:</span><span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{s.detectedQuantity} items</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Weight:</span><span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{s.detectedWeightKg} kg</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">AI Confidence:</span><span className={confidenceColor(s.confidenceScore)} style={{ fontWeight: 600 }}>{s.confidenceScore}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Points:</span><span className="text-emerald-600 dark:text-emerald-400" style={{ fontWeight: 600 }}>{s.pointsToAward} pts</span></div>
                  </div>
                  {s.status === "Pending" && (
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => approve(s.id)} className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-full transition-colors">Approve</button>
                      <button onClick={() => reject(s.id)} className="flex-1 h-10 bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-sm rounded-full hover:bg-rose-500/20 transition-colors">Reject</button>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Validation Details</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selected.id}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="rounded-2xl overflow-hidden">
                <img src={selected.imageUrl} alt="Submission" className="w-full h-96 object-cover" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Citizen Name", selected.citizenName],
                  ["Submitted At", selected.submittedAt.toLocaleString()],
                  ["Detected Type", selected.detectedType],
                  ["Quantity", `${selected.detectedQuantity} items`],
                  ["Weight", `${selected.detectedWeightKg} kg`],
                  ["AI Confidence", `${selected.confidenceScore}%`],
                  ["Points to Award", `${selected.pointsToAward} pts`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{k}</p>
                    <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{v}</p>
                  </div>
                ))}
              </div>

              {selected.fraudFlags && selected.fraudFlags.length > 0 && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-rose-700 dark:text-rose-300 mb-2" style={{ fontWeight: 600 }}>Fraud Alerts</p>
                      <ul className="space-y-1">
                        {selected.fraudFlags.map((f, i) => (
                          <li key={i} className="text-sm text-rose-700 dark:text-rose-300">• {f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selected.rejectionReason && (
                <div className="p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Rejection Reason</p>
                  <p className="text-slate-900 dark:text-white">{selected.rejectionReason}</p>
                </div>
              )}
            </div>

            {selected.status === "Pending" && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-white/10">
                <button onClick={() => setSelected(null)} className="px-6 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">
                  Cancel
                </button>
                <button onClick={() => reject(selected.id)} className="px-6 h-10 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-sm hover:bg-rose-500/20 transition-colors">
                  Reject
                </button>
                <button onClick={() => approve(selected.id)} className="px-6 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
                  Approve &amp; Award Points
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
