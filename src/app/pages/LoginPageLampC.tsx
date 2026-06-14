import { Navigate } from "react-router";
import { useAuth } from "@/app/contexts/AuthContext";
import { homePathForRole } from "@/app/utils/roleAccess";
import LampScene from "@/app/components/LampScene";
import LampLoginForm from "@/app/components/LampLoginForm";

/**
 * Login — Version C: Teal Beacon
 * Aqua/teal beam with strong glow, modern-black lamp body,
 * pronounced beam volume, futuristic tech vibe.
 */
export default function LoginPageLampC() {
  const { isAuthenticated, user, loading } = useAuth();
  if (!loading && isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role ?? "citizen")} replace />;
  }

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <LampScene
        warm="94, 234, 212"  /* teal-300 */
        beamIntensity={1.05}
        beamWidth={0.6}
        ambientGlow={0}
        shadowStrength={1.0}
        contentPosition="center"
        lampStyle="modern-black"
        lampLeft="3%"
        lampBottom="6%"
        lampScale={0.85}
        background="radial-gradient(ellipse at 50% 55%, #06141c 0%, #030a10 55%, #01040a 100%)"
      >
        <LampLoginForm
          tagline="Authenticate to access the grid"
          cardTint="6,16,22"
          submitGradient="linear-gradient(135deg, #5eead4 0%, #14b8a6 100%)"
          titleColor="#ecfeff"
        />
      </LampScene>
    </div>
  );
}
