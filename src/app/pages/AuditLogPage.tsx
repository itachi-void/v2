import { Fragment, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, ShieldCheck, AlertTriangle, XCircle, Hash, Download, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { exportToCsv } from "@/app/utils/exportCsv";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";


type Severity = "info" | "warning" | "critical";
type Action = "CREATE" | "UPDATE" | "DELETE" | "READ";

interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  role: string;
  action: Action;
  target: string;
  severity: Severity;
  ip: string;
  hash: string;
  prevHash: string;
  payload: Record<string, unknown>;
  success: boolean;
}

const seed: AuditEntry[] = [
  { id: "A-001", ts: "2026-05-31 14:23:01", actor: "Ahmed Hassan", role: "admin", action: "UPDATE", target: "Driver:DRV-014", severity: "info", ip: "10.0.4.21", hash: "0x9ac2f8e1...", prevHash: "0x7b3e91...", payload: { status: { from: "active", to: "suspended" } }, success: true },
  { id: "A-002", ts: "2026-05-31 14:18:44", actor: "System", role: "system", action: "CREATE", target: "Pickup:REQ-422", severity: "info", ip: "127.0.0.1", hash: "0x7b3e91d4...", prevHash: "0x4f1ac9...", payload: { zone: "Downtown", weight: 12.4 }, success: true },
  { id: "A-003", ts: "2026-05-31 13:55:12", actor: "Sara Mohamed", role: "manager", action: "DELETE", target: "Zone:Z-007", severity: "critical", ip: "10.0.4.55", hash: "0x4f1ac9b2...", prevHash: "0x1ddc02...", payload: { reason: "duplicate" }, success: true },
  { id: "A-004", ts: "2026-05-31 13:21:09", actor: "Unknown", role: "anon", action: "READ", target: "Report:R-118", severity: "warning", ip: "203.0.113.7", hash: "0x1ddc022a...", prevHash: "0xb84c11...", payload: { auth: "missing_token" }, success: false },
  { id: "A-005", ts: "2026-05-31 12:48:33", actor: "Omar Khaled", role: "admin", action: "UPDATE", target: "Settings:Billing", severity: "warning", ip: "10.0.4.12", hash: "0xb84c1180...", prevHash: "0x3a92e0...", payload: { tier: { from: "basic", to: "enterprise" } }, success: true },
  { id: "A-006", ts: "2026-05-31 11:30:01", actor: "System", role: "system", action: "CREATE", target: "AuditChain:Verify", severity: "info", ip: "127.0.0.1", hash: "0x3a92e0fc...", prevHash: "0x0000...", payload: { verified: true, tampered: 0 }, success: true },
];

const sevAccent: Record<Severity, string> = {
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  critical: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const actionAccent: Record<Action, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  UPDATE: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  DELETE: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  READ: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

export default function AuditLogPage() {
  useRoleContext();
  const [actor, setActor] = useState("all");
  const [target, setTarget] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const actors = Array.from(new Set(seed.map((e) => e.actor)));
  const targets = Array.from(new Set(seed.map((e) => e.target.split(":")[0])));

  const filtered = useMemo(() => seed.filter((e) => {
    if (actor !== "all" && e.actor !== actor) return false;
    if (target !== "all" && !e.target.startsWith(target)) return false;
    if (severity !== "all" && e.severity !== severity) return false;
    const day = e.ts.slice(0, 10);
    if (dateFrom && day < dateFrom) return false;
    if (dateTo && day > dateTo) return false;
    return true;
  }), [actor, target, severity, dateFrom, dateTo]);

  const stats = [
    { label: "Total Entries", value: seed.length, Icon: FileText, accent: "emerald" },
    { label: "Critical Events", value: seed.filter((e) => e.severity === "critical").length, Icon: AlertTriangle, accent: "rose" },
    { label: "Failed Actions", value: seed.filter((e) => !e.success).length, Icon: XCircle, accent: "amber" },
    { label: "Last Verified Hash", value: "0x9ac2…f8e1", Icon: Hash, accent: "violet", mono: true },
  ];
  const toggle = (id: string) => {
    setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Audit Log</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Tamper-evident chain of every system action</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => toast.success("Chain verified — 0 tampered entries")} className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm">
            <ShieldCheck className="w-4 h-4" /> Verify chain integrity
          </button>
          <button onClick={() => {
            exportToCsv("audit-log", filtered, [
              { key: "id", label: "ID" },
              { key: "ts", label: "Timestamp" },
              { key: "actor", label: "Actor" },
              { key: "role", label: "Role" },
              { key: "action", label: "Action" },
              { key: "target", label: "Target" },
              { key: "severity", label: "Severity" },
              { key: "ip", label: "IP" },
              { key: "hash", label: "Hash" },
              { key: "prevHash", label: "Prev Hash" },
              { key: "success", label: "Success" },
              { key: "payload", label: "Payload", accessor: (r: any) => JSON.stringify(r.payload) },
            ]);
            toast.success(`Exported ${filtered.length} rows`);
          }} className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors text-sm text-slate-700 dark:text-slate-200">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const a = accentMap[s.accent];
          const Icon = s.Icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className={`tracking-tight text-slate-900 dark:text-white ${s.mono ? "text-base font-mono" : "text-2xl"}`} style={{ fontWeight: 600 }}>{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={actor} onChange={(e) => setActor(e.target.value)} className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200">
            <option value="all">All actors</option>
            {actors.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200">
            <option value="all">All targets</option>
            {targets.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200">
            <option value="all">All severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200" />
          {(actor !== "all" || target !== "all" || severity !== "all" || dateFrom || dateTo) && (
            <button onClick={() => { setActor("all"); setTarget("all"); setSeverity("all"); setDateFrom(""); setDateTo(""); }} className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 text-xs text-slate-700 dark:text-slate-200">
              Clear filters
            </button>
          )}
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">{filtered.length} of {seed.length}</span>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Hash</th>
                <th className="px-4 py-3">Prev</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((e) => (
                <Fragment key={e.id}>
                  <tr className="hover:bg-slate-50/40 dark:hover:bg-white/5 cursor-pointer" onClick={() => toggle(e.id)}>
                    <td className="px-4 py-3">{expanded.has(e.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-300">{e.ts}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      <div style={{ fontWeight: 600 }}>{e.actor}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{e.role}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-mono ${actionAccent[e.action]}`}>{e.action}</span></td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-mono text-xs">{e.target}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${sevAccent[e.severity]}`}>{e.severity}</span></td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500 dark:text-slate-400">{e.ip}</td>
                    <td className="px-4 py-3 text-xs font-mono text-emerald-700 dark:text-emerald-400">{e.hash}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400 hover:underline">{e.prevHash}</td>
                  </tr>
                  <AnimatePresence>
                    {expanded.has(e.id) && (
                      <tr>
                        <td colSpan={9} className="bg-slate-50/60 dark:bg-white/5 px-4 py-4">
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2" style={{ fontWeight: 600 }}>Payload diff</div>
                            <pre className="font-mono text-xs text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-black/30 rounded-2xl p-3 overflow-x-auto border border-slate-200 dark:border-white/10">
{JSON.stringify(e.payload, null, 2)}
                            </pre>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
