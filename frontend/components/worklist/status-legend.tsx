import { Card } from "@/components/ui/card";
import { indicatorStatusToneOrder, getIndicatorStatusVisual } from "@/utils/indicator-status";

export function StatusLegend() {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Status legend</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {indicatorStatusToneOrder.map((tone) => {
          const visual = getIndicatorStatusVisual(tone);
          return (
            <div key={tone} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className={`h-3 w-3 rounded-sm ${visual.legendSwatchClassName}`} />
              <span className="text-sm font-medium text-slate-700">{visual.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
