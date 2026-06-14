import { create } from "zustand";

export type ActivityCategory = "route" | "driver" | "citizen" | "alert" | "collection" | "system";
export type ActivitySeverity = "low" | "medium" | "high";

export interface Activity {
  id: string;
  action: string;
  details: string;
  user: string;
  userRole: string;
  target: string;
  category: ActivityCategory;
  severity: ActivitySeverity;
  timestamp: number;
}

interface ActivityStore {
  activities: Activity[];
  logActivity: (a: Omit<Activity, "id" | "timestamp">) => void;
}

const seed: Activity[] = [
  { id: "a1", action: "Route Updated", details: "Downtown route adjusted for traffic", user: "System", userRole: "admin", target: "Route", category: "route", severity: "low", timestamp: Date.now() - 1000 * 60 * 5 },
  { id: "a2", action: "Driver Dispatched", details: "Mike Tyson assigned to REQ-102", user: "Dispatcher", userRole: "admin", target: "Mike Tyson", category: "driver", severity: "medium", timestamp: Date.now() - 1000 * 60 * 12 },
  { id: "a3", action: "New Pickup Request", details: "Citizen Sarah J. submitted a pickup", user: "Sarah J.", userRole: "citizen", target: "REQ-102", category: "citizen", severity: "low", timestamp: Date.now() - 1000 * 60 * 24 },
  { id: "a4", action: "Capacity Alert", details: "Riverside zone reached 85% capacity", user: "System", userRole: "admin", target: "Riverside", category: "alert", severity: "high", timestamp: Date.now() - 1000 * 60 * 40 },
  { id: "a5", action: "Collection Completed", details: "REQ-104 delivered to processing", user: "Omar S.", userRole: "driver", target: "REQ-104", category: "collection", severity: "low", timestamp: Date.now() - 1000 * 60 * 55 },
];

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: seed,
  logActivity: (a) =>
    set((state) => ({
      activities: [
        { ...a, id: `a${Date.now()}`, timestamp: Date.now() },
        ...state.activities,
      ].slice(0, 50),
    })),
}));
