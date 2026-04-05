"use client";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { useProjectReadiness } from "@/lib/hooks/use-readiness";

export function ProjectReadinessScreen({ projectId }: { projectId: number }) {
  const query = useProjectReadiness(projectId);
  if (query.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (query.error) return <ErrorPanel message={query.error.message} />;
  const data = (query.data ?? {}) as Record<string, unknown>;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Readiness" title="Project readiness" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Overall score" value={Number(data.overall_score ?? 0)} />
        <MetricCard label="% met" value={Number(data.percent_met ?? 0)} />
        <MetricCard label="% in progress" value={Number(data.percent_in_progress ?? 0)} />
        <MetricCard label="% blocked" value={Number(data.percent_blocked ?? 0)} />
        <MetricCard label="Recurring compliance" value={Number(data.recurring_compliance_score ?? 0)} />
      </div>
    </div>
  );
}
