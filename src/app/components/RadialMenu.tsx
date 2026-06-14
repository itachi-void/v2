import { useTheme } from "next-themes";
import { Wheel, type Command } from "./RadialCommandWheel";

/**
 * RadialMenu — production floating launcher.
 *
 * Wraps the showcase `Wheel` engine but renders a single variant that follows
 * the app theme (next-themes), pinned to the bottom-right of every page.
 * Transparent stage so it floats over any background. Pass `commands` to tailor
 * the actions per page / role; defaults to the built-in navigation set.
 */
export default function RadialMenu({ commands }: { commands?: Command[] }) {
  const { resolvedTheme } = useTheme();
  const variant = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="pointer-events-none fixed bottom-2 right-2 z-50">
      {/* The Wheel's 400px stage; only the knob/icons capture pointer events. */}
      <div className="pointer-events-auto origin-bottom-right scale-50 sm:scale-[0.6]">
        <Wheel variant={variant} commands={commands} />
      </div>
    </div>
  );
}
