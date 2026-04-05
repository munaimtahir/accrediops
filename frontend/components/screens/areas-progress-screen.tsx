"use client";

import { ErrorPanel } from "@/components/common/error-panel";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useProgress } from "@/lib/hooks/use-progress";
import { AreaProgress } from "@/types";
import { formatPercent } from "@/utils/format";

export function AreasProgressScreen({ projectId }: { projectId: number }) {
  const progressQuery = useProgress(projectId, "areas");

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

  const rows = Array.isArray(progressQuery.data) ? (progressQuery.data as AreaProgress[]) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Progress"
        title="Areas progress"
        description="Area-level completion against standards, optimized for quick governance checks."
      />

      <WorkbenchTable<AreaProgress>
        columns={[
          {
            key: "area",
            header: "Area",
            render: (row) => `${row.area_code} • ${row.area_name}`,
          },
          {
            key: "completed",
            header: "Completed standards",
            render: (row) => row.completed_standards,
          },
          {
            key: "total",
            header: "Total standards",
            render: (row) => row.total_standards,
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
            header: "High-risk standards",
            render: (row) => row.high_risk_standards_count,
          },
        ]}
        rows={rows}
        rowKey={(row) => row.area_id}
        empty={
          <EmptyState
            title="No area progress returned"
            description="Area progress will render here once project indicators exist."
          />
        }
      />
    </div>
  );
}
