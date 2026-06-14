import { useState } from "react";
import { useNavigate } from "react-router";
import * as Popover from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  AlertTriangle,
  MapPin,
  Fuel,
  Package,
  Award,
  Sparkles,
  UserCheck,
  Route,
  WifiOff,
  Recycle,
  LifeBuoy,
  Check,
  X,
  CheckCheck,
} from "lucide-react";
import { useNotifications, type Notification } from "@/app/contexts/NotificationContext";

const iconMap: Record<string, any> = {
  AlertTriangle,
  MapPin,
  Fuel,
  Package,
  Award,
  Sparkles,
  UserCheck,
  Route,
  WifiOff,
  Recycle,
  LifeBuoy,
};

const severityStyles: Record<string, { ring: string; bg: string; fg: string }> = {
  critical: { ring: "ring-rose-400/40", bg: "bg-rose-500/10", fg: "text-rose-600 dark:text-rose-400" },
  warning: { ring: "ring-amber-400/40", bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
  success: { ring: "ring-emerald-400/40", bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
  info: { ring: "ring-sky-400/40", bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400" },
};

function relativeTime(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, markRead, dismiss } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleClick = (n: Notification) => {
    markRead(n.id);
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/60 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0a0e14]"
              style={{ fontWeight: 700 }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          className="z-[60] w-[380px] max-w-[calc(100vw-1rem)] bg-white/95 dark:bg-[#0a0e14]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.18)] rounded-3xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 className="text-slate-900 dark:text-white text-sm" style={{ fontWeight: 600 }}>
                Notifications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {unreadCount} unread · {notifications.length} total
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                style={{ fontWeight: 600 }}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {notifications.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  You are all caught up.
                </div>
              )}
              {notifications.map((n) => {
                const Icon = iconMap[n.icon] || Bell;
                const s = severityStyles[n.severity];
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`group relative flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors border-b border-slate-50 dark:border-white/[0.04] ${
                      !n.read ? "bg-emerald-50/40 dark:bg-emerald-500/[0.04]" : ""
                    }`}
                    onClick={() => handleClick(n)}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} ${s.fg} ring-1 ${s.ring}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className="text-sm text-slate-900 dark:text-white truncate"
                          style={{ fontWeight: 600 }}
                        >
                          {n.title}
                        </h4>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {relativeTime(n.timestamp)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead(n.id);
                          }}
                          title="Mark read"
                          className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 flex items-center justify-center text-slate-500 dark:text-slate-300"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismiss(n.id);
                        }}
                        title="Dismiss"
                        className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-rose-100 dark:hover:bg-rose-500/20 flex items-center justify-center text-slate-500 dark:text-slate-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
