import { ReactNode, useEffect, useRef } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { useAuth, type Role } from "@/app/contexts/AuthContext";
import { homePathForRole } from "@/app/utils/roleAccess";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const deniedRef = useRef(false);

  const denied =
    isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role);

  useEffect(() => {
    if (denied && !deniedRef.current) {
      deniedRef.current = true;
      toast.error("Access denied");
    }
  }, [denied]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl p-8 w-[320px] space-y-3 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10" />
          <div className="h-3 w-3/4 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="h-3 w-1/2 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="h-3 w-2/3 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (denied) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <>{children}</>;
}
