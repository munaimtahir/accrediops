import { cn } from "@/utils/cn";

export function LoadingSkeleton({
  className,
}: {
  className?: string;
}) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />;
}
