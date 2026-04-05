"use client";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageHeader } from "@/components/common/page-header";
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

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="System"
        title="Backend health"
        description="Runtime health from /api/health/ for frontend-backend truth mapping and operations checks."
      />
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
        <pre className="overflow-x-auto text-xs text-slate-800">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
