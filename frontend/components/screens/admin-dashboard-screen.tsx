"use client";

import Link from "next/link";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { buttonVariants } from "@/components/ui/button";
import { useAdminDashboard } from "@/lib/hooks/use-admin";
import { cn } from "@/utils/cn";

export function AdminDashboardScreen() {
  const query = useAdminDashboard();
  if (query.isLoading) {
    return <LoadingSkeleton className="h-48 w-full" />;
  }
  if (query.error) {
    return <ErrorPanel message={query.error.message} />;
  }
  const data = query.data ?? {};
  const events = (data.recent_audit_events as Record<string, unknown>[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Admin dashboard"
        description="Governance metrics, operational risk, and audit visibility."
        actions={
          <>
            <Link href="/admin/users" className={cn(buttonVariants({ variant: "secondary", size: "default" }))}>
              Users
            </Link>
            <Link href="/admin/audit" className={cn(buttonVariants({ variant: "secondary", size: "default" }))}>
              Audit
            </Link>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Total projects" value={Number(data.total_projects ?? 0)} />
        <MetricCard label="Active projects" value={Number(data.active_projects ?? 0)} />
        <MetricCard label="Overdue indicators" value={Number(data.overdue_indicators ?? 0)} />
        <MetricCard label="Overdue recurring" value={Number(data.overdue_recurring_items ?? 0)} />
        <MetricCard label="Under review" value={Number(data.indicators_under_review ?? 0)} />
      </div>
      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "event", header: "Event", render: (row) => String(row.event_type ?? "") },
          { key: "object", header: "Object", render: (row) => `${row.object_type}:${row.object_id}` },
          { key: "actor", header: "Actor", render: (row) => String(row.actor__username ?? "System") },
          { key: "reason", header: "Reason", render: (row) => String(row.reason ?? "") },
          { key: "timestamp", header: "Timestamp", render: (row) => String(row.timestamp ?? "") },
        ]}
        rows={events}
        rowKey={(row) => String(row.id)}
      />
    </div>
  );
}
