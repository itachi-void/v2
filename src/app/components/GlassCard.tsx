import * as React from "react";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
} & React.HTMLAttributes<HTMLElement>;

export function GlassCard({
  children,
  className = "",
  as: Tag = "div",
  ...rest
}: GlassCardProps) {
  const Component = Tag as any;
  return (
    <Component
      className={`bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default GlassCard;
