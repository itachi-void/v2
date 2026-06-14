import { useState } from "react";
import { motion } from "motion/react";
import { Ticket as TicketIcon, Search, Filter, CheckCircle2, Clock, AlertCircle, Star, X, Plus, Download } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { toast } from "sonner";
import EmptyState from "@/app/components/EmptyState";
import { DataTable, DataTableColumn } from "@/app/components/DataTable";
import { exportToCsv } from "@/app/utils/exportCsv";
import { GlassCard } from "@/app/components/GlassCard";

type TicketStatus = "open" | "in_progress" | "resolved";
type TicketPriority = "low" | "medium" | "high";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: "complaint" | "inquiry" | "rating" | "other";
  citizenName: string;
  driverName?: string;
  rating?: number;
  createdAt: Date;
}

const seed: Ticket[] = [
  { id: "1", subject: "Missed pickup at Maadi", description: "The driver did not arrive during the scheduled window.", status: "open", priority: "high", category: "complaint", citizenName: "John Doe", createdAt: new Date(Date.now() - 3600000) },
  { id: "2", subject: "Excellent service from Ahmed", description: "Driver was prompt and very polite.", status: "resolved", priority: "low", category: "rating", citizenName: "Sara Mohamed", driverName: "Ahmed Hassan", rating: 5, createdAt: new Date(Date.now() - 86400000) },
  { id: "3", subject: "Vehicle maintenance request", description: "Right brake pad worn, please schedule maintenance.", status: "in_progress", priority: "medium", category: "other", citizenName: "System", driverName: "Ahmed Hassan", createdAt: new Date(Date.now() - 7200000) },
  { id: "4", subject: "Add more bins in Zamalek", description: "Request for additional drop-off locations.", status: "open", priority: "medium", category: "inquiry", citizenName: "Omar Ali", createdAt: new Date(Date.now() - 2 * 86400000) },
];

const statusAccent: Record<TicketStatus, { bg: string; fg: string }> = {
  open: { bg: "bg-rose-500/10", fg: "text-rose-700 dark:text-rose-300" },
  in_progress: { bg: "bg-amber-500/10", fg: "text-amber-700 dark:text-amber-300" },
  resolved: { bg: "bg-emerald-500/10", fg: "text-emerald-700 dark:text-emerald-300" },
};


const inputCls = "w-full px-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

function priorityIcon(p: TicketPriority) {
  if (p === "high") return <AlertCircle className="w-4 h-4 text-rose-500" />;
  if (p === "medium") return <Clock className="w-4 h-4 text-amber-500" />;
  return <CheckCircle2 className="w-4 h-4 text-sky-500" />;
}

