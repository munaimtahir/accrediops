import { IndicatorStatus } from "@/types";
import { cn } from "@/utils/cn";
import { getIndicatorStatusVisual } from "@/utils/indicator-status";

export function StatusBadge({ status }: { status: IndicatorStatus }) {
  const visual = getIndicatorStatusVisual(status);

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        visual.badgeClassName,
      )}
    >
      {visual.label}
    </span>
  );
}
