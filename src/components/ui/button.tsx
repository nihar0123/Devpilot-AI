import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--purple)] text-white shadow-[0_10px_35px_rgba(117,104,255,0.35)] hover:bg-[#8479ff]",
        outline: "border border-white/15 bg-white/5 text-white hover:bg-white/10",
        ghost: "text-slate-200 hover:bg-white/8",
        danger: "bg-red-500/85 text-white hover:bg-red-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3",
        sm: "h-9 px-3 py-2 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
