import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Weight,
  Coins,
  Leaf,
  Package,
  TrendingUp,
  Truck,
} from "lucide-react";
import { usePickup } from "@/app/contexts/PickupContext";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";

const CO2_PER_KG = 2.5;

function AnimNum({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 1200;

  useEffect(() => {
    startRef.current = null;
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const t = Math.min((now - startRef.current) / DURATION, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setDisplay(ease * value);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <span className="tabular-nums">
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}



function ImpactCard({
  icon: Icon,
  label,
  value,
  suffix,
  sub,
  accent,
  decimals = 0,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  sub?: string;
  accent: string;
  decimals?: number;
  delay?: number;
}) {
  const a = accentMap[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
    >
      <GlassCard className="p-5 relative overflow-hidden">
        <div className={`absolute -top-8 -right-8 w-24 h-24 ${a.bg} rounded-full blur-2xl opacity-50 pointer-events-none`} />
        <div className="relative flex items-start justify-between mb-3">
          <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${a.fg}`} />
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="relative">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
              <AnimNum value={value} decimals={decimals} />
            </span>
            {suffix && <span className="text-sm text-slate-500 dark:text-slate-400">{suffix}</span>}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
          {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function LogisticsImpactPage() {
  const { requests } = usePickup();

  const completedRequests = requests.filter((r) => r.status === "Completed");
  const activeRequests = requests.filter(
    (r) => r.status === "Pending" || r.status === "In Progress"
  );

  const totalWeightKg = completedRequests.reduce((sum, r) => {
    const items = (r as any).items as { expectedWeightKg?: number }[] | undefined;
    const detected = (r as any).validation?.detectedWeightKg as number | undefined;
    const itemsSum = items ? items.reduce((s, i) => s + (i.expectedWeightKg ?? 0), 0) : 0;
    return sum + (detected ?? itemsSum);
  }, 0);

  const co2SavedKg = totalWeightKg * CO2_PER_KG;
  const lifetimeEarned = 12480;
  const busyDrivers = 4;
  const availableDrivers = 8;

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Logistics & Impact</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Live impact dashboard for collection operations</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Live</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <ImpactCard
          icon={Package}
          label="Active Requests"
          value={activeRequests.length}
          sub={`${completedRequests.length} completed`}
          accent="sky"
          delay={0}
        />
        <ImpactCard
          icon={Weight}
          label="Total Weight Collected"
          value={totalWeightKg}
          suffix="kg"
          sub="Completed pickups only"
          accent="emerald"
          decimals={1}
          delay={0.05}
        />
        <ImpactCard
          icon={Coins}
          label="Points Distributed"
          value={lifetimeEarned}
          suffix="pts"
          sub="All-time wallet earned"
          accent="amber"
          delay={0.1}
        />
        <ImpactCard
          icon={Leaf}
          label="CO₂ Saved"
          value={co2SavedKg}
          suffix="kg"
          sub={`@ ${CO2_PER_KG}kg CO₂ per kg`}
          accent="lime"
          decimals={1}
          delay={0.15}
        />
        <ImpactCard
          icon={Truck}
          label="Drivers On Route"
          value={busyDrivers}
          sub={`${availableDrivers} available`}
          accent="violet"
          delay={0.2}
        />
        <ImpactCard
          icon={TrendingUp}
          label="Completion Rate"
          value={requests.length > 0 ? Math.round((completedRequests.length / requests.length) * 100) : 0}
          suffix="%"
          sub={`${completedRequests.length}/${requests.length} pickups`}
          accent="rose"
          delay={0.25}
        />
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Operations Snapshot</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Current state of the logistics fleet</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pickups Pending</p>
            <p className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
              {activeRequests.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Awaiting dispatch or in motion</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Collections</p>
            <p className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
              {completedRequests.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Successfully completed</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">CO₂ Equivalent</p>
            <p className="text-3xl tracking-tight text-emerald-600 dark:text-emerald-400" style={{ fontWeight: 600 }}>
              <AnimNum value={co2SavedKg} decimals={1} /> kg
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Avoided through recycling</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
