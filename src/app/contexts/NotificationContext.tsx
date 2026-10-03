import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  severity: NotificationSeverity;
  icon: string; // lucide icon name
  link?: string;
  read: boolean;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
  addNotification: (
    n: Omit<Notification, "id" | "timestamp" | "read"> &
      Partial<Pick<Notification, "timestamp">>,
  ) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const STORAGE_KEY = "EcoSnap.notifications.v1";

const minutesAgo = (m: number) => Date.now() - m * 60_000;

const seed: Notification[] = [
  {
    id: "n1",
    title: "SLA breach: pickup #PR-2041",
    body: "North District pickup is 14 min past SLA threshold.",
    timestamp: minutesAgo(3),
    severity: "critical",
    icon: "AlertTriangle",
    link: "/pickups",
    read: false,
  },
  {
    id: "n2",
    title: "Geofence alert",
    body: "Truck T-08 left its assigned zone (East District).",
    timestamp: minutesAgo(12),
    severity: "warning",
    icon: "MapPin",
    link: "/fleet",
    read: false,
  },
  {
    id: "n3",
    title: "Low fuel: T-14",
    body: "Fuel at 9%. Suggest routing to Central Hub.",
    timestamp: minutesAgo(28),
    severity: "warning",
    icon: "Fuel",
    link: "/fleet",
    read: false,
  },
  {
    id: "n4",
    title: "New pickup assignment",
    body: "Ahmed Hassan assigned 3 stops on Route R-21.",
    timestamp: minutesAgo(45),
    severity: "info",
    icon: "Package",
    link: "/routes",
    read: true,
  },
  {
    id: "n5",
    title: "Achievement unlocked",
    body: "Community 'GreenStreet' hit 10k bottles recycled.",
    timestamp: minutesAgo(120),
    severity: "success",
    icon: "Award",
    link: "/badges",
    read: true,
  },
  {
    id: "n6",
    title: "System update applied",
    body: "Analytics engine v2.3.1 deployed without downtime.",
    timestamp: minutesAgo(240),
    severity: "info",
    icon: "Sparkles",
    link: "/analytics",
    read: true,
  },
  {
    id: "n7",
    title: "Driver clocked in",
    body: "Sara Ahmed started shift at South Center.",
    timestamp: minutesAgo(360),
    severity: "info",
    icon: "UserCheck",
    link: "/drivers",
    read: true,
  },
];

const randomPool: Omit<Notification, "id" | "timestamp" | "read">[] = [
  {
    title: "New pickup request",
    body: "Citizen scheduled a glass pickup in West District.",
    severity: "info",
    icon: "Package",
    link: "/pickups",
  },
  {
    title: "Route delay detected",
    body: "Route R-09 is 8 min behind schedule.",
    severity: "warning",
    icon: "Route",
    link: "/routes",
  },
  {
    title: "Sensor offline",
    body: "Bin sensor B-217 has stopped reporting.",
    severity: "warning",
    icon: "WifiOff",
    link: "/alerts",
  },
  {
    title: "Recycling milestone",
    body: "Daily target 90% achieved.",
    severity: "success",
    icon: "Recycle",
    link: "/sustainability",
  },
  {
    title: "Support ticket opened",
    body: "Driver reported broken compactor.",
    severity: "info",
    icon: "LifeBuoy",
    link: "/support",
  },
];

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seed;
  });

  const idRef = useRef(1000);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const addNotification = useCallback<
    NotificationContextValue["addNotification"]
  >((n) => {
    setNotifications((prev) =>
      [
        {
          id: `n${++idRef.current}`,
          timestamp: n.timestamp ?? Date.now(),
          read: false,
          ...n,
        },
        ...prev,
      ].slice(0, 50),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Simulate live notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const pick = randomPool[Math.floor(Math.random() * randomPool.length)];
      addNotification(pick);
    }, 90_000);
    return () => clearInterval(interval);
  }, [addNotification]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    markAllRead,
    markRead,
    dismiss,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return ctx;
}
