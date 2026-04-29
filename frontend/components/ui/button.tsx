import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ring-offset-white outline-none",
  {
    variants: {
      variant: {
        default: "border-slate-900 bg-slate-900 text-white hover:bg-slate-800",
        secondary: "border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
        ghost: "border-transparent bg-transparent text-slate-700 hover:bg-slate-100",
        danger: "border-rose-700 bg-rose-700 text-white hover:bg-rose-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1.5 text-xs",
        lg: "h-11 px-5 py-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Working..." : children}
    </button>
  ),
);

Button.displayName = "Button";
