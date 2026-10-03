import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  BadgeCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Cpu,
  Star,
  History,
  ScanLine,
  ArrowRight,
  Settings,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { GlassCard } from "@/app/components/GlassCard";

/* =========================================================================
 * Employee Profile — the staff member's own data & performance, like the
 * user profile but tailored to a center employee. Mock stats (no backend).
 * ======================================================================= */

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const name = user?.name ?? "Employee";
  const email = user?.email ?? "employee@EcoSnap.io";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const info = [
    { icon: Mail, label: "Email", value: email },
    { icon: Phone, label: "Phone", value: "+20 100 555 8842" },
    { icon: Building2, label: "Center", value: "Nasr City Recycling Hub" },
    { icon: MapPin, label: "Location", value: "Cairo, Egypt" },
    { icon: Calendar, label: "Joined", value: "Jan 2026" },
    { icon: Clock, label: "Shift", value: "08:00 – 16:30" },
  ];

  const stats = [
    {
      icon: CheckCircle2,
      label: "Bags verified",
      value: "1,284",
      tone: "emerald",
    },
    { icon: Cpu, label: "Avg. AI match", value: "92%", tone: "violet" },
    { icon: Star, label: "Accuracy rating", value: "4.9", tone: "amber" },
  ];

  const toneBg: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    violet: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="p-0 overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 relative">
            <svg
              className="absolute inset-x-0 bottom-0 w-full h-16 opacity-30"
              viewBox="0 0 720 64"
              preserveAspectRatio="none"
            >
              <path
                d="M0,40 C150,15 300,60 450,35 C600,12 680,50 720,38 L720,64 L0,64 Z"
                fill="rgba(255,255,255,0.2)"
              />
            </svg>
          </div>
          <div className="px-6 pb-6 -mt-10 flex items-end gap-4 flex-wrap">
            <div
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-white text-2xl shadow-lg shrink-0 border-4 border-white dark:border-[#0a0e14]"
              style={{ fontWeight: 700 }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="flex items-center gap-2">
                <h1
                  className="text-2xl text-slate-900 dark:text-white"
                  style={{ fontWeight: 700 }}
                >
                  {name}
                </h1>
                <BadgeCheck className="w-5 h-5 text-fuchsia-500" />
              </div>
              <span
                className="inline-block mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300"
                style={{ fontWeight: 700 }}
              >
                Center Employee
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/verification")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm transition-colors"
                style={{ fontWeight: 600 }}
              >
                <ScanLine className="w-4 h-4" /> Verification Station
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm hover:border-fuchsia-300 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} className="p-5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${toneBg[s.tone]}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div
                className="mt-3 text-2xl text-slate-900 dark:text-white"
                style={{ fontWeight: 700 }}
              >
                {s.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {s.label}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <GlassCard className="p-5">
          <h2
            className="text-sm text-slate-900 dark:text-white mb-4"
            style={{ fontWeight: 700 }}
          >
            Personal information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {info.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-300 shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <div
                      className="text-[10px] uppercase tracking-wide text-slate-400"
                      style={{ fontWeight: 700 }}
                    >
                      {row.label}
                    </div>
                    <div
                      className="text-sm text-slate-800 dark:text-slate-100 truncate"
                      style={{ fontWeight: 600 }}
                    >
                      {row.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Shortcuts */}
        <GlassCard className="p-5">
          <h2
            className="text-sm text-slate-900 dark:text-white mb-4"
            style={{ fontWeight: 700 }}
          >
            Shortcuts
          </h2>
          <div className="space-y-2">
            <Shortcut
              icon={ScanLine}
              label="Verification Station"
              desc="Scan & verify delivered bags"
              onClick={() => navigate("/verification")}
            />
            <Shortcut
              icon={History}
              label="My History"
              desc="Bags you’ve processed"
              onClick={() => navigate("/employee-history")}
            />
            <Shortcut
              icon={Settings}
              label="Settings"
              desc="Account & preferences"
              onClick={() => navigate("/settings")}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Shortcut({
  icon: Icon,
  label,
  desc,
  onClick,
}: {
  icon: typeof ScanLine;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left"
    >
      <span className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div
          className="text-sm text-slate-800 dark:text-slate-100"
          style={{ fontWeight: 600 }}
        >
          {label}
        </div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400" />
    </button>
  );
}
