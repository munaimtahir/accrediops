import { Card } from "@/components/ui/card";
import { IndicatorStatusTone, indicatorStatusToneOrder, getIndicatorStatusVisual } from "@/utils/indicator-status";

export function AreaStatusSummary({
  counts,
}: {
  counts: Record<IndicatorStatusTone, number>;
}) {
  return (
    <Card className="p-3">
      <div className="flex flex-wrap gap-2">
        {indicatorStatusToneOrder.map((tone) => {
          const visual = getIndicatorStatusVisual(tone);
          return (
            <span
              key={tone}
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${visual.badgeClassName}`}
            >
              {visual.label}: {counts[tone]}
            </span>
          );
        })}
      </div>
    </Card>
  );
}
