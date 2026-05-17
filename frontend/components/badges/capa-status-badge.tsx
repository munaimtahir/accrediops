import { CapaStatus } from "@/types";
import { cn } from "@/utils/cn";
import { formatEnumLabel } from "@/utils/format";

const toneMap: Record<CapaStatus, string> = {
  OPEN: "border-slate-300 bg-slate-50 text-slate-700",
  IN_PROGRESS: "border-blue-300 bg-blue-50 text-blue-900",
  SUBMITTED_FOR_REVIEW: "border-violet-300 bg-violet-50 text-violet-900",
  CLOSED: "border-emerald-300 bg-emerald-50 text-emerald-900",
  REJECTED: "border-rose-300 bg-rose-50 text-rose-900",
  CANCELLED: "border-slate-300 bg-slate-100 text-slate-700",
};

export function CapaStatusBadge({ status }: { status: CapaStatus }) {
  return (
    <span
      data-testid="capa-status-badge"
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        toneMap[status],
      )}
    >
      {formatEnumLabel(status)}
    </span>
  );
}

