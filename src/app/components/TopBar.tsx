import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import NotificationBell from "./NotificationBell";
import LanguageToggle from "./LanguageToggle";
import PremiumAuthButton from "./PremiumLogoutButton";
import { useAuth, type Role } from "@/app/contexts/AuthContext";
import { canAccess, homePathForRole } from "@/app/utils/roleAccess";
import { springLayout } from "@/app/constants/motion";
import {
  ChevronDown,
  Search,
  Menu,
  X,
  Settings,
  User as UserIcon,
  Repeat,
  Map as MapIcon,
  BarChart3,
  Users,
  Package,
  Route,
  AlertTriangle,
  LayoutDashboard,
  LineChart,
  Building2,
  Recycle,
  LifeBuoy,
  UserCircle2,
  Globe2,
  Award,
  Trophy,
  Gift,
  TrendingUp,
  CreditCard,
  Gauge,
  FileText,
  ClipboardList,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  Clock,
  Truck,
  Leaf,
  Activity,
  Sparkles,
  ScanLine,
  History,
  Home,
} from "lucide-react";

// Main tabs - Core Operations (reduced from 7 to 5 for better focus)
const mainTabs = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/pickups", label: "Pickups", icon: Package },
  { to: "/routes", label: "Routes", icon: Route },
  { to: "/fleet", label: "Fleet", icon: MapIcon },
  { to: "/drivers", label: "Drivers", icon: Users },
];

// Restructured dropdown — clearer categorization, reduced cognitive load
const moreGroups: {
  title: string;
  items: { to: string; label: string; icon: any }[];
}[] = [
  {
    title: "Network",
    items: [
      { to: "/centers", label: "Centers", icon: Building2 },
      { to: "/centers-list", label: "Centers List", icon: Building2 },
      { to: "/zones", label: "Zones", icon: MapIcon },
      { to: "/communities", label: "Communities", icon: Globe2 },
      { to: "/partners", label: "Partners", icon: CreditCard },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/schedule", label: "Schedule", icon: Clock },
      { to: "/verification", label: "Verification Station", icon: ScanLine },
      { to: "/logistics", label: "Logistics Impact", icon: Truck },
    ],
  },
  {
    title: "Insights",
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/alerts", label: "Smart Alerts", icon: AlertTriangle },
      { to: "/performance", label: "Performance", icon: Gauge },
      { to: "/reports", label: "Reports", icon: FileText },
      { to: "/sustainability", label: "Sustainability", icon: Leaf },
    ],
  },
  {
    title: "Engagement",
    items: [
      { to: "/citizen-levels", label: "Levels", icon: TrendingUp },
      { to: "/badges", label: "Badges", icon: Award },
      { to: "/leaderboards", label: "Leaderboards", icon: Trophy },
      { to: "/rewards", label: "Rewards", icon: Gift },
      { to: "/citizen-stats", label: "Citizen Stats", icon: UserCircle2 },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/resources", label: "Resources", icon: Recycle },
      { to: "/ai-validation", label: "AI Validation", icon: Sparkles },
      { to: "/activity-log", label: "Activity Log", icon: Activity },
      { to: "/permissions", label: "Permissions", icon: ShieldCheck },
      { to: "/audit", label: "Audit Log", icon: ClipboardList },
      { to: "/support", label: "Support", icon: LifeBuoy },
    ],
  },
];

const moreItemsFlat = moreGroups.flatMap((g) => g.items);

