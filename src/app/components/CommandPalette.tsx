import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { canAccess } from "@/app/utils/roleAccess";
import {
  Search,
  CornerDownLeft,
  ArrowDown,
  ArrowUp,
  LayoutDashboard,
  Package,
  Route,
  Users,
  Map as MapIcon,
  AlertTriangle,
  BarChart3,
  Building2,
  Recycle,
  LifeBuoy,
  UserCircle2,
  Globe2,
  TrendingUp,
  Award,
  Trophy,
  ShieldCheck,
  Gauge,
  FileText,
  CreditCard,
  ClipboardList,
  Settings,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Clock,
  Command as CommandIcon,
  ScanLine,
  Gift,
  Truck,
  History,
  User as UserIcon,
} from "lucide-react";

interface Item {
  id: string;
  label: string;
  hint?: string;
  icon: any;
  section: "Pages" | "Actions" | "Recent";
  run: () => void;
  keywords?: string;
}

const ROUTE_ITEMS: { to: string; label: string; icon: any; keywords?: string }[] = [
  { to: "/portal", label: "Home (Portal)", icon: LayoutDashboard, keywords: "home portal citizen" },
  { to: "/overview", label: "Overview", icon: LayoutDashboard, keywords: "home dashboard operations" },
  { to: "/pickups", label: "Pickup Requests", icon: Package },
  { to: "/routes", label: "Routes", icon: Route },
  { to: "/drivers", label: "Drivers", icon: Users },
  { to: "/fleet", label: "Fleet Map", icon: MapIcon },
  { to: "/alerts", label: "Smart Alerts", icon: AlertTriangle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/centers", label: "Centers", icon: Building2 },
  { to: "/centers-list", label: "Centers List", icon: Building2 },
  { to: "/resources", label: "Resources", icon: Recycle },
  { to: "/support", label: "Support Tickets", icon: LifeBuoy },
  { to: "/citizen-stats", label: "Citizen Stats", icon: UserCircle2 },
  { to: "/communities", label: "Communities", icon: Globe2 },
  { to: "/citizen-levels", label: "Levels & Progression", icon: TrendingUp },
  { to: "/badges", label: "Badges & Achievements", icon: Award },
  { to: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { to: "/permissions", label: "Permissions", icon: ShieldCheck },
  { to: "/performance", label: "Performance", icon: Gauge },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/partners", label: "Partners (B2B)", icon: CreditCard },
  { to: "/audit", label: "Audit Log", icon: ClipboardList },
  { to: "/activity-log", label: "Activity Log", icon: ClipboardList },
  { to: "/zones", label: "Zones", icon: MapIcon },
  { to: "/sustainability", label: "Sustainability", icon: Recycle },
  { to: "/schedule", label: "Schedule", icon: Clock },
  { to: "/ai-validation", label: "AI Validation", icon: Sparkles },
  { to: "/verification", label: "Verification Station", icon: ScanLine },
  { to: "/rewards", label: "Rewards & Prizes", icon: Gift },
  { to: "/logistics", label: "Logistics Impact", icon: Truck },
  { to: "/driver-home", label: "Driver Hub", icon: Truck },
  { to: "/employee-history", label: "Employee History", icon: History },
  { to: "/employee-profile", label: "Employee Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
];

const RECENT_KEY = "EcoSnap.recentRoutes.v1";

function fuzzy(haystack: string, needle: string): number {
  if (!needle) return 1;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (h.includes(n)) return 2 + (h.startsWith(n) ? 1 : 0);
  let hi = 0;
  let matched = 0;
  for (let ni = 0; ni < n.length; ni++) {
    while (hi < h.length && h[hi] !== n[ni]) hi++;
    if (hi >= h.length) return 0;
    matched++;
    hi++;
  }
  return matched === n.length ? 1 : 0;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const role = user?.role ?? "citizen";

  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  // Track route changes for "Recent"
  useEffect(() => {
    setRecent((prev) => {
      const next = [location.pathname, ...prev.filter((p) => p !== location.pathname)].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [location.pathname]);

  // Global hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const go = useCallback(
    (to: string) => {
      navigate(to);
      setOpen(false);
    },
    [navigate],
  );

  const actions: Item[] = useMemo(
    () => [
      {
        id: "action.theme",
        label: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        hint: "Toggle dark mode",
        icon: resolvedTheme === "dark" ? Sun : Moon,
        section: "Actions",
        run: () => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
          toast.success(`Theme: ${resolvedTheme === "dark" ? "light" : "dark"}`);
          setOpen(false);
        },
        keywords: "theme dark light mode",
      },
      {
        id: "action.signout",
        label: "Sign out",
        hint: "End the session",
        icon: LogOut,
        section: "Actions",
        run: () => {
          logout();
          toast.success("Signed out");
          setOpen(false);
          navigate("/login", { replace: true });
        },
      },
      {
        id: "action.settings",
        label: "Open Settings",
        icon: Settings,
        section: "Actions",
        run: () => go("/settings"),
      },
    ],
    [resolvedTheme, setTheme, go, logout, navigate],
  );

  const items: Item[] = useMemo(() => {
    const accessibleRoutes = ROUTE_ITEMS.filter((r) => canAccess(role, r.to));

    const pages: Item[] = accessibleRoutes.map((r) => ({
      id: `page.${r.to}`,
      label: r.label,
      hint: r.to,
      icon: r.icon,
      section: "Pages",
      keywords: r.keywords,
      run: () => go(r.to),
    }));

    const recentItems: Item[] = recent
      .map((path) => accessibleRoutes.find((r) => r.to === path))
      .filter(Boolean)
      .map((r) => ({
        id: `recent.${r!.to}`,
        label: r!.label,
        hint: r!.to,
        icon: r!.icon,
        section: "Recent" as const,
        run: () => go(r!.to),
      }));

    return [...recentItems, ...actions, ...pages];
  }, [actions, recent, go, role]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    return items
      .map((it) => ({ it, score: Math.max(fuzzy(it.label, query), fuzzy(it.keywords ?? "", query) * 0.5) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.it);
  }, [items, query]);

  // Group for display while preserving overall order
  const grouped = useMemo(() => {
    const groups: { section: Item["section"]; items: Item[] }[] = [];
    for (const it of filtered) {
      let g = groups.find((x) => x.section === it.section);
      if (!g) {
        g = { section: it.section, items: [] };
        groups.push(g);
      }
      g.items.push(it);
    }
    return groups;
  }, [filtered]);

  // Flat list aligned with grouped order, for keyboard nav
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flat[activeIdx]?.run();
    }
  };

  const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-[10vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white/90 dark:bg-[#0a0e14]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.25)] rounded-3xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search pages, run actions…"
                className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 h-6 text-[10px] rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                <CommandIcon className="w-3 h-3" />
                {isMac ? "K" : "Ctrl K"}
              </kbd>
            </div>

            <div className="max-h-[55vh] overflow-y-auto py-2">
              {grouped.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  No results for "{query}"
                </div>
              )}
              {grouped.map((group) => (
                <div key={group.section} className="py-1">
                  <div className="px-5 pt-2 pb-1 text-[10px] uppercase tracking-[2px] text-slate-400 dark:text-white/40" style={{ fontWeight: 700 }}>
                    {group.section}
                  </div>
                  {group.items.map((it) => {
                    const idx = flat.indexOf(it);
                    const active = idx === activeIdx;
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.id}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => it.run()}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                          active
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            active
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                              : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate" style={{ fontWeight: 600 }}>
                            {it.label}
                          </div>
                          {it.hint && (
                            <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{it.hint}</div>
                          )}
                        </div>
                        {active && <CornerDownLeft className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  <ArrowDown className="w-3 h-3" /> navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> select
                </span>
                <span>esc to close</span>
              </div>
              <span>{flat.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
