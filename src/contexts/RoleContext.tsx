import { createContext, useContext, ReactNode } from "react";
import { useAuth, type Role } from "@/app/contexts/AuthContext";

export type { Role };

interface RoleContextValue {
  currentRole: Role;
  setCurrentRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, setRole } = useAuth();
  const currentRole: Role = user?.role ?? "citizen";
  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole: setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleContext() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRoleContext must be used within RoleProvider");
  return ctx;
}
