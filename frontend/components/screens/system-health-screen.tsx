"use client";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageHeader } from "@/components/common/page-header";
import { MetricCard } from "@/components/common/metric-card";
import { useBackendHealth } from "@/lib/hooks/use-health";

export function SystemHealthScreen() {
  const healthQuery = useBackendHealth();

  if (healthQuery.isLoading) {
    return <LoadingSkeleton className="h-32 w-full" />;
  }

  if (healthQuery.error) {
    return <ErrorPanel message={healthQuery.error.message} />;
  }

  const data = healthQuery.data ?? {};
  const service = String(data.service ?? "Unknown");
  const status = String(data.status ?? "unknown");
  const database = String(data.database ?? "unknown");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Backend health"
        description="Runtime health from /api/health/ for frontend-backend truth mapping and operations checks."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Service" value={service} />
        <MetricCard label="Status" value={status} />
        <MetricCard label="Database" value={database} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
        <h3 className="text-sm font-semibold text-slate-900">Raw health payload</h3>
        <pre className="mt-3 overflow-x-auto text-xs text-slate-800">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
