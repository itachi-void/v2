import { Navigate } from "react-router";
import { useAuth } from "@/app/contexts/AuthContext";
import { homePathForRole } from "@/app/utils/roleAccess";
import LampScene from "@/app/components/LampScene";
import LampLoginForm from "@/app/components/LampLoginForm";

/**
 * Login — Version A: Emerald Identity
 * Matches the existing EcoVoid brand. Emerald glow, dark teal-tinted void,
 * subtle volumetric lighting, premium SaaS feel.
 */
export default function LoginPageLampA() {
  const { isAuthenticated, user, loading } = useAuth();
  if (!loading && isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role ?? "citizen")} replace />;
  }

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <LampScene
        warm="134, 239, 172"  /* emerald-300 */
        beamIntensity={0.9}
        beamWidth={0.55}
        ambientGlow={0}
        shadowStrength={0.9}
        contentPosition="center"
        lampStyle="cool-steel"
        lampLeft="3%"
        lampBottom="6%"
        lampScale={0.85}
        background="radial-gradient(ellipse at 50% 55%, #0a1814 0%, #050b0a 55%, #02060a 100%)"
      >
        <LampLoginForm
          tagline="Smart recycling — sign in to continue"
          cardTint="10,22,20"
          submitGradient="linear-gradient(135deg, #34d399 0%, #10b981 100%)"
          titleColor="#ecfdf5"
        />
      </LampScene>
    </div>
  );
}
