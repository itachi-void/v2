import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Gift,
  Coins,
  Ticket,
  Coffee,
  ShoppingBag,
  Leaf,
  Bus,
  Smartphone,
  Search,
  Check,
  Sparkles,
  History,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useRoleContext } from "@/contexts/RoleContext";
import { GlassCard } from "@/app/components/GlassCard";
import { useRepository } from "@/app/hooks/useRepository";
import {
  PointsLedgerRepository,
  computeBalance,
  type PointsEntry,
} from "@/app/repositories/RewardsRepository";

type RewardCategory = "voucher" | "donation" | "transport" | "product";

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: any;
  category: RewardCategory;
  stock: number;
}

const rewardsData: Reward[] = [
  { id: "rwd-001", name: "Coffee Voucher", description: "Free coffee at partner cafés", cost: 500, icon: Coffee, category: "voucher", stock: 120 },
  { id: "rwd-002", name: "Grocery Discount", description: "10% off at EcoMarket stores", cost: 1200, icon: ShoppingBag, category: "voucher", stock: 80 },
  { id: "rwd-003", name: "Plant a Tree", description: "Donate points to plant a tree in your name", cost: 800, icon: Leaf, category: "donation", stock: 9999 },
  { id: "rwd-004", name: "Metro Day Pass", description: "Free single-day public transport pass", cost: 1500, icon: Bus, category: "transport", stock: 50 },
  { id: "rwd-005", name: "Cinema Ticket", description: "One ticket at partner cinemas", cost: 2000, icon: Ticket, category: "voucher", stock: 35 },
  { id: "rwd-006", name: "Mobile Credit", description: "EGP 25 mobile recharge", cost: 1800, icon: Smartphone, category: "product", stock: 60 },
  { id: "rwd-007", name: "Eco Tote Bag", description: "Reusable EcoVision branded tote bag", cost: 600, icon: ShoppingBag, category: "product", stock: 200 },
  { id: "rwd-008", name: "Charity Donation", description: "Donate points to local clean-up funds", cost: 1000, icon: Gift, category: "donation", stock: 9999 },
];

const rewardById = new Map(rewardsData.map((r) => [r.id, r]));

