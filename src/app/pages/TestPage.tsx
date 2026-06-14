import DownloadButton from "../components/DownloadButton";
import PremiumDownloadButton from "../components/PremiumDownloadButton";
import { FloatingLabelInput } from "../components/FloatingLabelInput";
import LogoutButton from "../components/LogoutButton";
import PremiumAuthButton from "../components/PremiumLogoutButton";

export default function TestPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-16 py-20"
      style={{ background: "#0a0e16" }}
    >
      <div className="flex flex-col items-center gap-6">
        <p
          className="uppercase"
          style={{ color: "#64748b", fontSize: 13, letterSpacing: "0.25em" }}
        >
          Click to download
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <DownloadButton />
          <PremiumDownloadButton theme="dark" />
          <div className="rounded-2xl bg-slate-200" style={{ padding: 2 }}>
            <PremiumDownloadButton theme="light" />
          </div>
        </div>
      </div>

      {/* Floating-label form showcase */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col gap-6">
          <FloatingLabelInput label="Username" />
          <FloatingLabelInput label="Password" type="password" />
        </div>
      </div>

      {/* Logout button — dark & light variants */}
      <div className="flex flex-wrap items-center justify-center gap-10">
        <LogoutButton theme="dark" />
        <div className="rounded-2xl bg-slate-200 p-6">
          <LogoutButton theme="light" />
        </div>
      </div>

      {/* Premium logout button — interactive showcase */}
      <div className="flex flex-col items-center gap-6">
        <p
          className="uppercase"
          style={{ color: "#64748b", fontSize: 13, letterSpacing: "0.25em" }}
        >
          Premium interaction
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <PremiumAuthButton variant="login"  theme="dark" />
          <div className="rounded-2xl bg-slate-200" style={{ padding: 2 }}>
            <PremiumAuthButton variant="login"  theme="light" />
          </div>
          <PremiumAuthButton variant="signup" theme="dark" accent="#fbbf24" />
          <div className="rounded-2xl bg-slate-200" style={{ padding: 2 }}>
            <PremiumAuthButton variant="signup" theme="light" accent="#f59e0b" />
          </div>
          <PremiumAuthButton variant="logout" theme="dark" />
          <div className="rounded-2xl bg-slate-200" style={{ padding: 2 }}>
            <PremiumAuthButton variant="logout" theme="light" />
          </div>
        </div>
      </div>
    </div>
  );
}
