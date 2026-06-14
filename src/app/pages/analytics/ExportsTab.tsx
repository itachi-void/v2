import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Download,
  History,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { GlassCard } from "@/app/components/GlassCard";
import PremiumDownloadButton from "@/app/components/PremiumDownloadButton";
import EmptyState from "@/app/components/EmptyState";
import { exportToCsv } from "@/app/utils/exportCsv";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { monthlyData, rangeMonths, TimeRange } from "./shared/data";

interface Props {
  timeRange: TimeRange;
}

interface ReportEntry {
  id: string;
  name: string;
  kind: "CSV" | "PDF";
  size: string;
  when: string;
}

interface ScheduleEntry {
  id: number;
  name: string;
  cadence: string;
  format: "CSV" | "PDF";
}

const initialHistory: ReportEntry[] = [
  { id: "RPT-2041", name: "Monthly Analytics — May", kind: "CSV", size: "42 KB", when: "Today, 10:24" },
  { id: "RPT-2040", name: "Executive Summary — Q1", kind: "PDF", size: "1.8 MB", when: "Yesterday, 17:02" },
  { id: "RPT-2039", name: "Regional Performance — Apr", kind: "CSV", size: "28 KB", when: "Apr 30, 09:11" },
];

const initialScheduled: ScheduleEntry[] = [
  { id: 1, name: "Weekly Executive Snapshot", cadence: "Every Monday · 08:00", format: "PDF" },
  { id: 2, name: "Monthly Operations Report", cadence: "1st of month · 06:00", format: "CSV" },
];

const allMetrics = [
  { key: "month", label: "Month" },
  { key: "collections", label: "Collections" },
  { key: "revenue", label: "Revenue" },
  { key: "recycled", label: "Recycled" },
  { key: "efficiency", label: "Efficiency %" },
];

