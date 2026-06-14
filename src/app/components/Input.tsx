import { forwardRef } from "react";
import { inputClassFull } from "@/app/constants/designTokens";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1.5" style={{ fontWeight: 500 }}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputClassFull} h-10 ${icon ? "pl-10" : ""} ${error ? "border-rose-500 dark:border-rose-400" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
