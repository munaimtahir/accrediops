"use client";

import { ErrorPanel } from "@/components/common/error-panel";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useProgress } from "@/lib/hooks/use-progress";
import { StandardProgress } from "@/types";
import { formatPercent } from "@/utils/format";

export function StandardsProgressScreen({ projectId }: { projectId: number }) {
  const progressQuery = useProgress(projectId, "standards");

  if (progressQuery.isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    );
  }

  if (progressQuery.error) {
    return <ErrorPanel message={progressQuery.error.message} />;
  }

  const rows = Array.isArray(progressQuery.data) ? (progressQuery.data as StandardProgress[]) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Progress"
        title="Standards progress"
        description="Progress grouped by area and standard, with completion and review pressure visible in-line."
      />

      <WorkbenchTable<StandardProgress>
        columns={[
          {
            key: "area",
            header: "Area",
            render: (row) => `${row.area_code} • ${row.area_name}`,
          },
          {
            key: "standard",
            header: "Standard",
            render: (row) => `${row.standard_code} • ${row.standard_name}`,
          },
          {
            key: "total",
            header: "Total indicators",
            render: (row) => row.total_indicators,
          },
          {
            key: "met",
            header: "Met",
            render: (row) => row.met_indicators,
          },
          {
            key: "progress",
            header: "Progress %",
            render: (row) => formatPercent(row.progress_percent),
          },
          {
            key: "readiness",
            header: "Readiness",
            render: (row) => formatPercent(row.readiness_score),
          },
          {
            key: "risk",
            header: "Blocked/Overdue",
            render: (row) => `${row.blocked_indicators} / ${row.overdue_count}`,
          },
        ]}
        rows={rows}
        rowKey={(row) => row.standard_id}
        empty={
          <EmptyState
            title="No standards progress returned"
            description="Standards progress will render here once project indicators exist."
          />
        }
      />
    </div>
  );
}