function downloadHtmlReport(name: string, rows: any[]) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${name}</title>
    <style>body{font-family:system-ui;padding:32px;color:#0f172a}h1{margin:0 0 16px}table{border-collapse:collapse;width:100%}th,td{padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#f8fafc}</style>
    </head><body><h1>${name}</h1><p>Generated ${new Date().toLocaleString()}</p>
    <table><thead><tr>${allMetrics.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${allMetrics.map((c) => `<td>${(r as any)[c.key] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.toLowerCase().replace(/\s+/g, "-")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportsTab({ timeRange }: Props) {
  const { resolvedTheme } = useTheme();
  const [history, setHistory] = useLocalStorage<ReportEntry[]>("ecovoid.analytics.history.v1", initialHistory);
  const [scheduled, setScheduled] = useLocalStorage<ScheduleEntry[]>("ecovoid.analytics.scheduled.v1", initialScheduled);

  const [showCustom, setShowCustom] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: "Custom Analytics Report",
    format: "CSV" as "CSV" | "PDF",
    metrics: ["month", "collections", "revenue", "recycled", "efficiency"],
  });
  const [scheduleForm, setScheduleForm] = useState({ name: "", cadence: "weekly", time: "08:00", format: "CSV" as "CSV" | "PDF" });

  const runExport = (kind: "CSV" | "PDF") => {
    const data = monthlyData.slice(-rangeMonths[timeRange]);
    if (kind === "CSV") {
      exportToCsv("analytics-monthly", data, allMetrics);
      toast.success(`Exported ${data.length} rows`);
    } else {
      downloadHtmlReport("Analytics Monthly Report", data);
      toast.success("PDF-ready HTML report downloaded");
    }
    const entry: ReportEntry = {
      id: `RPT-${Math.floor(2042 + Math.random() * 900)}`,
      name: `${kind === "CSV" ? "Data Export" : "PDF Report"} — ${new Date().toLocaleDateString()}`,
      kind,
      size: kind === "CSV" ? `${Math.round(2 + data.length * 1.2)} KB` : "1.2 MB",
      when: "Just now",
    };
    setHistory([entry, ...history].slice(0, 12));
  };

  const runCustom = () => {
    if (!customForm.name.trim()) {
      toast.error("Please name the report");
      return;
    }
    if (customForm.metrics.length === 0) {
      toast.error("Select at least one metric");
      return;
    }
    const cols = allMetrics.filter((c) => customForm.metrics.includes(c.key));
    const data = monthlyData.slice(-rangeMonths[timeRange]);
    if (customForm.format === "CSV") {
      exportToCsv(customForm.name.replace(/\s+/g, "-").toLowerCase(), data, cols);
    } else {
      downloadHtmlReport(customForm.name, data);
    }
    const entry: ReportEntry = {
      id: `RPT-${Math.floor(2042 + Math.random() * 900)}`,
      name: customForm.name,
      kind: customForm.format,
      size: customForm.format === "CSV" ? `${Math.round(2 + data.length * 1.2)} KB` : "1.4 MB",
      when: "Just now",
    };
    setHistory([entry, ...history].slice(0, 12));
    setShowCustom(false);
    toast.success(`"${customForm.name}" generated`);
  };

  const saveSchedule = () => {
    if (!scheduleForm.name.trim()) {
      toast.error("Please name the schedule");
      return;
    }
    const cadenceLabel =
      scheduleForm.cadence === "daily" ? `Daily · ${scheduleForm.time}` :
      scheduleForm.cadence === "weekly" ? `Every Monday · ${scheduleForm.time}` :
      scheduleForm.cadence === "monthly" ? `1st of month · ${scheduleForm.time}` :
      `Quarterly · ${scheduleForm.time}`;
    const entry: ScheduleEntry = {
      id: Date.now(),
      name: scheduleForm.name,
      cadence: cadenceLabel,
      format: scheduleForm.format,
    };
    setScheduled([entry, ...scheduled]);
    setShowSchedule(false);
    setScheduleForm({ name: "", cadence: "weekly", time: "08:00", format: "CSV" });
    toast.success(`Scheduled "${entry.name}"`);
  };

  const removeSchedule = (id: number) => {
    setScheduled(scheduled.filter((s) => s.id !== id));
    toast.success("Schedule removed");
  };

  const quickReports = [
    {
      Icon: FileSpreadsheet,
      title: "CSV Export",
      body: `Download the current view (${rangeMonths[timeRange]} months) as CSV.`,
      cta: "Download CSV",
      tone: "from-emerald-500/15 to-emerald-500/0 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
      premium: true,
      action: () => runExport("CSV"),
    },
    {
      Icon: Printer,
      title: "PDF Report",
      body: "Polished executive-ready summary with charts and KPIs.",
      cta: "Download PDF",
      tone: "from-sky-500/15 to-sky-500/0 border-sky-500/30 text-sky-700 dark:text-sky-300",
      premium: true,
      action: () => runExport("PDF"),
    },
    {
      Icon: FileText,
      title: "Custom Report",
      body: "Pick metrics, format, and name your export.",
      cta: "Build Report",
      tone: "from-violet-500/15 to-violet-500/0 border-violet-500/30 text-violet-700 dark:text-violet-300",
      action: () => setShowCustom(true),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickReports.map((r, i) => {
          const Icon = r.Icon;

          // Direct-download cards get the premium animated download button.
          // The card is a plain container here (the button lives inside it).
          if (r.premium) {
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 rounded-3xl border bg-gradient-to-br ${r.tone} flex flex-col`}
              >
                <Icon className="w-6 h-6 mb-3" />
                <h3 className="text-sm" style={{ fontWeight: 700 }}>
                  {r.title}
                </h3>
                <p className="text-xs mt-1 opacity-90">{r.body}</p>
                <div className="mt-4">
                  <PremiumDownloadButton
                    theme={resolvedTheme === "dark" ? "dark" : "light"}
                    onDownload={r.action}
                  />
                </div>
              </motion.div>
            );
          }

          return (
            <motion.button
              key={r.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={r.action}
              className={`text-left p-5 rounded-3xl border bg-gradient-to-br ${r.tone} hover:-translate-y-0.5 transition-all`}
            >
              <Icon className="w-6 h-6 mb-3" />
              <h3 className="text-sm" style={{ fontWeight: 700 }}>
                {r.title}
              </h3>
              <p className="text-xs mt-1 opacity-90">{r.body}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs" style={{ fontWeight: 700 }}>
                <Download className="w-3.5 h-3.5" />
                {r.cta}
              </div>
            </motion.button>
          );
        })}
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
                Scheduled Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated deliveries to your team
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSchedule(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs transition-colors"
            style={{ fontWeight: 700 }}
          >
            <Plus className="w-3.5 h-3.5" />
            New Schedule
          </button>
        </div>

        {scheduled.length === 0 ? (
          <EmptyState
            Icon={Calendar}
            title="No scheduled reports"
            description="Set up recurring deliveries to keep stakeholders in the loop."
            primaryAction={{ label: "New Schedule", onClick: () => setShowSchedule(true) }}
          />
        ) : (
          <div className="space-y-2">
            {scheduled.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white truncate" style={{ fontWeight: 700 }}>
                      {s.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {s.cadence}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300" style={{ fontWeight: 700 }}>
                    {s.format}
                  </span>
                  <button
                    onClick={() => removeSchedule(s.id)}
                    title="Remove schedule"
                    className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <History className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="text-sm tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
              Report History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Recent downloads and generated reports
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <EmptyState
            Icon={FileText}
            title="No reports yet"
            description="Run your first export to see it listed here."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="grid grid-cols-[1fr_80px_100px_140px] gap-2 px-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400" style={{ fontWeight: 700 }}>
              <span>Report</span>
              <span>Type</span>
              <span>Size</span>
              <span>When</span>
            </div>
            {history.map((h) => (
              <div
                key={h.id}
                className="grid grid-cols-[1fr_80px_100px_140px] gap-2 px-4 py-3 items-center border-t border-slate-200 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/[0.04] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white truncate" style={{ fontWeight: 600 }}>
                    {h.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{h.id}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full w-fit ${h.kind === "CSV" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-sky-500/10 text-sky-700 dark:text-sky-300"}`} style={{ fontWeight: 700 }}>
                  {h.kind}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{h.size}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{h.when}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <AnimatePresence>
        {showCustom && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCustom(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-lg w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Build Custom Report</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pick metrics and a format</p>
                  </div>
                </div>
                <button onClick={() => setShowCustom(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <label className="block">
                  <span className="block text-sm text-slate-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 600 }}>Report Name</span>
                  <input value={customForm.name} onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
                </label>
                <div>
                  <span className="block text-sm text-slate-700 dark:text-slate-300 mb-2" style={{ fontWeight: 600 }}>Metrics</span>
                  <div className="grid grid-cols-2 gap-2">
                    {allMetrics.map((m) => {
                      const selected = customForm.metrics.includes(m.key);
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setCustomForm({
                            ...customForm,
                            metrics: selected
                              ? customForm.metrics.filter((k) => k !== m.key)
                              : [...customForm.metrics, m.key],
                          })}
                          className={`px-3 h-9 rounded-full text-xs border transition-colors ${selected ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40" : "bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"}`}
                          style={{ fontWeight: 600 }}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-slate-700 dark:text-slate-300 mb-2" style={{ fontWeight: 600 }}>Format</span>
                  <div className="flex gap-2">
                    {(["CSV", "PDF"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setCustomForm({ ...customForm, format: f })}
                        className={`flex-1 h-10 rounded-full text-sm border ${customForm.format === f ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"}`}
                        style={{ fontWeight: 600 }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-200 dark:border-white/10">
                <button onClick={() => setShowCustom(false)} className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full text-sm">Cancel</button>
                <button onClick={runCustom} className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm">Generate</button>
              </div>
            </motion.div>
          </div>
        )}

        {showSchedule && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowSchedule(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-lg w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>New Schedule</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Automate recurring exports</p>
                  </div>
                </div>
                <button onClick={() => setShowSchedule(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <label className="block">
                  <span className="block text-sm text-slate-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 600 }}>Schedule Name</span>
                  <input value={scheduleForm.name} onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })} placeholder="e.g., Weekly Snapshot" className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-sm text-slate-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 600 }}>Cadence</span>
                    <select value={scheduleForm.cadence} onChange={(e) => setScheduleForm({ ...scheduleForm, cadence: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-sm text-slate-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 600 }}>Delivery Time</span>
                    <input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
                  </label>
                </div>
                <div>
                  <span className="block text-sm text-slate-700 dark:text-slate-300 mb-2" style={{ fontWeight: 600 }}>Format</span>
                  <div className="flex gap-2">
                    {(["CSV", "PDF"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setScheduleForm({ ...scheduleForm, format: f })}
                        className={`flex-1 h-10 rounded-full text-sm border ${scheduleForm.format === f ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"}`}
                        style={{ fontWeight: 600 }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-200 dark:border-white/10">
                <button onClick={() => setShowSchedule(false)} className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full text-sm">Cancel</button>
                <button onClick={saveSchedule} className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm">Save Schedule</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
