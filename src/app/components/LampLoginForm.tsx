import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { LogIn, UserPlus, Shield, Briefcase, Truck, UserCircle2, Recycle } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { homePathForRole } from "@/app/utils/roleAccess";
import { FloatingLabelInput } from "@/app/components/FloatingLabelInput";
import { useLamp } from "./LampScene";
import PremiumAuthButton from "./PremiumLogoutButton";

type Mode = "login" | "signup";

export type LampLoginFormProps = {
  /** Tagline shown under the title. */
  tagline?: string;
  /** Card glass tint (rgba string with trailing comma-separated values, no rgba()). */
  cardTint?: string;
  /** Submit button background gradient. */
  submitGradient?: string;
  /** Title color. */
  titleColor?: string;
  /** Secondary text color. */
  subColor?: string;
  /** Accent stripe color for rim highlights — defaults to lamp `warm`. */
  accentOverride?: string;
};

const demoChips = [
  { label: "Admin",   email: "admin@ecovoid.io",   Icon: Shield },
  { label: "Manager", email: "manager@ecovoid.io", Icon: Briefcase },
  { label: "Driver",  email: "driver@ecovoid.io",  Icon: Truck },
  { label: "Citizen", email: "citizen@ecovoid.io", Icon: UserCircle2 },
];

export default function LampLoginForm({
  tagline = "Smart recycling dashboard",
  cardTint = "18,20,28",
  submitGradient,
  titleColor = "#f5efe6",
  subColor = "rgba(220,215,205,0.6)",
  accentOverride,
}: LampLoginFormProps) {
  const { intensity: I, warm } = useLamp();
  const accent = accentOverride ?? warm;
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo1234");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const u = mode === "login"
        ? await login(email.trim(), password)
        : await signup(name.trim(), email.trim(), password);
      toast.success(mode === "login" ? `Welcome back, ${u.name}` : `Welcome, ${u.name}`);
      navigate(homePathForRole(u.role), { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const submitBg =
    submitGradient ??
    `linear-gradient(135deg, rgba(${accent}, 0.95) 0%, rgba(${accent}, 0.7) 100%)`;

  return (
    <div
      style={{
        position: "relative",
        width: "min(440px, 92vw)",
        padding: "36px 32px 28px",
        borderRadius: 24,
        background: `
          linear-gradient(45deg,
            rgba(${accent}, ${0.14 * I}) 0%,
            rgba(${accent}, ${0.04 * I}) 30%,
            rgba(${cardTint}, 0.96) 65%,
            rgba(${cardTint}, 0.99) 100%),
          rgba(${cardTint}, 0.97)
        `,
        backdropFilter: "blur(8px) saturate(120%)",
        WebkitBackdropFilter: "blur(8px) saturate(120%)",
        border: "1px solid rgba(255,255,255,0.06)",
        /* Light from lower-left → soft shadow to upper-right. */
        boxShadow: `
          18px -16px 40px rgba(0,0,0,0.55),
          0 24px 40px rgba(0,0,0,0.35)
        `,
        color: titleColor,
      }}
    >
      {/* Soft lit wash — subtle, inside bottom-left corner only */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "55%",
          height: "45%",
          background: `radial-gradient(ellipse at 20% 80%, rgba(${accent}, ${0.08 * I}) 0%, rgba(${accent}, 0) 70%)`,
          pointerEvents: "none",
          borderRadius: 24,
          overflow: "hidden",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, rgba(${accent}, 0.95), rgba(${accent}, 0.6))`,
              boxShadow: `0 6px 20px rgba(${accent}, ${0.4 * I})`,
            }}
          >
            <Recycle style={{ width: 22, height: 22, color: "#0a0a0a" }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: titleColor }}>
              EcoVoid
            </div>
            <div style={{ fontSize: 12, color: subColor }}>{tagline}</div>
          </div>
        </div>

        {/* Mode tabs */}
        <div
          style={{
            display: "flex",
            padding: 4,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 999,
            marginBottom: 20,
          }}
        >
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.5px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background:
                  mode === m
                    ? `linear-gradient(135deg, rgba(${accent}, 0.9), rgba(${accent}, 0.55))`
                    : "transparent",
                color: mode === m ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                boxShadow: mode === m ? `0 4px 12px rgba(${accent}, ${0.35 * I})` : "none",
              }}
            >
              {m === "login" ? "Login" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <FloatingLabelInput label="Full name" value={name} onChange={setName} />
          )}
          <FloatingLabelInput label="Email" type="email" value={email} onChange={setEmail} />
          <FloatingLabelInput label="Password" type="password" value={password} onChange={setPassword} />

          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <PremiumAuthButton
              theme="dark"
              variant={mode === "login" ? "login" : "signup"}
              accent={`rgb(${accent})`}
              label={mode === "login" ? "Login" : "Sign Up"}
              onLogin={() => {
                if (!submitting) onSubmit({ preventDefault: () => {} } as React.FormEvent);
              }}
              onSignup={() => {
                if (!submitting) onSubmit({ preventDefault: () => {} } as React.FormEvent);
              }}
            />
          </div>
        </form>

        {/* Demo chips */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: subColor, marginBottom: 10, letterSpacing: "1px" }}>
            DEMO ROLES
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {demoChips.map((chip) => {
              const Icon = chip.Icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setEmail(chip.email);
                    setPassword("demo1234");
                    setMode("login");
                    toast.info(`Demo: ${chip.label}`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "6px 11px",
                    borderRadius: 999,
                    border: `1px solid rgba(${accent}, ${0.35 + 0.2 * I})`,
                    background: `rgba(${accent}, ${0.08 + 0.08 * I})`,
                    color: titleColor,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon style={{ width: 12, height: 12 }} />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
