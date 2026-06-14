import { useEffect, useRef, useState } from "react";
import { createTimeline, stagger, splitText } from "animejs";

/**
 * RollingText — anime.js splitText effect, cycling through phrases.
 *
 * For each phrase the characters are clipped and cloned below
 * (`clone: "bottom"`), then rolled up into place with a center-out stagger.
 * After a short hold it advances to the next phrase, looping the list.
 * Scoped to its own element so it never touches the rest of the page.
 */
export function RollingText({
  texts,
  interval = 2200,
}: {
  texts: string[];
  interval?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const split = splitText(el, {
      chars: { wrap: "clip", clone: "bottom" },
    });

    const tl = createTimeline().add(
      split.chars,
      {
        y: ["100%", "0%"],
        duration: 700,
        ease: "out(3)",
      },
      stagger(60, { from: "center" }),
    );

    const timer = window.setTimeout(
      () => setIndex((p) => (p + 1) % texts.length),
      interval,
    );

    return () => {
      window.clearTimeout(timer);
      tl.revert?.();
      split.revert?.();
    };
  }, [index, texts, interval]);

  // `key` forces a fresh DOM node per phrase so anime's DOM mutations never
  // collide with React's reconciliation (which was freezing on "Recycle Smart").
  return (
    <span key={index} ref={ref} className="text-emerald-600">
      {texts[index]}
    </span>
  );
}

export default RollingText;
