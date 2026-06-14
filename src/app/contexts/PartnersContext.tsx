import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

export type PartnerType = "logistics" | "retail" | "manufacturer" | "ngo";
export type PartnerStatus = "active" | "pending" | "paused";

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  shipmentsCount: number;
  totalVolumeKg: number;
  joinDate: string;
  lastShipment: string;
}

const seed: Partner[] = [
  { id: "PRT-001", name: "GreenLogistics Co", type: "logistics", status: "active", contactName: "Sara Ahmed", contactEmail: "sara@greenlogistics.co", contactPhone: "+966 50 111 2222", shipmentsCount: 24, totalVolumeKg: 18250, joinDate: "2024-09-12", lastShipment: "2026-05-20" },
  { id: "PRT-002", name: "RecycleMax", type: "manufacturer", status: "active", contactName: "Omar Khalil", contactEmail: "omar@recyclemax.com", contactPhone: "+966 55 222 3333", shipmentsCount: 41, totalVolumeKg: 32100, joinDate: "2024-04-03", lastShipment: "2026-05-28" },
  { id: "PRT-003", name: "EcoMart Retail", type: "retail", status: "pending", contactName: "Layla Hassan", contactEmail: "layla@ecomart.sa", contactPhone: "+966 54 333 4444", shipmentsCount: 6, totalVolumeKg: 3400, joinDate: "2025-12-01", lastShipment: "2026-05-10" },
  { id: "PRT-004", name: "PlanetCare NGO", type: "ngo", status: "active", contactName: "Yousef Ali", contactEmail: "yousef@planetcare.org", contactPhone: "+966 56 444 5555", shipmentsCount: 15, totalVolumeKg: 7820, joinDate: "2025-02-18", lastShipment: "2026-05-25" },
  { id: "PRT-005", name: "BluePlastix Industries", type: "manufacturer", status: "paused", contactName: "Nora Saad", contactEmail: "nora@blueplastix.com", contactPhone: "+966 53 555 6666", shipmentsCount: 9, totalVolumeKg: 5600, joinDate: "2025-06-22", lastShipment: "2026-04-02" },
];

interface PartnersContextValue {
  partners: Partner[];
  setPartners: (p: Partner[] | ((prev: Partner[]) => Partner[])) => void;
  addPartner: (p: Omit<Partner, "id">) => Partner;
  updatePartner: (id: string, patch: Partial<Partner>) => void;
  removePartner: (id: string) => void;
  assignShipment: (partnerId: string, opts: { weightKg: number; date: string }) => void;
}

const PartnersContext = createContext<PartnersContextValue | null>(null);

export function PartnersProvider({ children }: { children: ReactNode }) {
  const [partners, setPartners] = useLocalStorage<Partner[]>("ecovoid.partners.v1", seed);

  const addPartner: PartnersContextValue["addPartner"] = (p) => {
    const next: Partner = {
      ...p,
      id: `PRT-${String(Date.now()).slice(-4)}`,
    };
    setPartners((prev) => [next, ...prev]);
    return next;
  };

  const updatePartner: PartnersContextValue["updatePartner"] = (id, patch) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removePartner: PartnersContextValue["removePartner"] = (id) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  const assignShipment: PartnersContextValue["assignShipment"] = (partnerId, { weightKg, date }) => {
    setPartners((prev) =>
      prev.map((p) =>
        p.id === partnerId
          ? {
              ...p,
              shipmentsCount: p.shipmentsCount + 1,
              totalVolumeKg: p.totalVolumeKg + weightKg,
              lastShipment: date,
            }
          : p
      )
    );
  };

  return (
    <PartnersContext.Provider value={{ partners, setPartners, addPartner, updatePartner, removePartner, assignShipment }}>
      {children}
    </PartnersContext.Provider>
  );
}

export function usePartners() {
  const ctx = useContext(PartnersContext);
  if (!ctx) throw new Error("usePartners must be used within PartnersProvider");
  return ctx;
}