const categoryAccent: Record<RewardCategory, { bg: string; fg: string; label: string }> = {
  voucher: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400", label: "Voucher" },
  donation: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400", label: "Donation" },
  transport: { bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400", label: "Transport" },
  product: { bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400", label: "Product" },
};

/** Fallback ledger used when the backend is unreachable so the page still demos. */
const SEED_LEDGER: PointsEntry[] = [
  { id: "led-001", type: "earn", label: "Recycled 420 bottles", points: 8400, date: "2026-05-02" },
  { id: "led-002", type: "earn", label: "Weekly streak bonus", points: 1500, date: "2026-05-20" },
  { id: "led-003", type: "earn", label: "Recycled 260 bottles", points: 5200, date: "2026-06-01" },
  { id: "led-004", type: "redeem", label: "Coffee Voucher", points: 500, date: "2026-06-04", rewardId: "rwd-001" },
  { id: "led-005", type: "redeem", label: "Eco Tote Bag", points: 600, date: "2026-06-08", rewardId: "rwd-007" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function RewardsPage() {
  const { currentRole: _r } = useRoleContext();
  const { rows, status, create } = useRepository<PointsEntry>(PointsLedgerRepository);

  // Locally-created redemptions so the demo keeps working even with no backend.
  const [localEntries, setLocalEntries] = useState<PointsEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | RewardCategory>("all");

  // Prefer real backend rows; fall back to seed when the request failed/empty.
  const baseLedger = rows.length > 0 ? rows : SEED_LEDGER;
  const ledger = useMemo(() => [...baseLedger, ...localEntries], [baseLedger, localEntries]);

  const balance = useMemo(() => computeBalance(ledger), [ledger]);
  const earnedTotal = useMemo(
    () => ledger.filter((e) => e.type === "earn").reduce((s, e) => s + e.points, 0),
    [ledger]
  );
  const redemptions = useMemo(
    () => ledger.filter((e) => e.type === "redeem").sort((a, b) => b.date.localeCompare(a.date)),
    [ledger]
  );
  const spentTotal = redemptions.reduce((s, e) => s + e.points, 0);

  const filtered = useMemo(
    () =>
      rewardsData.filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = filterCategory === "all" || r.category === filterCategory;
        return matchesSearch && matchesCat;
      }),
    [searchTerm, filterCategory]
  );

  const handleRedeem = (reward: Reward) => {
    if (balance < reward.cost) {
      toast.error("Not enough points to redeem this reward");
      return;
    }
    const entry: PointsEntry = {
      id: `led-${Date.now()}`,
      type: "redeem",
      label: reward.name,
      points: reward.cost,
      date: new Date().toISOString().slice(0, 10),
      rewardId: reward.id,
    };
    // Optimistic local update keeps the UI responsive offline…
    setLocalEntries((prev) => [...prev, entry]);
    // …while the repository persists to the backend (with retry/cache/telemetry).
    create(entry).then((res) => {
      if (!res.ok) {
        toast.warning("Saved locally — sync will retry when the server is reachable");
      }
    });
    toast.success(`Redeemed "${reward.name}" for ${reward.cost.toLocaleString()} points`);
  };

  const stats = [
    { label: "Available Points", value: balance.toLocaleString(), icon: Coins, accent: "amber" },
    { label: "Total Earned", value: earnedTotal.toLocaleString(), icon: Sparkles, accent: "emerald" },
    { label: "Redeemed", value: redemptions.length, icon: Check, accent: "sky" },
    { label: "Points Spent", value: spentTotal.toLocaleString(), icon: Gift, accent: "violet" },
  ];

  const statAccent: Record<string, { bg: string; fg: string }> = {
    emerald: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
    sky: { bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400" },
    amber: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
    violet: { bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400" },
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
          <Gift className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Rewards Store</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Redeem the points you earned from recycling
            {status === "loading" && " · syncing balance…"}
            {status === "error" && " · offline preview"}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const a = statAccent[stat.accent];
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>{stat.value}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
            <option value="all">All Categories</option>
            <option value="voucher">Voucher</option>
            <option value="donation">Donation</option>
            <option value="transport">Transport</option>
            <option value="product">Product</option>
          </select>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((reward, i) => {
          const Icon = reward.icon;
          const cA = categoryAccent[reward.category];
          const affordable = balance >= reward.cost;
          const alreadyRedeemed = redemptions.some((e) => e.rewardId === reward.id);
          return (
            <motion.div key={reward.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}>
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${cA.bg} rounded-2xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${cA.fg}`} />
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${cA.bg} ${cA.fg}`} style={{ fontWeight: 600 }}>{cA.label}</span>
                </div>
                <h3 className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{reward.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4 flex-1">{reward.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>{reward.cost.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">pts</span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{reward.stock > 1000 ? "Unlimited" : `${reward.stock} left`}</span>
                </div>
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!affordable}
                  className={`w-full h-10 rounded-full text-sm transition-colors flex items-center justify-center gap-2 ${
                    affordable
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {alreadyRedeemed ? (
                    <>
                      <RotateCcw className="w-4 h-4" /> Redeem again
                    </>
                  ) : affordable ? (
                    <>
                      <Gift className="w-4 h-4" /> Redeem
                    </>
                  ) : (
                    "Not enough points"
                  )}
                </button>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-sky-500/10 rounded-2xl flex items-center justify-center">
              <History className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Redemption History</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rewards you've previously redeemed</p>
            </div>
          </div>

          {redemptions.length === 0 ? (
            <div className="text-center py-10">
              <Gift className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No redemptions yet — redeem a reward to see it here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {redemptions.map((entry) => {
                const reward = entry.rewardId ? rewardById.get(entry.rewardId) : undefined;
                const cA = reward ? categoryAccent[reward.category] : categoryAccent.voucher;
                const Icon = reward?.icon ?? Gift;
                return (
                  <div key={entry.id} className="flex items-center gap-4 py-3">
                    <div className={`w-11 h-11 ${cA.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${cA.fg}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-white truncate" style={{ fontWeight: 600 }}>{entry.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(entry.date)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <span className="text-sm" style={{ fontWeight: 700 }}>-{entry.points.toLocaleString()}</span>
                      <span className="text-xs">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
