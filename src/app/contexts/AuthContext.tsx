import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

export type Role = "admin" | "manager" | "driver" | "citizen" | "employee";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  setRole: (role: Role) => void;
}

const STORAGE_KEY = "EcoSnap_auth";

const AuthContext = createContext<AuthContextValue | null>(null);

function inferRole(email: string): Role {
  const e = email.toLowerCase();
  if (e.includes("admin")) return "admin";
  if (e.includes("driver")) return "driver";
  if (e.includes("citizen")) return "citizen";
  if (e.includes("employee") || e.includes("staff")) return "employee";
  return "manager";
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "User";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as AuthUser);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((u: AuthUser | null) => {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      localStorage.setItem("EcoSnap.auth.token", `mock_jwt_${u.id}_${u.role}`);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("EcoSnap.auth.token");
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!email.trim() || !password.trim())
        throw new Error("Email and password are required");
      await new Promise((r) => setTimeout(r, 600));
      const role = inferRole(email.trim());
      const u: AuthUser = {
        id: `usr_${Date.now()}`,
        name: nameFromEmail(email.trim()),
        email: email.trim(),
        role,
      };
      setUser(u);
      persist(u);
      return u;
    },
    [persist],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      if (!name.trim() || !email.trim() || !password.trim())
        throw new Error("All fields are required");
      await new Promise((r) => setTimeout(r, 600));
      const role = inferRole(email.trim());
      const u: AuthUser = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role,
      };
      setUser(u);
      persist(u);
      return u;
    },
    [persist],
  );

  const logout = useCallback(() => {
    setUser(null);
    persist(null);
  }, [persist]);

  const setRole = useCallback(
    (role: Role) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, role };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
