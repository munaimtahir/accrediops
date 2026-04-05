import { DashboardRow } from "@/types";
import { createStatusCounts, IndicatorStatusTone, normalizeIndicatorStatus } from "@/utils/indicator-status";

import { AreaStatusSummary } from "@/components/worklist/area-status-summary";
import { StandardSection } from "@/components/worklist/standard-section";

type StandardGroup = {
  standardName: string;
  indicators: DashboardRow[];
};

export function AreaSection({
  areaName,
  standards,
  onOpenIndicator,
}: {
  areaName: string;
  standards: StandardGroup[];
  onOpenIndicator: (projectIndicatorId: number) => void;
}) {
  const areaCounts = standards.reduce<Record<IndicatorStatusTone, number>>((counts, standard) => {
    standard.indicators.forEach((row) => {
      counts[normalizeIndicatorStatus(row.current_status)] += 1;
    });
    return counts;
  }, createStatusCounts());

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">{areaName}</h3>
      </div>
      <AreaStatusSummary counts={areaCounts} />
      <div className="space-y-3">
        {standards.map((standard) => (
          <StandardSection
            key={standard.standardName}
            standardName={standard.standardName}
            indicators={standard.indicators}
            onOpenIndicator={onOpenIndicator}
          />
        ))}
      </div>
    </section>
  );
}
