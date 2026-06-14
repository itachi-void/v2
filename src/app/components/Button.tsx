import { LucideIcon } from "lucide-react";
import { buttonSizes } from "@/app/constants/designTokens";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
  secondary: "bg-slate-600 hover:bg-slate-700 text-white",
  outline: "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10",
  ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200",
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
};

export default function Button({
  size = "md",
  variant = "primary",
  icon: Icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const sizeClass = buttonSizes[size];
  const variantClass = variantClasses[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full transition-[colors,transform] duration-150 ease-out active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${sizeClass} ${variantClass} ${className}`}
      style={{ fontWeight: 600 }}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
