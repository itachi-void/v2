import { useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Recycle,
  Coins,
  Leaf,
  Trees,
  Gift,
  Award,
  Trophy,
  TrendingUp,
  LifeBuoy,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { GlassCard } from "@/app/components/GlassCard";
import { Reveal } from "@/app/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/app/components/motion/Stagger";
import { AnimatedNumber } from "@/app/components/motion/AnimatedNumber";
import { pressable, tFast, ease, duration } from "@/app/constants/motion";
import {
  PointsLedgerRepository,
  computeBalance,
  type PointsEntry,
} from "@/app/repositories/RewardsRepository";
import { useRepository } from "@/app/hooks/useRepository";

/* Citizen levels mirror the public progression tiers. */
const LEVELS = [
  { level: 1, title: "Beginner", min: 0, max: 499 },
  { level: 2, title: "Newcomer", min: 500, max: 999 },
  { level: 3, title: "Contributor", min: 1000, max: 2499 },
  { level: 4, title: "Activist", min: 2500, max: 4999 },
  { level: 5, title: "Champion", min: 5000, max: 9999 },
  { level: 6, title: "Hero", min: 10000, max: 19999 },
  { level: 7, title: "Legend", min: 20000, max: 49999 },
];

/** Offline fallback so the portal demos without a backend. */
const SEED_LEDGER: PointsEntry[] = [
  { id: "p-1", type: "earn", label: "Recycled 420 bottles", points: 8400, date: "2026-05-02" },
  { id: "p-2", type: "earn", label: "Weekly streak bonus", points: 1500, date: "2026-05-20" },
  { id: "p-3", type: "earn", label: "Recycled 260 bottles", points: 5200, date: "2026-06-01" },
  { id: "p-4", type: "redeem", label: "Coffee Voucher", points: 500, date: "2026-06-04", rewardId: "rwd-001" },
  { id: "p-5", type: "redeem", label: "Eco Tote Bag", points: 600, date: "2026-06-08", rewardId: "rwd-007" },
];

function levelFor(points: number) {
  const idx = LEVELS.findIndex((l) => points >= l.min && points <= l.max);
  const current = idx >= 0 ? LEVELS[idx] : LEVELS[LEVELS.length - 1];
  const next = LEVELS[Math.min(idx + 1, LEVELS.length - 1)];
  const span = Math.max(current.max - current.min, 1);
  const progress = Math.min(100, Math.round(((points - current.min) / span) * 100));
  return { current, next, progress, toNext: Math.max(0, next.min - points) };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function CitizenPortalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { rows } = useRepository<PointsEntry>(PointsLedgerRepository);

  const ledger = rows.length > 0 ? rows : SEED_LEDGER;
  const balance = useMemo(() => computeBalance(ledger), [ledger]);
  const earned = useMemo(() => ledger.filter((e) => e.type === "earn").reduce((s, e) => s + e.points, 0), [ledger]);
  // ~10 points per bottle in the program.
  const bottles = Math.round(earned / 10);
  const co2 = Math.round(bottles * 0.5); // kg
  const trees = Math.round(bottles / 100);
  const { current, next, progress, toNext } = levelFor(earned);

  const recent = useMemo(
    () => [...ledger].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [ledger]
  );

  const firstName = (user?.name ?? "Friend").split(/\s+/)[0];

  const impact = [
    { label: "Bottles Recycled", value: bottles, icon: Recycle, accent: "emerald" },
    { label: "Available Points", value: balance, icon: Coins, accent: "amber" },
    { label: "CO₂ Saved (kg)", value: co2, icon: Leaf, accent: "green" },
    { label: "Trees Equivalent", value: trees, icon: Trees, accent: "teal" },
  ];

  const accent: Record<string, { bg: string; fg: string }> = {
    emerald: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
    amber: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
    green: { bg: "bg-green-500/10", fg: "text-green-600 dark:text-green-400" },
    teal: { bg: "bg-teal-500/10", fg: "text-teal-600 dark:text-teal-400" },
  };

  const actions = [
    { label: "Redeem Rewards", desc: "Spend your points", icon: Gift, to: "/rewards", tone: "amber" },
    { label: "My Badges", desc: "Achievements unlocked", icon: Award, to: "/badges", tone: "violet" },
    { label: "Leaderboard", desc: "See your rank", icon: Trophy, to: "/leaderboards", tone: "sky" },
    { label: "Levels & Perks", desc: "Progression tiers", icon: TrendingUp, to: "/citizen-levels", tone: "emerald" },
  ];

  const toneClasses: Record<string, { bg: string; fg: string }> = {
    amber: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
    violet: { bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400" },
    sky: { bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400" },
    emerald: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* Welcome hero */}
      <Reveal>
        <GlassCard className="relative overflow-hidden p-7">
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs mb-3" style={{ fontWeight: 600 }}>
                <Sparkles className="w-3.5 h-3.5" /> Level {current.level} · {current.title}
              </div>
              <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
                Welcome back, {firstName} 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Here's the difference you're making.</p>
            </div>
            <div className="shrink-0">
              <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                <p className="text-xs/relaxed opacity-90">Points Balance</p>
                <p className="text-3xl tracking-tight" style={{ fontWeight: 700 }}>
                  <AnimatedNumber value={balance} />
                </p>
              </div>
            </div>
          </div>

          {/* Level progress */}
          <div className="relative mt-6">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span style={{ fontWeight: 600 }}>{current.title}</span>
              <span>{toNext > 0 ? `${toNext.toLocaleString()} pts to ${next.title}` : "Top tier reached"}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200/70 dark:bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: duration.hero, ease: ease.standard }}
              />
            </div>
          </div>
        </GlassCard>
      </Reveal>

      {/* Impact stats */}
      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {impact.map((s) => {
          const Icon = s.icon;
          const a = accent[s.accent];
          return (
            <StaggerItem key={s.label}>
              <GlassCard className="p-5 h-full">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>
                  <AnimatedNumber value={s.value} />
                </p>
              </GlassCard>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Quick actions */}
      <Reveal>
        <h2 className="text-lg text-slate-900 dark:text-white mb-3" style={{ fontWeight: 600 }}>Quick actions</h2>
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.05}>
          {actions.map((act) => {
            const Icon = act.icon;
            const t = toneClasses[act.tone];
            return (
              <StaggerItem key={act.to}>
                <motion.button
                  onClick={() => navigate(act.to)}
                  className="w-full text-left"
                  {...pressable}
                >
                  <GlassCard className="p-5 h-full hover:border-emerald-300/50 dark:hover:border-emerald-400/20 transition-colors">
                    <div className={`w-11 h-11 ${t.bg} rounded-2xl flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${t.fg}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{act.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>
                  </GlassCard>
                </motion.button>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Reveal>

      {/* Recent activity */}
      <Reveal>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-sky-500/10 rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Recent activity</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your latest points movements</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {recent.map((e, i) => {
              const isEarn = e.type === "earn";
              return (
                <motion.div
                  key={e.id}
                  className="flex items-center gap-4 py-3"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...tFast, delay: i * 0.04 }}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isEarn ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                    {isEarn ? <Recycle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white truncate" style={{ fontWeight: 600 }}>{e.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(e.date)}</p>
                  </div>
                  <span className={`text-sm shrink-0 ${isEarn ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`} style={{ fontWeight: 700 }}>
                    {isEarn ? "+" : "-"}{e.points.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </Reveal>

      {/* Support nudge */}
      <Reveal>
        <button onClick={() => navigate("/support")} className="w-full">
          <GlassCard className="p-5 flex items-center gap-4 hover:border-emerald-300/50 dark:hover:border-emerald-400/20 transition-colors">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Need help?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reach our support team anytime.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          </GlassCard>
        </button>
      </Reveal>
    </div>
  );
}
