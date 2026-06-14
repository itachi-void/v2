import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type VerificationResult = "verified" | "rejected";

/** One processed bag — the unit of an employee's work log. */
export interface VerificationEntry {
  id: string;            // log id
  orderId: string;       // the bag/order id
  citizenName: string;
  type: string;          // plastic type
  qty: number;           // detected quantity
  matchScore: number;    // AI similarity %
  result: VerificationResult;
  points: number;        // points awarded (0 when rejected)
  reason?: string;       // rejection reason (if any)
  reviewedBy: string;    // employee name
  at: Date;
}

interface VerificationHistoryValue {
  entries: VerificationEntry[];
  addEntry: (e: Omit<VerificationEntry, "id" | "at">) => void;
}

// A few pre-seeded entries so History isn't empty on first load. Real entries
// from the Verification Station are prepended on top of these.
const seed: VerificationEntry[] = [
  { id: "H-0998", orderId: "ORD-4807", citizenName: "Salma Adel", type: "PP", qty: 3, matchScore: 91, result: "verified", points: 30, reviewedBy: "Employee", at: new Date("2026-06-13T16:20:00") },
  { id: "H-0997", orderId: "ORD-4802", citizenName: "Hossam Fathy", type: "PET", qty: 5, matchScore: 63, result: "rejected", points: 0, reason: "Low visual similarity to citizen photos", reviewedBy: "Employee", at: new Date("2026-06-13T15:10:00") },
  { id: "H-0996", orderId: "ORD-4799", citizenName: "Nour Khaled", type: "HDPE", qty: 7, matchScore: 96, result: "verified", points: 70, reviewedBy: "Employee", at: new Date("2026-06-13T14:00:00") },
];

const VerificationHistoryContext = createContext<VerificationHistoryValue | null>(null);

export function VerificationHistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<VerificationEntry[]>(seed);

  const addEntry = useCallback((e: Omit<VerificationEntry, "id" | "at">) => {
    setEntries((prev) => [
      { ...e, id: `H-${Date.now().toString().slice(-6)}`, at: new Date() },
      ...prev,
    ]);
  }, []);

  return (
    <VerificationHistoryContext.Provider value={{ entries, addEntry }}>
      {children}
    </VerificationHistoryContext.Provider>
  );
}

export function useVerificationHistory() {
  const ctx = useContext(VerificationHistoryContext);
  if (!ctx) throw new Error("useVerificationHistory must be used within VerificationHistoryProvider");
  return ctx;
}
