import { useTheme } from "next-themes";
import arcticBg from "@/imports/arctic_studio_background.png";
import darkChromeBg from "@/imports/dark_chrome_background.png";

export function WaveBackdrop() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={isDark ? darkChromeBg : arcticBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      />
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isDark
            ? "linear-gradient(160deg, rgba(5,10,20,0.55) 0%, rgba(8,16,32,0.45) 100%)"
            : "linear-gradient(160deg, rgba(245,245,245,0.5) 0%, rgba(200,228,248,0.4) 100%)",
        }}
      />
    </div>
  );
}

export default WaveBackdrop;
