import { useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/app/contexts/AuthContext";
import { homePathForRole } from "@/app/utils/roleAccess";
import LampScene from "@/app/components/LampScene";
import LampLoginForm from "@/app/components/LampLoginForm";
import BulbSwitch from "@/app/components/BulbSwitch";
import DayNightSwitch from "@/app/components/DayNightSwitch";

/**
 * Login — Version D: Forest Moonlight
 * Mint lantern lighting on a forest-night palette. Supports:
 *   - Day / Night mode (sun-moon switch top-right)
 *   - Lamp ON / OFF in either mode (bulb switch, plus the lamp's pull cord)
 */
export default function LoginPageLampD() {
  const { isAuthenticated, user, loading } = useAuth();
  const [mode, setMode] = useState<"day" | "night">("night");

  if (!loading && isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role ?? "citizen")} replace />;
  }

  const isDay = mode === "day";

  const sceneConfig = isDay
    ? {
        warm: "255, 220, 140",         /* warm yellow daylight lamp tint */
        beamIntensity: 0.7,
        beamWidth: 0.75,
        ambientGlow: 0,
        shadowStrength: 0.0,            /* no dark floor / vignette in daylight */
        lampStyle: "warm-brass" as const,
        background:
          "linear-gradient(180deg, #eaf6ef 0%, #c8e3d4 50%, #9fcdbb 100%)",
      }
    : {
        warm: "167, 243, 208",
        beamIntensity: 1.2,
        beamWidth: 0.8,
        ambientGlow: 0,
        shadowStrength: 1.0,
        lampStyle: "cool-steel" as const,
        background:
          "radial-gradient(ellipse at 50% 55%, #0a1f17 0%, #051410 55%, #020806 100%)",
      };

  const formConfig = isDay
    ? {
        cardTint: "240,250,244",
        titleColor: "#0f2820",
        subColor: "rgba(20,50,40,0.6)",
        submitGradient:
          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        tagline: "Sign in — a calmer way to manage what matters",
      }
    : {
        cardTint: "6,18,14",
        titleColor: "#ecfdf5",
        subColor: "rgba(220,235,225,0.6)",
        submitGradient:
          "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)",
        tagline: "Sign in — a calmer way to manage what matters",
      };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        transition: "background 0.6s ease",
      }}
    >
      <LampScene
        key={mode}
        warm={sceneConfig.warm}
        beamIntensity={sceneConfig.beamIntensity}
        beamWidth={sceneConfig.beamWidth}
        ambientGlow={sceneConfig.ambientGlow}
        shadowStrength={sceneConfig.shadowStrength}
        contentPosition="center"
        lampStyle={sceneConfig.lampStyle}
        lampLeft="3%"
        lampBottom="6%"
        lampScale={0.85}
        showDust={!isDay}
        dayMode={isDay}
        background={sceneConfig.background}
      >
        <LampLoginForm
          tagline={formConfig.tagline}
          cardTint={formConfig.cardTint}
          submitGradient={formConfig.submitGradient}
          titleColor={formConfig.titleColor}
          subColor={formConfig.subColor}
        />
        <BulbSwitch position={{ top: 24, right: 28 }} />
        <DayNightSwitch
          mode={mode}
          onChange={setMode}
          position={{ top: 30, right: 100 }}
        />
      </LampScene>
    </div>
  );
}
