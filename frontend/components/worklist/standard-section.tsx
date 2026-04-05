import { DashboardRow } from "@/types";

import { Card } from "@/components/ui/card";
import { IndicatorStatusTile } from "@/components/worklist/indicator-status-tile";

export function StandardSection({
  standardName,
  indicators,
  onOpenIndicator,
}: {
  standardName: string;
  indicators: DashboardRow[];
  onOpenIndicator: (projectIndicatorId: number) => void;
}) {
  return (
    <Card className="p-4">
      <h4 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">{standardName}</h4>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {indicators.map((row) => (
          <IndicatorStatusTile key={row.project_indicator_id} row={row} onOpen={onOpenIndicator} />
        ))}
      </div>
    </Card>
  );
}