export default function SupportTicketsPage() {
  const { currentRole } = useRoleContext();
  const { addNotification } = useNotifications();
  const [tickets, setTickets] = useState<Ticket[]>(seed);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", description: "", priority: "low" as TicketPriority });

  const filtered = tickets.filter((t) => {
    const ms = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.citizenName.toLowerCase().includes(searchQuery.toLowerCase());
    return ms && (filterStatus === "all" || t.status === filterStatus);
  });

  const updateStatus = (id: string, status: TicketStatus) => {
    const t = tickets.find((x) => x.id === id);
    setTickets((p) => p.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`Ticket marked ${status.replace("_", " ")}`);
    if (status === "resolved") {
      addNotification({ title: "Ticket resolved", body: t?.subject ?? `Ticket #${id} resolved.`, severity: "success", icon: "CheckCircle2", link: "/support" });
    }
  };

  const handleExport = () => {
    exportToCsv(
      "support-tickets",
      filtered,
      [
        { key: "id", label: "ID" },
        { key: "subject", label: "Subject" },
        { key: "status", label: "Status" },
        { key: "priority", label: "Priority" },
        { key: "category", label: "Category" },
        { key: "citizenName", label: "Citizen" },
        { key: "driverName", label: "Driver" },
        { key: "rating", label: "Rating" },
        { key: "createdAt", label: "Created", accessor: (t) => t.createdAt.toISOString() },
      ],
    );
    toast.success(`Exported ${filtered.length} rows`);
  };

  const columns: DataTableColumn<Ticket>[] = [
    {
      key: "subject",
      label: "Subject",
      sortable: true,
      render: (t) => (
        <div className="min-w-0">
          <p className="text-slate-900 dark:text-white truncate" style={{ fontWeight: 600 }}>{t.subject}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{t.description}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (t) => {
        const sa = statusAccent[t.status];
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs uppercase ${sa.bg} ${sa.fg}`} style={{ fontWeight: 600 }}>
            {t.status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (t) => (
        <span className="inline-flex items-center gap-1 text-sm text-slate-700 dark:text-slate-200 capitalize">
          {priorityIcon(t.priority)}
          {t.priority}
        </span>
      ),
    },
    {
      key: "citizenName",
      label: "From",
      sortable: true,
      render: (t) => (
        <div className="text-sm">
          <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{t.citizenName}</p>
          {t.driverName && <p className="text-xs text-slate-500 dark:text-slate-400">Driver: {t.driverName}</p>}
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      accessor: (t) => t.rating ?? 0,
      render: (t) =>
        t.rating ? (
          <span className="inline-flex items-center gap-1 text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-current" />
            {t.rating}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      accessor: (t) => t.createdAt.getTime(),
      render: (t) => <span className="text-sm text-slate-500 dark:text-slate-400">{t.createdAt.toLocaleString()}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (t) =>
        (currentRole === "admin" || currentRole === "manager") ? (
          <div className="flex gap-2">
            {t.status !== "resolved" && (
              <button
                onClick={(e) => { e.stopPropagation(); updateStatus(t.id, "resolved"); }}
                className="px-3 h-8 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-full text-xs hover:bg-emerald-500/20 transition-colors"
              >
                Resolve
              </button>
            )}
            {t.status === "open" && (
              <button
                onClick={(e) => { e.stopPropagation(); updateStatus(t.id, "in_progress"); }}
                className="px-3 h-8 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-full text-xs hover:bg-amber-500/20 transition-colors"
              >
                Progress
              </button>
            )}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim()) return;
    const t: Ticket = {
      id: String(Date.now()),
      subject: newTicket.subject,
      description: newTicket.description,
      status: "open",
      priority: newTicket.priority,
      category: currentRole === "driver" ? "other" : "complaint",
      citizenName: currentRole === "citizen" ? "John Doe" : currentRole === "driver" ? "System" : "Admin",
      driverName: currentRole === "driver" ? "Ahmed Hassan" : undefined,
      createdAt: new Date(),
    };
    setTickets((p) => [t, ...p]);
    setIsModalOpen(false);
    setNewTicket({ subject: "", description: "", priority: "low" });
    toast.success("Ticket created");
    addNotification({ title: "Support ticket opened", body: t.subject, severity: "success", icon: "LifeBuoy", link: "/support" });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <TicketIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Support Tickets</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              {currentRole === "citizen"
                ? "Track your inquiries and complaints"
                : currentRole === "driver"
                  ? "Report vehicle issues or route problems"
                  : "Manage citizen complaints, inquiries, and driver ratings"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-sm"
            style={{ fontWeight: 600 }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {(currentRole === "citizen" || currentRole === "driver") && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm">
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          )}
        </div>
      </motion.div>

      <GlassCard className="p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by citizen or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${inputCls}`}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-slate-400" />
          {(["all", "open", "in_progress", "resolved"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 h-10 rounded-full text-xs capitalize transition-colors ${
                filterStatus === s
                  ? "bg-emerald-600 text-white"
                  : "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </GlassCard>

      {filtered.length === 0 ? (
        <EmptyState
          Icon={TicketIcon}
          title="No tickets found"
          description="Try a different status filter or search term. New tickets will appear here."
        />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(t) => t.id}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2" style={{ fontWeight: 600 }}>
                <TicketIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Create New Ticket
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Subject</span>
                <input required value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} className={inputCls} placeholder="Summarize your issue..." />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Description</span>
                <textarea
                  required rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 resize-none"
                  placeholder="Provide more details here..."
                />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Priority</span>
                <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })} className={inputCls}>
                  <option value="low">Low - General Inquiry</option>
                  <option value="medium">Medium - Important Issue</option>
                  <option value="high">High - Urgent Problem</option>
                </select>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">
                  Cancel
                </button>
                <button type="submit" className="flex-1 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
