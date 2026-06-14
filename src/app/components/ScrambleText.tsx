import { useEffect, useRef, useState } from "react";
import { animate, scrambleText } from "animejs";

/**
 * ScrambleText — anime.js scrambleText effect.
 *
 * Reveals each phrase character-by-character through a scramble animation
 * (`innerHTML: scrambleText()`). With multiple phrases it cycles through them;
 * with a single phrase it scrambles once on mount. A `key` per phrase gives a
 * fresh DOM node so anime's innerHTML mutations never collide with React.
 */
export function ScrambleText({
  texts,
  interval = 2600,
  className = "text-emerald-600",
}: {
  texts: string[];
  interval?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const anim = animate(el, {
      innerHTML: scrambleText(),
      duration: 1000,
      ease: "out(2)",
    });

    // Only cycle when there is more than one phrase.
    let timer = 0;
    if (texts.length > 1) {
      timer = window.setTimeout(
        () => setIndex((p) => (p + 1) % texts.length),
        interval,
      );
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      anim.revert?.();
    };
  }, [index, texts, interval]);

  return (
    <span key={index} ref={ref} className={className}>
      {texts[index]}
    </span>
  );
}

export default ScrambleText;
