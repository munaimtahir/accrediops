import { forwardRef, InputHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ring-offset-white",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
