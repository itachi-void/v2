import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Search,
  Edit,
  MoreVertical,
  Calendar,
  MapPin,
  Wrench,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Briefcase,
  Eye,
  Copy,
  Archive,
  Trash2,
  X,
  Printer,
  CheckCheck,
  Activity,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { exportToCsv } from "@/app/utils/exportCsv";
import EmptyState from "@/app/components/EmptyState";

function AnimatedCounter({ end, duration = 1.5, prefix = "" }: { end: number; duration?: number; prefix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let raf: number;
    const ease = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
    const tick = (t: number) => {
      if (!startTime) startTime = t;
      const p = Math.min((t - startTime) / (duration * 1000), 1);
      setCount(Math.floor(ease(p) * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return <>{prefix}{count.toLocaleString()}</>;
}

interface Asset {
  id: string;
  name: string;
  category: string;
  status: string;
  location: string;
  lastMaintenance: string;
  accent: string;
  filterKey: string;
  archived?: boolean;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  status: string;
  shift: string;
  accent: string;
  archived?: boolean;
}

interface Transaction {
  id: string;
  description: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
  date: string;
  paid?: boolean;
}

const ASSETS_DATA: Asset[] = [
  { id: "AST-001", name: "Collection Truck #1", category: "Vehicle", status: "In Use", location: "Downtown Center", lastMaintenance: "2026-02-10", accent: "emerald", filterKey: "active" },
  { id: "AST-002", name: "Sorting Machine A", category: "Equipment", status: "Active", location: "North Center", lastMaintenance: "2026-01-15", accent: "teal", filterKey: "active" },
  { id: "AST-003", name: "Compactor Unit", category: "Equipment", status: "Maintenance", location: "East Center", lastMaintenance: "2026-03-01", accent: "amber", filterKey: "maintenance" },
  { id: "AST-004", name: "Recycling Bin Set", category: "Infrastructure", status: "Available", location: "West Center", lastMaintenance: "2026-02-20", accent: "violet", filterKey: "available" },
  { id: "AST-005", name: "Collection Truck #2", category: "Vehicle", status: "In Use", location: "South Center", lastMaintenance: "2026-02-28", accent: "emerald", filterKey: "active" },
];

const EMPLOYEES_DATA: Employee[] = [
  { id: "EMP-001", name: "John Smith", department: "Collections", position: "Driver", status: "On Duty", shift: "Morning", accent: "emerald" },
  { id: "EMP-002", name: "Sarah Johnson", department: "Sorting", position: "Operator", status: "On Duty", shift: "Morning", accent: "emerald" },
  { id: "EMP-003", name: "Mike Wilson", department: "Transport", position: "Coordinator", status: "Off Duty", shift: "Evening", accent: "slate" },
  { id: "EMP-004", name: "Emily Davis", department: "Maintenance", position: "Technician", status: "On Leave", shift: "Day", accent: "amber" },
  { id: "EMP-005", name: "David Brown", department: "Collections", position: "Driver", status: "On Duty", shift: "Afternoon", accent: "emerald" },
];

const TRANSACTIONS_DATA: Transaction[] = [
  { id: "TXN-001", description: "Bottle Collection Revenue", category: "Collections", type: "Income", amount: 15230, date: "2026-03-10", paid: true },
  { id: "TXN-002", description: "Staff Salaries", category: "Payroll", type: "Expense", amount: -12000, date: "2026-03-09", paid: true },
  { id: "TXN-003", description: "Equipment Maintenance", category: "Maintenance", type: "Expense", amount: -3450, date: "2026-03-08", paid: false },
  { id: "TXN-004", description: "Recycling Incentives", category: "Revenue", type: "Income", amount: 8750, date: "2026-03-07", paid: true },
  { id: "TXN-005", description: "Fuel Costs", category: "Operations", type: "Expense", amount: -2180, date: "2026-03-06", paid: false },
];

const statAccentMap: Record<string, { bg: string; fg: string }> = {
  emerald: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
  teal: { bg: "bg-teal-500/10", fg: "text-teal-600 dark:text-teal-400" },
  violet: { bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400" },
  amber: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
  sky: { bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400" },
  rose: { bg: "bg-rose-500/10", fg: "text-rose-600 dark:text-rose-400" },
};

type AssetModal = { mode: "view" | "edit"; asset: Asset } | null;
type EmployeeModal = { mode: "view" | "edit"; employee: Employee } | null;

function statusToFilterKey(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("maintenance")) return "maintenance";
  if (s.includes("available")) return "available";
  return "active";
}

function statusToAccent(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("maintenance")) return "amber";
  if (s.includes("available")) return "violet";
  if (s.includes("active")) return "teal";
  return "emerald";
}

export default function ResourceManagementPage() {
  const [activeTab, setActiveTab] = useState<"assets" | "hr" | "financial">("assets");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [resources, setResources] = useLocalStorage<Asset[]>("ecovoid.resources.v1", ASSETS_DATA);
  const [employees, setEmployees] = useLocalStorage<Employee[]>("ecovoid.employees.v1", EMPLOYEES_DATA);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("ecovoid.transactions.v1", TRANSACTIONS_DATA);
  const { addNotification } = useNotifications();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRes, setNewRes] = useState({ name: "", category: "Bins" as "Bins" | "Trucks" | "Equipment" | "Containers", qty: 1, location: "" });

  const [assetModal, setAssetModal] = useState<AssetModal>(null);
  const [assetMenu, setAssetMenu] = useState<string | null>(null);
  const [assetConfirmDelete, setAssetConfirmDelete] = useState<Asset | null>(null);

  const [employeeModal, setEmployeeModal] = useState<EmployeeModal>(null);
  const [employeeMenu, setEmployeeMenu] = useState<string | null>(null);
  const [employeeConfirmDelete, setEmployeeConfirmDelete] = useState<Employee | null>(null);

  const [invoiceTxn, setInvoiceTxn] = useState<Transaction | null>(null);
  const [txnMenu, setTxnMenu] = useState<string | null>(null);
  const [txnConfirmDelete, setTxnConfirmDelete] = useState<Transaction | null>(null);

  // Close menus on outside click
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = () => {
      setAssetMenu(null);
      setEmployeeMenu(null);
      setTxnMenu(null);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const handleAddResource = () => {
    if (!newRes.name.trim() || !newRes.location.trim()) { toast.error("Name and location are required"); return; }
    const today = new Date().toISOString().slice(0, 10);
    const id = `AST-${String(Date.now()).slice(-6)}`;
    const item: Asset = { id, name: `${newRes.name} (x${newRes.qty})`, category: newRes.category, status: "Available", location: newRes.location, lastMaintenance: today, accent: "violet", filterKey: "available" };
    setResources([...resources, item]);
    setShowAddModal(false);
    setNewRes({ name: "", category: "Bins", qty: 1, location: "" });
    toast.success("Resource added");
    addNotification({ title: "Resource added", body: `${item.name} added in ${item.location}.`, severity: "success", icon: "Package", link: "/resources" });
  };

  const handleExportResources = () => {
    exportToCsv("resources", resources, [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
      { key: "location", label: "Location" },
      { key: "lastMaintenance", label: "Last Maintenance" },
    ]);
    toast.success(`Exported ${resources.length} rows`);
  };

  // Asset operations
  const saveAsset = (updated: Asset) => {
    if (!updated.name.trim() || !updated.location.trim()) {
      toast.error("Name and location are required");
      return;
    }
    const synced: Asset = {
      ...updated,
      filterKey: statusToFilterKey(updated.status),
      accent: statusToAccent(updated.status),
    };
    setResources(resources.map((r) => (r.id === synced.id ? synced : r)));
    setAssetModal(null);
    toast.success(`${synced.name} updated`);
  };

  const duplicateAsset = (asset: Asset) => {
    const copy: Asset = {
      ...asset,
      id: `AST-${String(Date.now()).slice(-6)}`,
      name: `${asset.name} (Copy)`,
      status: "Available",
      filterKey: "available",
      accent: "violet",
    };
    setResources([copy, ...resources]);
    toast.success("Asset duplicated");
  };

  const archiveAsset = (asset: Asset) => {
    setResources(resources.map((r) => (r.id === asset.id ? { ...r, archived: !r.archived, status: r.archived ? "Available" : "Archived" } : r)));
    toast.success(asset.archived ? "Asset restored" : "Asset archived");
  };

  const deleteAsset = (asset: Asset) => {
    setResources(resources.filter((r) => r.id !== asset.id));
    setAssetConfirmDelete(null);
    toast.success("Asset deleted");
  };

  // Employee operations
  const saveEmployee = (updated: Employee) => {
    if (!updated.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setEmployees(employees.map((e) => (e.id === updated.id ? updated : e)));
    setEmployeeModal(null);
    toast.success(`${updated.name} updated`);
  };

  const duplicateEmployee = (employee: Employee) => {
    const copy: Employee = {
      ...employee,
      id: `EMP-${String(Date.now()).slice(-6)}`,
      name: `${employee.name} (Copy)`,
    };
    setEmployees([copy, ...employees]);
    toast.success("Employee record duplicated");
  };

  const archiveEmployee = (employee: Employee) => {
    setEmployees(employees.map((e) => (e.id === employee.id ? { ...e, archived: !e.archived, status: e.archived ? "On Duty" : "Archived" } : e)));
    toast.success(employee.archived ? "Employee restored" : "Employee archived");
  };

  const deleteEmployee = (employee: Employee) => {
    setEmployees(employees.filter((e) => e.id !== employee.id));
    setEmployeeConfirmDelete(null);
    toast.success("Employee deleted");
  };

  // Transaction operations
  const markPaid = (txn: Transaction) => {
    setTransactions(transactions.map((t) => (t.id === txn.id ? { ...t, paid: !t.paid } : t)));
    toast.success(txn.paid ? "Marked as unpaid" : "Marked as paid");
  };

  const downloadInvoice = (txn: Transaction) => {
    exportToCsv(`invoice-${txn.id.toLowerCase()}`, [txn], [
      { key: "id", label: "Invoice ID" },
      { key: "description", label: "Description" },
      { key: "category", label: "Category" },
      { key: "type", label: "Type" },
      { key: "amount", label: "Amount" },
      { key: "date", label: "Date" },
      { key: "paid", label: "Paid" },
    ]);
    toast.success(`Downloaded invoice ${txn.id}`);
  };

  const duplicateTxn = (txn: Transaction) => {
    const copy: Transaction = {
      ...txn,
      id: `TXN-${String(Date.now()).slice(-6)}`,
      description: `${txn.description} (Copy)`,
      paid: false,
      date: new Date().toISOString().slice(0, 10),
    };
    setTransactions([copy, ...transactions]);
    toast.success("Transaction duplicated");
  };

  const deleteTxn = (txn: Transaction) => {
    setTransactions(transactions.filter((t) => t.id !== txn.id));
    setTxnConfirmDelete(null);
    toast.success("Transaction deleted");
  };

  const filteredAssets = resources.filter((a) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesQuery = !q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.location.toLowerCase().includes(q);
    const matchesFilter = selectedFilter === "all" || a.filterKey === selectedFilter;
    return matchesQuery && matchesFilter;
  });

  const assetStats = [
    { label: "Total Assets", value: resources.length, icon: Package, accent: "emerald", subtitle: "All registered" },
    { label: "In Use", value: resources.filter((r) => r.filterKey === "active").length, icon: CheckCircle, accent: "teal", subtitle: "Currently deployed" },
    { label: "Maintenance", value: resources.filter((r) => r.filterKey === "maintenance").length, icon: Wrench, accent: "amber", subtitle: "Under service" },
    { label: "Available", value: resources.filter((r) => r.filterKey === "available").length, icon: CheckCircle, accent: "violet", subtitle: "Ready to deploy" },
  ];

  const hrStats = [
    { label: "Total Employees", value: employees.length, icon: Users, accent: "emerald", subtitle: "Across all centers" },
    { label: "On Duty", value: employees.filter((e) => e.status === "On Duty").length, icon: CheckCircle, accent: "teal", subtitle: "Currently working" },
    { label: "On Leave", value: employees.filter((e) => e.status === "On Leave").length, icon: Clock, accent: "amber", subtitle: "Out today" },
    { label: "Off Duty", value: employees.filter((e) => e.status === "Off Duty").length, icon: TrendingUp, accent: "violet", subtitle: "Off shift" },
  ];

  const totalIncome = transactions.filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "Expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const unpaidCount = transactions.filter((t) => !t.paid).length;

  const finStats = [
    { label: "Revenue", value: totalIncome, prefix: "$", icon: TrendingUp, accent: "emerald", subtitle: "From income" },
    { label: "Operating Costs", value: totalExpense, prefix: "$", icon: TrendingDown, accent: "rose", subtitle: "From expenses" },
    { label: "Net", value: totalIncome - totalExpense, prefix: "$", icon: DollarSign, accent: "teal", subtitle: "Income − Expense" },
    { label: "Unpaid Invoices", value: unpaidCount, icon: BarChart3, accent: "amber", subtitle: "Pending payment" },
  ];

  const renderStats = (stats: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const a = statAccentMap[stat.accent];
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -3 }}
          >
            <GlassCard className="p-5">
              <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${a.fg}`} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>
                <AnimatedCounter end={Math.max(0, stat.value)} prefix={stat.prefix || ""} />
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{stat.subtitle}</p>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Resource Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage assets, HR, and financial resources</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportResources}
            className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-sm text-slate-700 dark:text-slate-200"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        </div>
      </motion.div>

      <GlassCard className="p-2 flex gap-1 overflow-x-auto">
        {[
          { id: "assets", label: "Asset Tracking", icon: Package },
          { id: "hr", label: "HR Integration", icon: Users },
          { id: "financial", label: "Financial Management", icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 h-10 rounded-full transition-all text-sm whitespace-nowrap ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </GlassCard>

      <AnimatePresence mode="wait">
        {activeTab === "assets" && (
          <motion.div key="assets" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            {renderStats(assetStats)}

            <GlassCard className="p-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="available">Available</option>
              </select>
            </GlassCard>

            {filteredAssets.length === 0 ? (
              <EmptyState
                Icon={PackageOpen}
                title={searchTerm || selectedFilter !== "all" ? "No assets match your filters" : "No assets yet"}
                description={searchTerm || selectedFilter !== "all" ? "Try clearing filters or adjusting your search." : "Add your first asset to start tracking resources."}
                primaryAction={{ label: "Add Resource", onClick: () => setShowAddModal(true) }}
                secondaryAction={searchTerm || selectedFilter !== "all" ? { label: "Clear filters", onClick: () => { setSearchTerm(""); setSelectedFilter("all"); } } : undefined}
              />
            ) : (
              <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                      <tr>
                        {["Asset Info", "Category", "Status", "Location", "Last Maintenance", "Actions"].map((h, i) => (
                          <th key={h} className={`px-6 py-4 text-xs text-slate-500 dark:text-slate-400 uppercase ${i === 5 ? "text-right" : "text-left"}`} style={{ fontWeight: 600 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {filteredAssets.map((asset, index) => {
                        const a = accentMap[asset.accent] || accentMap.emerald;
                        return (
                          <motion.tr
                            key={asset.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => setAssetModal({ mode: "view", asset })}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{asset.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{asset.id}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm rounded-full">{asset.category}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5 ${a.bg} ${a.fg}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
                                {asset.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {asset.location}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {asset.lastMaintenance}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setAssetModal({ mode: "edit", asset })} title="Edit" className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <div className="relative">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setAssetMenu(assetMenu === asset.id ? null : asset.id); }}
                                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  {assetMenu === asset.id && (
                                    <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0e14] shadow-lg overflow-hidden">
                                      {[
                                        { Icon: Eye, label: "View Details", action: () => setAssetModal({ mode: "view", asset }) },
                                        { Icon: Edit, label: "Edit", action: () => setAssetModal({ mode: "edit", asset }) },
                                        { Icon: Copy, label: "Duplicate", action: () => duplicateAsset(asset) },
                                        { Icon: Archive, label: asset.archived ? "Restore" : "Archive", action: () => archiveAsset(asset) },
                                        { Icon: Trash2, label: "Delete", action: () => setAssetConfirmDelete(asset), danger: true },
                                      ].map((item) => (
                                        <button
                                          key={item.label}
                                          onClick={() => { item.action(); setAssetMenu(null); }}
                                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${item.danger ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-200"}`}
                                        >
                                          <item.Icon className="w-4 h-4" />
                                          {item.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}

        {activeTab === "hr" && (
          <motion.div key="hr" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            {renderStats(hrStats)}

            {employees.length === 0 ? (
              <EmptyState
                Icon={Users}
                title="No employees yet"
                description="Employees you add will appear here."
              />
            ) : (
              <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                      <tr>
                        {["Employee Info", "Department", "Position", "Status", "Shift", "Actions"].map((h, i) => (
                          <th key={h} className={`px-6 py-4 text-xs text-slate-500 dark:text-slate-400 uppercase ${i === 5 ? "text-right" : "text-left"}`} style={{ fontWeight: 600 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {employees.map((employee, index) => {
                        const a = accentMap[employee.accent] || accentMap.emerald;
                        const initials = employee.name.split(" ").map((n) => n[0]).join("");
                        return (
                          <motion.tr
                            key={employee.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => setEmployeeModal({ mode: "view", employee })}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center" style={{ fontWeight: 600 }}>
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{employee.name}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{employee.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm rounded-full">{employee.department}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                {employee.position}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5 ${a.bg} ${a.fg}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
                                {employee.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {employee.shift}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setEmployeeModal({ mode: "edit", employee })} title="Edit" className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <div className="relative">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEmployeeMenu(employeeMenu === employee.id ? null : employee.id); }}
                                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  {employeeMenu === employee.id && (
                                    <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0e14] shadow-lg overflow-hidden">
                                      {[
                                        { Icon: Eye, label: "View Details", action: () => setEmployeeModal({ mode: "view", employee }) },
                                        { Icon: Edit, label: "Edit", action: () => setEmployeeModal({ mode: "edit", employee }) },
                                        { Icon: Copy, label: "Duplicate", action: () => duplicateEmployee(employee) },
                                        { Icon: Archive, label: employee.archived ? "Restore" : "Archive", action: () => archiveEmployee(employee) },
                                        { Icon: Trash2, label: "Delete", action: () => setEmployeeConfirmDelete(employee), danger: true },
                                      ].map((item) => (
                                        <button
                                          key={item.label}
                                          onClick={() => { item.action(); setEmployeeMenu(null); }}
                                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${item.danger ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-200"}`}
                                        >
                                          <item.Icon className="w-4 h-4" />
                                          {item.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}

        {activeTab === "financial" && (
          <motion.div key="financial" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            {renderStats(finStats)}

            {transactions.length === 0 ? (
              <EmptyState
                Icon={FileText}
                title="No transactions yet"
                description="Income and expense records will appear here."
              />
            ) : (
              <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                      <tr>
                        {["Transaction", "Category", "Type", "Amount", "Status", "Date", "Actions"].map((h, i) => (
                          <th key={h} className={`px-6 py-4 text-xs text-slate-500 dark:text-slate-400 uppercase ${i === 6 ? "text-right" : "text-left"}`} style={{ fontWeight: 600 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {transactions.map((transaction, index) => (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => setInvoiceTxn(transaction)}
                          className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{transaction.description}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{transaction.id}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm rounded-full">{transaction.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs rounded-full ${
                              transaction.type === "Income"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={transaction.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} style={{ fontWeight: 600 }}>
                              {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center gap-1 ${transaction.paid ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                              {transaction.paid ? <CheckCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {transaction.paid ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {transaction.date}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => setInvoiceTxn(transaction)} title="View Invoice" className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors">
                                <FileText className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setTxnMenu(txnMenu === transaction.id ? null : transaction.id); }}
                                  className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {txnMenu === transaction.id && (
                                  <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0e14] shadow-lg overflow-hidden">
                                    {[
                                      { Icon: Eye, label: "View Invoice", action: () => setInvoiceTxn(transaction) },
                                      { Icon: Download, label: "Download", action: () => downloadInvoice(transaction) },
                                      { Icon: CheckCheck, label: transaction.paid ? "Mark Unpaid" : "Mark Paid", action: () => markPaid(transaction) },
                                      { Icon: Copy, label: "Duplicate", action: () => duplicateTxn(transaction) },
                                      { Icon: Trash2, label: "Delete", action: () => setTxnConfirmDelete(transaction), danger: true },
                                    ].map((item) => (
                                      <button
                                        key={item.label}
                                        onClick={() => { item.action(); setTxnMenu(null); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${item.danger ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-200"}`}
                                      >
                                        <item.Icon className="w-4 h-4" />
                                        {item.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Resource Modal */}
      <AnimatePresence>
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-lg w-full border border-slate-200 dark:border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Add Resource</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Name</span>
                <input value={newRes.name} onChange={(e) => setNewRes({ ...newRes, name: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Category</span>
                <select value={newRes.category} onChange={(e) => setNewRes({ ...newRes, category: e.target.value as any })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
                  <option value="Bins">Bins</option>
                  <option value="Trucks">Trucks</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Containers">Containers</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Quantity</span>
                <input type="number" min={1} value={newRes.qty} onChange={(e) => setNewRes({ ...newRes, qty: Number(e.target.value) })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Location</span>
                <input value={newRes.location} onChange={(e) => setNewRes({ ...newRes, location: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">Cancel</button>
              <button onClick={handleAddResource} className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Add</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Asset Details / Edit Modal */}
      {assetModal && (
        <AssetDetailsModal
          modal={assetModal}
          onClose={() => setAssetModal(null)}
          onSave={saveAsset}
          onEdit={() => setAssetModal({ mode: "edit", asset: assetModal.asset })}
          onDuplicate={() => { duplicateAsset(assetModal.asset); setAssetModal(null); }}
          onArchive={() => { archiveAsset(assetModal.asset); setAssetModal(null); }}
          onDelete={() => { setAssetConfirmDelete(assetModal.asset); setAssetModal(null); }}
        />
      )}

      {/* Employee Details / Edit Modal */}
      {employeeModal && (
        <EmployeeDetailsModal
          modal={employeeModal}
          onClose={() => setEmployeeModal(null)}
          onSave={saveEmployee}
          onEdit={() => setEmployeeModal({ mode: "edit", employee: employeeModal.employee })}
          onDuplicate={() => { duplicateEmployee(employeeModal.employee); setEmployeeModal(null); }}
          onArchive={() => { archiveEmployee(employeeModal.employee); setEmployeeModal(null); }}
          onDelete={() => { setEmployeeConfirmDelete(employeeModal.employee); setEmployeeModal(null); }}
        />
      )}

      {/* Invoice Preview */}
      {invoiceTxn && (
        <InvoicePreviewModal
          txn={invoiceTxn}
          onClose={() => setInvoiceTxn(null)}
          onDownload={() => downloadInvoice(invoiceTxn)}
          onTogglePaid={() => { markPaid(invoiceTxn); setInvoiceTxn({ ...invoiceTxn, paid: !invoiceTxn.paid }); }}
          onPrint={() => { window.print(); toast.info("Print dialog opened"); }}
        />
      )}

      {/* Delete confirmations */}
      {assetConfirmDelete && (
        <ConfirmDialog
          title="Delete asset?"
          body={`${assetConfirmDelete.name} (${assetConfirmDelete.id}) will be permanently removed.`}
          confirmLabel="Delete"
          onCancel={() => setAssetConfirmDelete(null)}
          onConfirm={() => deleteAsset(assetConfirmDelete)}
        />
      )}
      {employeeConfirmDelete && (
        <ConfirmDialog
          title="Delete employee?"
          body={`${employeeConfirmDelete.name} (${employeeConfirmDelete.id}) will be permanently removed.`}
          confirmLabel="Delete"
          onCancel={() => setEmployeeConfirmDelete(null)}
          onConfirm={() => deleteEmployee(employeeConfirmDelete)}
        />
      )}
      {txnConfirmDelete && (
        <ConfirmDialog
          title="Delete transaction?"
          body={`${txnConfirmDelete.description} (${txnConfirmDelete.id}) will be permanently removed.`}
          confirmLabel="Delete"
          onCancel={() => setTxnConfirmDelete(null)}
          onConfirm={() => deleteTxn(txnConfirmDelete)}
        />
      )}
      </AnimatePresence>
    </div>
  );
}

function AssetDetailsModal({
  modal, onClose, onSave, onEdit, onDuplicate, onArchive, onDelete,
}: {
  modal: { mode: "view" | "edit"; asset: Asset };
  onClose: () => void;
  onSave: (a: Asset) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<Asset>(modal.asset);
  useEffect(() => { setForm(modal.asset); }, [modal.asset, modal.mode]);
  const isEdit = modal.mode === "edit";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{isEdit ? "Edit Asset" : modal.asset.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{modal.asset.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isEdit ? (
            <div className="space-y-3">
              <FormField label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" /></FormField>
              <FormField label="Category">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
                  <option>Vehicle</option><option>Equipment</option><option>Infrastructure</option><option>Bins</option><option>Trucks</option><option>Containers</option>
                </select>
              </FormField>
              <FormField label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
                  <option>In Use</option><option>Active</option><option>Maintenance</option><option>Available</option><option>Archived</option>
                </select>
              </FormField>
              <FormField label="Location"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" /></FormField>
              <FormField label="Last Maintenance"><input type="date" value={form.lastMaintenance} onChange={(e) => setForm({ ...form, lastMaintenance: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" /></FormField>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <DetailCell label="Category" value={modal.asset.category} />
                <DetailCell label="Status" value={modal.asset.status} />
                <DetailCell label="Location" value={modal.asset.location} />
                <DetailCell label="Last Maintenance" value={modal.asset.lastMaintenance} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <UsageCell Icon={Activity} label="Utilization" value="78%" tone="emerald" />
                <UsageCell Icon={Wrench} label="Service Cycle" value="42 days" tone="amber" />
                <UsageCell Icon={CheckCircle} label="Uptime" value="96.4%" tone="teal" />
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Recent Activity</p>
                <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  <li>• Last status change recorded {modal.asset.lastMaintenance}</li>
                  <li>• Assigned to {modal.asset.location}</li>
                  <li>• Updated just now</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            {!isEdit && (
              <>
                <button onClick={onDuplicate} className="px-3 h-9 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" />Duplicate</button>
                <button onClick={onArchive} className="px-3 h-9 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"><Archive className="w-3.5 h-3.5" />{modal.asset.archived ? "Restore" : "Archive"}</button>
                <button onClick={onDelete} className="px-3 h-9 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs inline-flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" />Delete</button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full text-sm">Close</button>
            {isEdit ? (
              <button onClick={() => onSave(form)} className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm">Save Changes</button>
            ) : (
              <button onClick={onEdit} className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm inline-flex items-center gap-2"><Edit className="w-4 h-4" />Edit</button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EmployeeDetailsModal({
  modal, onClose, onSave, onEdit, onDuplicate, onArchive, onDelete,
}: {
  modal: { mode: "view" | "edit"; employee: Employee };
  onClose: () => void;
  onSave: (e: Employee) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<Employee>(modal.employee);
  useEffect(() => { setForm(modal.employee); }, [modal.employee, modal.mode]);
  const isEdit = modal.mode === "edit";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center" style={{ fontWeight: 600 }}>
              {modal.employee.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{isEdit ? "Edit Employee" : modal.employee.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{modal.employee.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isEdit ? (
            <div className="space-y-3">
              <FormField label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" /></FormField>
              <FormField label="Department">
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
                  <option>Collections</option><option>Sorting</option><option>Transport</option><option>Maintenance</option><option>Operations</option>
                </select>
              </FormField>
              <FormField label="Position"><input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" /></FormField>
              <FormField label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
                  <option>On Duty</option><option>Off Duty</option><option>On Leave</option><option>Archived</option>
                </select>
              </FormField>
              <FormField label="Shift">
                <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
                  <option>Morning</option><option>Afternoon</option><option>Evening</option><option>Day</option><option>Night</option>
                </select>
              </FormField>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <DetailCell label="Department" value={modal.employee.department} />
                <DetailCell label="Position" value={modal.employee.position} />
                <DetailCell label="Status" value={modal.employee.status} />
                <DetailCell label="Shift" value={modal.employee.shift} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <UsageCell Icon={Activity} label="Attendance" value="94%" tone="emerald" />
                <UsageCell Icon={CheckCircle} label="Tasks Done" value="128" tone="teal" />
                <UsageCell Icon={Clock} label="Hours/wk" value="38" tone="violet" />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            {!isEdit && (
              <>
                <button onClick={onDuplicate} className="px-3 h-9 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" />Duplicate</button>
                <button onClick={onArchive} className="px-3 h-9 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"><Archive className="w-3.5 h-3.5" />{modal.employee.archived ? "Restore" : "Archive"}</button>
                <button onClick={onDelete} className="px-3 h-9 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs inline-flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" />Delete</button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full text-sm">Close</button>
            {isEdit ? (
              <button onClick={() => onSave(form)} className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm">Save Changes</button>
            ) : (
              <button onClick={onEdit} className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm inline-flex items-center gap-2"><Edit className="w-4 h-4" />Edit</button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InvoicePreviewModal({
  txn, onClose, onDownload, onTogglePaid, onPrint,
}: {
  txn: Transaction;
  onClose: () => void;
  onDownload: () => void;
  onTogglePaid: () => void;
  onPrint: () => void;
}) {
  const isIncome = txn.type === "Income";
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Invoice {txn.id}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{txn.date}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-slate-200 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Total</p>
            <p className={`text-3xl mt-1 tabular-nums ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`} style={{ fontWeight: 700 }}>
              {isIncome ? "+" : "-"}${Math.abs(txn.amount).toLocaleString()}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
              style={{ fontWeight: 600 }}>
              <span className={`px-2 py-0.5 rounded-full ${txn.paid ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                {txn.paid ? "Paid" : "Pending"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DetailCell label="Description" value={txn.description} />
            <DetailCell label="Category" value={txn.category} />
            <DetailCell label="Type" value={txn.type} />
            <DetailCell label="Date" value={txn.date} />
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Line Items</p>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-200 dark:border-white/5">
                  <td className="py-2 text-slate-700 dark:text-slate-300">{txn.description}</td>
                  <td className="py-2 text-right tabular-nums text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>${Math.abs(txn.amount).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-500 dark:text-slate-400">Total</td>
                  <td className="py-2 text-right tabular-nums text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>${Math.abs(txn.amount).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 dark:border-white/10">
          <button onClick={onTogglePaid} className={`px-4 h-10 rounded-full text-sm inline-flex items-center gap-2 ${txn.paid ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
            <CheckCheck className="w-4 h-4" />
            {txn.paid ? "Mark Unpaid" : "Mark Paid"}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onPrint} className="px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full text-sm inline-flex items-center gap-2"><Printer className="w-4 h-4" />Print</button>
            <button onClick={onDownload} className="px-4 h-10 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-sm inline-flex items-center gap-2"><Download className="w-4 h-4" />Download</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ConfirmDialog({ title, body, confirmLabel, onCancel, onConfirm }: { title: string; body: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-md w-full border border-slate-200 dark:border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{title}</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="px-5 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">Cancel</button>
          <button onClick={onConfirm} className="px-5 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm">{confirmLabel}</button>
        </div>
      </motion.div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>{label}</p>
      <p className="text-sm text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function UsageCell({ Icon, label, value, tone }: { Icon: typeof Activity; label: string; value: string; tone: string }) {
  const a = statAccentMap[tone] || statAccentMap.emerald;
  return (
    <div className={`p-3 rounded-2xl ${a.bg}`}>
      <Icon className={`w-4 h-4 ${a.fg}`} />
      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{label}</p>
      <p className={`text-base mt-0.5 ${a.fg}`} style={{ fontWeight: 700 }}>{value}</p>
    </div>
  );
}