export default function TopBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [logoutAnimating, setLogoutAnimating] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [userMenuPos, setUserMenuPos] = useState<{
    top: number;
    right: number;
  }>({ top: 0, right: 0 });
  const [morePos, setMorePos] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 720 });
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout, setRole } = useAuth();
  const role: Role = user?.role ?? "citizen";

  const visibleMainTabs = [
    // Citizens get a personalized portal as their home instead of /overview.
    ...(role === "citizen"
      ? [{ to: "/portal", label: "Home", icon: Home }]
      : []),
    // Drivers get a dedicated operational overview as their home.
    ...(role === "driver"
      ? [{ to: "/driver-home", label: "Home", icon: Home }]
      : []),
    // Employees: verification station + their history & profile.
    ...(role === "employee"
      ? [
          { to: "/verification", label: "Station", icon: ScanLine },
          { to: "/employee-history", label: "History", icon: History },
          { to: "/employee-profile", label: "Profile", icon: UserCircle2 },
        ]
      : []),
    ...mainTabs.filter((t) => canAccess(role, t.to)),
  ];
  const visibleMoreGroups = moreGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => canAccess(role, i.to)) }))
    .filter((g) => g.items.length > 0);
  const visibleMoreFlat = visibleMoreGroups.flatMap((g) => g.items);

  useEffect(() => {
    setMoreOpen(false);
    setMobileOpen(false);
    if (!logoutAnimating) setUserOpen(false);
  }, [location.pathname, logoutAnimating]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      // The More mega-menu is portaled — treat clicks inside it (or its trigger) as inside.
      const insideMore =
        (moreRef.current && moreRef.current.contains(target)) ||
        (moreMenuRef.current && moreMenuRef.current.contains(target));
      if (!insideMore) setMoreOpen(false);
      // The user menu is rendered through a portal, so an in-menu click is not
      // inside userRef — check the portaled menu element too.
      const insideUser =
        (userRef.current && userRef.current.contains(target)) ||
        (userMenuRef.current && userMenuRef.current.contains(target));
      if (!logoutAnimating && !insideUser) setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [logoutAnimating]);

  // Position the portaled user menu just under its trigger, right-aligned.
  useEffect(() => {
    if (!userOpen) return;
    const update = () => {
      const r = userRef.current?.getBoundingClientRect();
      if (r)
        setUserMenuPos({
          top: r.bottom + 8,
          right: window.innerWidth - r.right,
        });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [userOpen]);

  // Position the portaled More mega-menu under its trigger, clamped to viewport.
  useEffect(() => {
    if (!moreOpen) return;
    const update = () => {
      const r = moreRef.current?.getBoundingClientRect();
      if (!r) return;
      const cols = Math.min(visibleMoreGroups.length, 3) || 1;
      const width = Math.min(cols * 240, window.innerWidth - 16);
      // Right-align to the trigger, then clamp so it never leaves the viewport.
      let left = r.right - width;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      setMorePos({ top: r.bottom + 8, left, width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [moreOpen, visibleMoreGroups.length]);

  const moreActive = visibleMoreFlat.some((m) =>
    location.pathname.startsWith(m.to),
  );

  const initials = (user?.name ?? "?")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleAccents: Record<Role, { bg: string; fg: string; label: string }> = {
    admin: {
      bg: "bg-emerald-500/15",
      fg: "text-emerald-700 dark:text-emerald-300",
      label: "Admin",
    },
    manager: {
      bg: "bg-teal-500/15",
      fg: "text-teal-700 dark:text-teal-300",
      label: "Manager",
    },
    driver: {
      bg: "bg-amber-500/15",
      fg: "text-amber-700 dark:text-amber-300",
      label: "Driver",
    },
    citizen: {
      bg: "bg-violet-500/15",
      fg: "text-violet-700 dark:text-violet-300",
      label: "Citizen",
    },
    employee: {
      bg: "bg-fuchsia-500/15",
      fg: "text-fuchsia-700 dark:text-fuchsia-300",
      label: "Employee",
    },
  };
  const rAcc = roleAccents[role];

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  const handleSwitchRole = (r: Role) => {
    setRole(r);
    setUserOpen(false);
    toast.info(`Switched to ${roleAccents[r].label}`);
    if (!canAccess(r, location.pathname)) {
      navigate(homePathForRole(r), { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-[#0a0e14]/85 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1600px] mx-auto flex items-center gap-4 px-4 md:px-6 h-16">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          className="md:hidden w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-600 dark:text-white/70"
        >
          {mobileOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>

        <NavLink
          to="/landing"
          className="flex items-center gap-2.5"
          title="View landing page"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/30">
            <div className="w-3.5 h-3.5 bg-white rounded-full" />
          </div>
          <span className="font-black tracking-wider text-slate-900 dark:text-white text-sm">
            EcoSnap
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1 mx-auto bg-slate-100/70 dark:bg-white/[0.04] p-1 rounded-full border border-slate-200/60 dark:border-white/5">
          {visibleMainTabs.map((t) => {
            const active =
              location.pathname === t.to ||
              location.pathname.startsWith(`${t.to}/`);
            return (
              <NavLink
                key={t.to}
                to={t.to}
                className={`relative px-3.5 py-1.5 text-xs font-bold tracking-wide rounded-full transition-colors duration-150 ${
                  active
                    ? "text-white dark:text-slate-900"
                    : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="topbar-active-tab"
                    className="absolute inset-0 rounded-full bg-slate-900 dark:bg-white shadow-sm"
                    transition={springLayout}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </NavLink>
            );
          })}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold tracking-wide rounded-full transition-all ${
                moreActive || moreOpen
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              More
              <ChevronDown
                className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {moreOpen &&
              createPortal(
                <div
                  ref={moreMenuRef}
                  className="fixed bg-white/95 dark:bg-[#0a0e14]/80 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden z-[200]"
                  style={{
                    top: morePos.top,
                    left: morePos.left,
                    width: morePos.width,
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-slate-400 dark:text-white/40">
                      Secondary Operations & Citizens Control
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-cyan-600 dark:text-cyan-400">
                      EcoSnap Smart Systems
                    </span>
                  </div>

                  {/* Adaptive column grid */}
                  <div
                    className="grid gap-6 px-6 py-5"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(visibleMoreGroups.length, 3)}, minmax(0, 1fr))`,
                    }}
                  >
                    {visibleMoreGroups.map((group) => (
                      <div key={group.title}>
                        <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-cyan-600 dark:text-cyan-400 mb-3">
                          {group.title}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {group.items.map((m) => (
                            <NavLink
                              key={m.to}
                              to={m.to}
                              className={({ isActive }) =>
                                `flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all ${
                                  isActive
                                    ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                                    : "text-slate-700 dark:text-white/75 hover:bg-slate-50 dark:hover:bg-white/5"
                                }`
                              }
                            >
                              <m.icon className="w-4 h-4 text-slate-400 dark:text-white/40 shrink-0" />
                              <span className="text-xs font-semibold truncate">
                                {m.label}
                              </span>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Wavy decoration + logout */}
                  <div className="relative h-16 border-t border-slate-100 dark:border-white/5">
                    {/* Wave is clipped on its own layer so it can't crop the button */}
                    <div className="absolute inset-0 overflow-hidden rounded-b-3xl pointer-events-none">
                      <svg
                        className="absolute inset-x-0 bottom-0 w-full h-full"
                        viewBox="0 0 720 64"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0,40 C120,10 240,55 360,32 C480,10 600,50 720,28 L720,64 L0,64 Z"
                          fill="rgba(34,211,238,0.10)"
                        />
                        <path
                          d="M0,46 C140,22 260,58 380,40 C500,22 620,55 720,38"
                          fill="none"
                          stroke="rgba(34,211,238,0.45)"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M0,52 C150,32 280,62 400,48 C520,34 640,60 720,46"
                          fill="none"
                          stroke="rgba(132,204,22,0.4)"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PremiumAuthButton
                        theme="light"
                        variant="logout"
                        accent="#f43f5e"
                        onLogout={handleLogout}
                      />
                    </div>
                  </div>
                </div>,
                document.body,
              )}
          </div>
        </nav>

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <button className="hidden sm:flex w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 items-center justify-center text-slate-500 dark:text-white/60">
            <Search className="w-4 h-4" />
          </button>
          <LanguageToggle />
          <NotificationBell />
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/60 transition-colors"
            title={
              resolvedTheme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/60"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="relative ml-1" ref={userRef}>
            <button
              onClick={() => setUserOpen((o) => !o)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-[10px] flex items-center justify-center"
                style={{ fontWeight: 700 }}
              >
                {initials || "?"}
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span
                  className="text-xs text-slate-900 dark:text-white"
                  style={{ fontWeight: 600 }}
                >
                  {user?.name ?? "Guest"}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${rAcc.bg} ${rAcc.fg}`}
                  style={{ fontWeight: 700 }}
                >
                  {rAcc.label}
                </span>
              </div>
              <ChevronDown
                className={`w-3 h-3 text-slate-500 dark:text-white/60 transition-transform ${userOpen ? "rotate-180" : ""}`}
              />
            </button>

            {userOpen &&
              createPortal(
                <div
                  ref={userMenuRef}
                  className="fixed w-64 bg-white/95 dark:bg-[#0a0e14]/80 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 z-[200]"
                  style={{ top: userMenuPos.top, right: userMenuPos.right }}
                >
                  <div className="p-4 border-b border-slate-100 dark:border-white/5">
                    <div
                      className="text-sm text-slate-900 dark:text-white truncate"
                      style={{ fontWeight: 600 }}
                    >
                      {user?.name ?? "Guest"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-white/60 truncate">
                      {user?.email}
                    </div>
                    <span
                      className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full ${rAcc.bg} ${rAcc.fg}`}
                      style={{ fontWeight: 700 }}
                    >
                      {rAcc.label}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setUserOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <UserIcon className="w-4 h-4" /> Profile
                    </button>
                    <button
                      onClick={() => {
                        setUserOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    {role === "admin" && (
                      <div
                        className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[1.5px] text-slate-400 dark:text-white/40"
                        style={{ fontWeight: 700 }}
                      >
                        Switch role (demo)
                      </div>
                    )}
                    {role === "admin" &&
                      (
                        [
                          "admin",
                          "manager",
                          "driver",
                          "employee",
                          "citizen",
                        ] as Role[]
                      ).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleSwitchRole(r)}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-white/5 ${
                            r === role
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-600 dark:text-white/70"
                          }`}
                        >
                          <Repeat className="w-3.5 h-3.5" />
                          {roleAccents[r].label}
                          {r === role && (
                            <span
                              className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400"
                              style={{ fontWeight: 700 }}
                            >
                              active
                            </span>
                          )}
                        </button>
                      ))}
                    <div className="my-1 border-t border-slate-100 dark:border-white/5" />
                    <div className="flex justify-center py-2">
                      <PremiumAuthButton
                        variant="logout"
                        theme={resolvedTheme === "dark" ? "dark" : "light"}
                        onLogout={() => {
                          setUserOpen(false);
                          handleLogout();
                        }}
                      />
                    </div>
                  </div>
                </div>,
                document.body,
              )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[60] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "tween", duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white/90 dark:bg-[#0a0e14]/85 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 shadow-2xl overflow-y-auto"
            >
              <div className="p-4 pt-6 space-y-1">
                <div
                  className="text-[10px] uppercase tracking-[2px] text-slate-400 dark:text-white/40 px-2 pb-2"
                  style={{ fontWeight: 700 }}
                >
                  Main
                </div>
                {visibleMainTabs.map((t) => (
                  <NavLink
                    key={t.to}
                    to={t.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors text-sm ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`
                    }
                  >
                    <t.icon className="w-4 h-4" />
                    <span style={{ fontWeight: 600 }}>{t.label}</span>
                  </NavLink>
                ))}
                {visibleMoreGroups.map((g) => (
                  <div key={g.title} className="pt-3">
                    <div
                      className="text-[10px] uppercase tracking-[2px] text-slate-400 dark:text-white/40 px-2 pb-1"
                      style={{ fontWeight: 700 }}
                    >
                      {g.title}
                    </div>
                    {g.items.map((m) => (
                      <NavLink
                        key={m.to}
                        to={m.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-2xl transition-colors text-sm ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                          }`
                        }
                      >
                        <m.icon className="w-4 h-4" />
                        <span style={{ fontWeight: 600 }}>{m.label}</span>
                      </NavLink>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
