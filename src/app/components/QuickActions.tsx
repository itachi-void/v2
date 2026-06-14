import { useNavigate } from "react-router";
import {
  Zap,
  MapPin,
  Users,
  Activity,
  ScanLine,
  LucideIcon,
  ArrowUpRight,
} from "lucide-react";

interface Action {
  label: string;
  desc: string;
  Icon: LucideIcon;
  tone: string; // text + icon accent
  glow: string; // soft tinted bg behind icon
  to: string;
}

const actions: Action[] = [
  {
    label: "Quick Scan",
    desc: "Scan new QR code",
    Icon: Zap,
    tone: "text-emerald-600 dark:text-emerald-400",
    glow: "bg-emerald-500/10",
    to: "/pickups",
  },
  {
    label: "Verify Bag",
    desc: "Scan & verify a delivered bag",
    Icon: ScanLine,
    tone: "text-fuchsia-600 dark:text-fuchsia-400",
    glow: "bg-fuchsia-500/10",
    to: "/verification",
  },
  {
    label: "New Route",
    desc: "Create collection route",
    Icon: MapPin,
    tone: "text-cyan-600 dark:text-cyan-400",
    glow: "bg-cyan-500/10",
    to: "/routes",
  },
  {
    label: "Add Citizen",
    desc: "Register new user",
    Icon: Users,
    tone: "text-violet-600 dark:text-violet-400",
    glow: "bg-violet-500/10",
    to: "/drivers",
  },
  {
    label: "View Analytics",
    desc: "Deep insights & reports",
    Icon: Activity,
    tone: "text-amber-600 dark:text-amber-400",
    glow: "bg-amber-500/10",
    to: "/analytics",
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-1 h-1 rounded-full bg-emerald-500" />
        <h2
          className="text-[10px] uppercase tracking-[2px] text-slate-500 dark:text-white/50"
          style={{ fontWeight: 800 }}
        >
          Quick Actions
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map(({ label, desc, Icon, tone, glow, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all p-5 text-left"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-10 h-10 rounded-xl ${glow} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${tone}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/50 transition-colors" />
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-white/45 mt-0.5 font-medium">
                {desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
