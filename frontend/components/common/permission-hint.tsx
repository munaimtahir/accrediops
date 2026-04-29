"use client";

import { ReactNode } from "react";

import { cn } from "@/utils/cn";

export function PermissionHint({
  allowed,
  children,
  className,
}: {
  allowed: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (allowed) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900",
        className,
      )}
    >
      {children}
    </p>
  );
}
