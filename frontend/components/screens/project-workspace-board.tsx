"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { IndicatorDrawer } from "@/components/screens/indicator-drawer";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProgress } from "@/lib/hooks/use-progress";
import { useWorklist } from "@/lib/hooks/use-worklist";
import { AreaProgress, DashboardRow, StandardProgress } from "@/types";
import { cn } from "@/utils/cn";
import { formatPercent } from "@/utils/format";
import { getIndicatorStatusVisual } from "@/utils/indicator-status";

type AreaSummaryCard = AreaProgress & {
  standard_count: number;
  indicator_count: number;
};

export function ProjectWorkspaceBoard({ projectId }: { projectId: number }) {
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedStandardId, setSelectedStandardId] = useState<number | null>(null);
  const [activeIndicatorId, setActiveIndicatorId] = useState<number | null>(null);

  const areasQuery = useProgress(projectId, "areas");
  const standardsQuery = useProgress(projectId, "standards");
  const areaRows = Array.isArray(areasQuery.data) ? (areasQuery.data as AreaProgress[]) : [];
  const standardRows = Array.isArray(standardsQuery.data) ? (standardsQuery.data as StandardProgress[]) : [];

  const areaCards = useMemo<AreaSummaryCard[]>(() => {
    return areaRows.map((area) => {
      const standards = standardRows.filter((row) => row.area_id === area.area_id);
      const indicatorCount = standards.reduce((sum, row) => sum + row.total_indicators, 0);
      return {
        ...area,
        standard_count: standards.length,
        indicator_count: indicatorCount,
      };
    });
  }, [areaRows, standardRows]);

  useEffect(() => {
    if (!selectedAreaId && areaCards.length) {
      setSelectedAreaId(areaCards[0].area_id);
    }
  }, [selectedAreaId, areaCards]);

  const standardsInArea = useMemo(
    () => standardRows.filter((row) => row.area_id === selectedAreaId),
    [standardRows, selectedAreaId],
  );

  useEffect(() => {
    if (!standardsInArea.length) {
      setSelectedStandardId(null);
      return;
    }
    if (!selectedStandardId || !standardsInArea.some((row) => row.standard_id === selectedStandardId)) {
      setSelectedStandardId(standardsInArea[0].standard_id);
    }
  }, [selectedStandardId, standardsInArea]);

  const indicatorQuery = useWorklist({
    project_id: projectId,
    area_id: selectedAreaId ?? undefined,
    standard_id: selectedStandardId ?? undefined,
    page: 1,
    page_size: 200,
  });
  const indicatorRows = indicatorQuery.data?.results ?? [];

  if (areasQuery.isLoading || standardsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-28 w-full" />
        <LoadingSkeleton className="h-44 w-full" />
        <LoadingSkeleton className="h-72 w-full" />
      </div>
    );
  }

  if (areasQuery.error) {
    return <ErrorPanel message={areasQuery.error.message} />;
  }
  if (standardsQuery.error) {
    return <ErrorPanel message={standardsQuery.error.message} />;
  }
  if (indicatorQuery.error) {
    return <ErrorPanel message={indicatorQuery.error.message} />;
  }

  const selectedArea = areaCards.find((area) => area.area_id === selectedAreaId) ?? null;
  const selectedStandard = standardsInArea.find((standard) => standard.standard_id === selectedStandardId) ?? null;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
        <p className="font-semibold">Workspace flow</p>
        <p className="mt-1">
          1) Pick an Area card → 2) Pick a Standard card → 3) Open Indicator cards in the update drawer.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/projects/${projectId}/worklist`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            Open compact worklist
          </Link>
          <Link href={`/projects/${projectId}/recurring`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            Open recurring queue
          </Link>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-950">Areas</h2>
          <p className="text-xs text-slate-500">{areaCards.length} areas</p>
        </div>
        {areaCards.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {areaCards.map((area) => {
              const active = area.area_id === selectedAreaId;
              return (
                <button
                  key={area.area_id}
                  type="button"
                  onClick={() => setSelectedAreaId(area.area_id)}
                  className={cn(
                    "rounded-xl border p-4 text-left shadow-panel transition",
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-300",
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] opacity-80">{area.area_code}</p>
                  <h3 className="mt-1 text-sm font-semibold">{area.area_name}</h3>
                  <div className="mt-3 space-y-1 text-xs opacity-90">
                    <p>Standards {area.standard_count}</p>
                    <p>Indicators {area.indicator_count}</p>
                    <p>Progress {formatPercent(area.progress_percent)}</p>
                    <p>Readiness {formatPercent(area.readiness_score)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No areas available" description="Areas appear after project initialization." />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-950">
            Standards {selectedArea ? `· ${selectedArea.area_name}` : ""}
          </h2>
          <p className="text-xs text-slate-500">{standardsInArea.length} standards</p>
        </div>
        {standardsInArea.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {standardsInArea.map((standard) => {
              const active = standard.standard_id === selectedStandardId;
              return (
                <button
                  key={standard.standard_id}
                  type="button"
                  onClick={() => setSelectedStandardId(standard.standard_id)}
                  className={cn(
                    "rounded-xl border p-4 text-left shadow-panel transition",
                    active
                      ? "border-indigo-600 bg-indigo-50 text-indigo-950"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-300",
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] opacity-80">{standard.standard_code}</p>
                  <h3 className="mt-1 text-sm font-semibold">{standard.standard_name}</h3>
                  <div className="mt-3 space-y-1 text-xs opacity-90">
                    <p>
                      Met {standard.met_indicators}/{standard.total_indicators}
                    </p>
                    <p>In review {standard.in_review_count}</p>
                    <p>Blocked/Overdue {standard.blocked_indicators}/{standard.overdue_count}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No standards in selected area" description="Choose a different area card." />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-950">
            Indicators {selectedStandard ? `· ${selectedStandard.standard_code}` : ""}
          </h2>
          <p className="text-xs text-slate-500">{indicatorRows.length} indicators</p>
        </div>
        {indicatorQuery.isLoading ? (
          <LoadingSkeleton className="h-64 w-full" />
        ) : indicatorRows.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {indicatorRows.map((row) => {
              const visual = getIndicatorStatusVisual(row.current_status);
              return (
                <button
                  key={row.project_indicator_id}
                  type="button"
                  onClick={() => setActiveIndicatorId(row.project_indicator_id)}
                  className={cn(
                    "rounded-xl border p-4 text-left shadow-panel transition hover:-translate-y-0.5 hover:shadow-md",
                    visual.tileClassName,
                  )}
                  title={`${row.indicator_code} · ${visual.label}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] opacity-90">{row.indicator_code}</p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium">{row.indicator_text}</p>
                  <div className="mt-2 space-y-1 text-xs opacity-90">
                    <p>{visual.label}</p>
                    <p>
                      Evidence {row.approved_evidence_count}/{row.total_evidence_count}
                    </p>
                    <p>
                      Recurring {row.pending_recurring_instances_count} pending • {row.overdue_recurring_instances_count} overdue
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No indicators in selected standard"
            description="Choose another standard card or open compact worklist for broader filters."
          />
        )}
      </section>

      {activeIndicatorId ? (
        <IndicatorDrawer indicatorId={activeIndicatorId} open onClose={() => setActiveIndicatorId(null)} />
      ) : null}
    </div>
  );
}
