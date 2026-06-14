import * as ProgressPrimitive from "@radix-ui/react-progress";
import { forwardRef, ComponentPropsWithoutRef, ElementRef } from "react";

type ProgressProps = ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  value?: number;
};

export const Progress = forwardRef<ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className = "", value = 0, ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10 ${className}`}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full bg-cyan-500 transition-transform"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  )
);
Progress.displayName = "Progress";
