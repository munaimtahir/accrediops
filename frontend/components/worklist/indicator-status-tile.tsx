import { DashboardRow } from "@/types";
import { cn } from "@/utils/cn";
import { getIndicatorStatusVisual } from "@/utils/indicator-status";

export function IndicatorStatusTile({
  row,
  onOpen,
}: {
  row: DashboardRow;
  onOpen: (projectIndicatorId: number) => void;
}) {
  const visual = getIndicatorStatusVisual(row.current_status);

  return (
    <button
      type="button"
      onClick={() => onOpen(row.project_indicator_id)}
      className={cn(
        "w-full rounded-lg border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20",
        visual.tileClassName,
      )}
      title={`${row.indicator_code} • ${visual.label}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-90">{row.indicator_code}</p>
      <p className="mt-1 line-clamp-2 text-sm font-medium">{row.indicator_text}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em]">{visual.label}</p>
    </button>
  );
}
