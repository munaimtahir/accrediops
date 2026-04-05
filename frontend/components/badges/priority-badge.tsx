import { Priority } from "@/types";
import { cn } from "@/utils/cn";
import { formatEnumLabel } from "@/utils/format";

const toneMap: Record<Priority, string> = {
  LOW: "border-slate-300 bg-slate-50 text-slate-700",
  MEDIUM: "border-slate-400 bg-slate-100 text-slate-900",
  HIGH: "border-amber-300 bg-amber-100 text-amber-900",
  CRITICAL: "border-rose-300 bg-rose-100 text-rose-900",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        toneMap[priority],
      )}
    >
      {formatEnumLabel(priority)}
    </span>
  );
}
