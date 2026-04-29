import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[var(--purple)] focus:ring-2 focus:ring-[rgba(117,104,255,0.25)]",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
