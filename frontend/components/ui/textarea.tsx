import { forwardRef, TextareaHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ring-offset-white",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
