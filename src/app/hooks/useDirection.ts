import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function useDirection(): { dir: "ltr" | "rtl"; lang: string } {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";
  const initial: "ltr" | "rtl" = lang.startsWith("ar") ? "rtl" : "ltr";
  const [dir, setDir] = useState<"ltr" | "rtl">(initial);

  useEffect(() => {
    const next: "ltr" | "rtl" = lang.startsWith("ar") ? "rtl" : "ltr";
    setDir(next);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", next);
    }
  }, [lang]);

  return { dir, lang };
}

export default useDirection;
