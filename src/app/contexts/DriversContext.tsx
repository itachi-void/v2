import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

export type DriverStatus = "active" | "inactive" | "on-leave" | "available";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: DriverStatus;
  currentRoute: string;
  completedTrips: number;
  rating: number;
  earnings: number;
  onTimePercentage: number;
  fuelEfficiency: number;
  avatar: string;
  vehicleNumber: string;
  joinDate: string;
  lastActive: string;
}

const seed: Driver[] = [
  {
    id: "DRV-001",
    name: "Ahmed Hassan",
    phone: "+966 50 123 4567",
    email: "ahmed@EcoSnap.com",
    status: "active",
    currentRoute: "Route #12",
    completedTrips: 248,
    rating: 4.8,
    earnings: 12450,
    onTimePercentage: 96,
    fuelEfficiency: 8.5,
    avatar: "AH",
    vehicleNumber: "VEH-101",
    joinDate: "2025-01-15",
    lastActive: "2 mins ago",
  },
  {
    id: "DRV-002",
    name: "Mohammed Ali",
    phone: "+966 55 234 5678",
    email: "mohammed@EcoSnap.com",
    status: "active",
    currentRoute: "Route #8",
    completedTrips: 312,
    rating: 4.9,
    earnings: 15680,
    onTimePercentage: 98,
    fuelEfficiency: 9.2,
    avatar: "MA",
    vehicleNumber: "VEH-102",
    joinDate: "2024-11-20",
    lastActive: "5 mins ago",
  },
  {
    id: "DRV-003",
    name: "Khalid Ibrahim",
    phone: "+966 54 345 6789",
    email: "khalid@EcoSnap.com",
    status: "available",
    currentRoute: "-",
    completedTrips: 189,
    rating: 4.6,
    earnings: 9850,
    onTimePercentage: 92,
    fuelEfficiency: 7.8,
    avatar: "KI",
    vehicleNumber: "VEH-103",
    joinDate: "2025-02-10",
    lastActive: "10 mins ago",
  },
  {
    id: "DRV-004",
    name: "Fahad Yousef",
    phone: "+966 56 456 7890",
    email: "fahad@EcoSnap.com",
    status: "inactive",
    currentRoute: "-",
    completedTrips: 156,
    rating: 4.4,
    earnings: 7920,
    onTimePercentage: 88,
    fuelEfficiency: 7.2,
    avatar: "FY",
    vehicleNumber: "VEH-104",
    joinDate: "2025-03-01",
    lastActive: "2 hours ago",
  },
  {
    id: "DRV-005",
    name: "Omar Abdullah",
    phone: "+966 53 567 8901",
    email: "omar@EcoSnap.com",
    status: "on-leave",
    currentRoute: "-",
    completedTrips: 203,
    rating: 4.7,
    earnings: 10540,
    onTimePercentage: 94,
    fuelEfficiency: 8.1,
    avatar: "OA",
    vehicleNumber: "VEH-105",
    joinDate: "2025-01-05",
    lastActive: "3 days ago",
  },
];

interface DriversContextValue {
  drivers: Driver[];
  setDrivers: (d: Driver[] | ((prev: Driver[]) => Driver[])) => void;
  addDriver: (d: Omit<Driver, "id" | "avatar" | "lastActive">) => Driver;
  updateDriver: (id: string, patch: Partial<Driver>) => void;
  removeDriver: (id: string) => void;
}

const DriversContext = createContext<DriversContextValue | null>(null);

export function DriversProvider({ children }: { children: ReactNode }) {
  const [drivers, setDrivers] = useLocalStorage<Driver[]>(
    "EcoSnap.drivers.v1",
    seed,
  );

  const addDriver: DriversContextValue["addDriver"] = (d) => {
    const next: Driver = {
      ...d,
      id: `DRV-${String(Date.now()).slice(-4)}`,
      avatar: d.name
        .split(/\s+/)
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      lastActive: "just now",
    };
    setDrivers((prev) => [next, ...prev]);
    return next;
  };

  const updateDriver: DriversContextValue["updateDriver"] = (id, patch) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    );
  };

  const removeDriver: DriversContextValue["removeDriver"] = (id) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DriversContext.Provider
      value={{ drivers, setDrivers, addDriver, updateDriver, removeDriver }}
    >
      {children}
    </DriversContext.Provider>
  );
}

export function useDrivers() {
  const ctx = useContext(DriversContext);
  if (!ctx) throw new Error("useDrivers must be used within DriversProvider");
  return ctx;
}
