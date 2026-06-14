import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  History, CheckCircle2, XCircle, Search, Package, User, Cpu, Filter, MessageSquare,
} from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import { useVerificationHistory, type VerificationResult } from "@/app/contexts/VerificationHistoryContext";

/* =========================================================================
 * Employee History — log of bag verifications this employee processed.
 * Reads live from VerificationHistoryContext (recorded by the Station).
 * ======================================================================= */

type Result = VerificationResult;

export default function EmployeeHistoryPage() {
  const { entries } = useVerificationHistory();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Result>("all");

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        const ms =
          e.citizenName.toLowerCase().includes(search.toLowerCase()) ||
          e.orderId.toLowerCase().includes(search.toLowerCase());
        return ms && (filter === "all" || e.result === filter);
      }),
    [entries, search, filter],
  );

  const verified = entries.filter((e) => e.result === "verified").length;
  const rejected = entries.filter((e) => e.result === "rejected").length;
  const totalPoints = entries.reduce((s, e) => s + e.points, 0);
  const avgScore = entries.length ? Math.round(entries.reduce((s, e) => s + e.matchScore, 0) / entries.length) : 0;

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl text-slate-900 dark:text-white flex items-center gap-2" style={{ fontWeight: 700 }}>
          <History className="w-6 h-6 text-fuchsia-500" /> Verification History
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Every bag you’ve scanned, photographed and decided on.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Verified" value={verified} icon={CheckCircle2} tone="emerald" />
        <Stat label="Rejected" value={rejected} icon={XCircle} tone="rose" />
        <Stat label="Points awarded" value={totalPoints} icon={Package} tone="fuchsia" />
        <Stat label="Avg. match" value={`${avgScore}%`} icon={Cpu} tone="violet" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by citizen or order ID…"
            className="w-full pl-10 pr-4 h-11 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {(["all", "verified", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-full capitalize transition-colors ${
                filter === f ? "bg-fuchsia-600 text-white" : "text-slate-600 dark:text-slate-300 hover:text-fuchsia-600"
              }`}
              style={{ fontWeight: 600 }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <GlassCard className="p-2 sm:p-4">
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {filtered.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 py-3 px-2"
            >
              <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                e.result === "verified" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}>
                {e.result === "verified" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-900 dark:text-white font-mono" style={{ fontWeight: 700 }}>{e.orderId}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><User className="w-3 h-3" /> {e.citizenName}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{e.qty}× {e.type} · match {e.matchScore}% · {e.at.toLocaleString()}</div>
                {e.result === "rejected" && e.reason && (
                  <div className="text-xs text-rose-500 dark:text-rose-400 mt-0.5 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 shrink-0" /> {e.reason}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 mt-0.5">by {e.reviewedBy}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-sm ${e.points > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} style={{ fontWeight: 700 }}>
                  {e.points > 0 ? `+${e.points}` : "—"}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-slate-400" style={{ fontWeight: 600 }}>{e.result}</div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">No entries match your search.</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon: typeof CheckCircle2; tone: string }) {
  const tones: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
    fuchsia: "text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10",
    violet: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  };
  return (
    <GlassCard className="p-4">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-3 text-2xl text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </GlassCard>
  );
}
