"use client";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { useFrameworkAnalysis } from "@/lib/hooks/use-framework-analysis";

export function FrameworkAnalysisScreen({ frameworkId }: { frameworkId: number }) {
  const query = useFrameworkAnalysis(frameworkId);
  if (query.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (query.error) return <ErrorPanel message={query.error.message} />;
  const data = (query.data ?? {}) as Record<string, unknown>;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Framework"
        title={`Framework analysis #${frameworkId}`}
        description="Indicator workload and evidence pattern analysis."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total indicators" value={Number(data.total_indicators ?? 0)} />
        <MetricCard label="Recurring indicators" value={Number(data.recurring_indicators ?? 0)} />
        <MetricCard label="One-time indicators" value={Number(data.one_time_indicators ?? 0)} />
        <MetricCard label="Physical evidence indicators" value={Number(data.physical_evidence_indicators ?? 0)} />
        <MetricCard label="Register/log indicators" value={Number(data.register_log_indicators ?? 0)} />
        <MetricCard label="Document indicators" value={Number(data.document_indicators ?? 0)} />
        <MetricCard label="Meeting/minutes indicators" value={Number(data.meeting_minutes_indicators ?? 0)} />
      </div>
    </div>
  );
}
