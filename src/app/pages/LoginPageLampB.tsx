import { Navigate } from "react-router";
import { useAuth } from "@/app/contexts/AuthContext";
import { homePathForRole } from "@/app/utils/roleAccess";
import LampScene from "@/app/components/LampScene";
import LampLoginForm from "@/app/components/LampLoginForm";

/**
 * Login — Version B: Cinematic Contrast
 * Warm tungsten lamp on a deep cool-blue night. Strong contrast,
 * dust motes, dramatic shadow — memorable cinematic feel.
 */
export default function LoginPageLampB() {
  const { isAuthenticated, user, loading } = useAuth();
  if (!loading && isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role ?? "citizen")} replace />;
  }

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <LampScene
        warm="255, 198, 120"  /* original tungsten */
        beamIntensity={1.0}
        beamWidth={0.6}
        ambientGlow={0}
        shadowStrength={1.15}
        contentPosition="center"
        lampStyle="warm-brass"
        lampLeft="3%"
        lampBottom="6%"
        lampScale={0.85}
        background="radial-gradient(ellipse at 50% 55%, #0a1530 0%, #050b1c 55%, #02050e 100%)"
      >
        <LampLoginForm
          tagline="Step into the light"
          cardTint="8,14,28"
          submitGradient="linear-gradient(135deg, #ffd089 0%, #f0a256 100%)"
          titleColor="#fff8eb"
        />
      </LampScene>
    </div>
  );
}
