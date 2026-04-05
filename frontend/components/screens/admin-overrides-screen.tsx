"use client";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { useOverrides } from "@/lib/hooks/use-admin";

export function AdminOverridesScreen() {
  const query = useOverrides();
  if (query.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (query.error) return <ErrorPanel message={query.error.message} />;
  const rows = query.data ?? [];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Overrides & reopen control" />
      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "actor", header: "Actor", render: (row) => String(row.actor_username ?? "System") },
          { key: "event", header: "Event", render: (row) => String(row.event_type ?? "") },
          { key: "reason", header: "Reason", render: (row) => String(row.reason ?? "") },
          { key: "timestamp", header: "Timestamp", render: (row) => String(row.timestamp ?? "") },
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
      />
    </div>
  );
}
