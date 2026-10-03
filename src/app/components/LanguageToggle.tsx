import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LanguageToggle({
  compact = true,
}: {
  compact?: boolean;
}) {
  const { i18n } = useTranslation();
  const current = (i18n.language || "en").startsWith("ar") ? "ar" : "en";
  const next = current === "en" ? "ar" : "en";

  const handle = () => {
    i18n.changeLanguage(next);
    try {
      localStorage.setItem("EcoSnap:lang", next);
    } catch {}
  };

  if (compact) {
    return (
      <button
        onClick={handle}
        title={`Switch to ${next.toUpperCase()}`}
        className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/60 transition-colors relative"
      >
        <Globe className="w-4 h-4" />
        <span
          className="absolute -bottom-0.5 -right-0.5 text-[9px] px-1 rounded-full bg-emerald-500 text-white"
          style={{ fontWeight: 700 }}
        >
          {current.toUpperCase()}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handle}
      className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-sm text-slate-700 dark:text-slate-200"
    >
      <Globe className="w-4 h-4" />
      <span style={{ fontWeight: 600 }}>
        {current === "en" ? "English" : "العربية"}
      </span>
    </button>
  );
}
