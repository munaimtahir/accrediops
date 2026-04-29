"use client";

import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { NextActionBanner } from "@/components/common/next-action-banner";
import { OnboardingCallout } from "@/components/common/onboarding-callout";
import { PageHeader } from "@/components/common/page-header";
import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
import { buttonVariants } from "@/components/ui/button";
import { canViewReadiness, getRestrictionMessage } from "@/lib/authz";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { useProjectReadiness } from "@/lib/hooks/use-readiness";
import { cn } from "@/utils/cn";

export function ProjectReadinessScreen({ projectId }: { projectId: number }) {
  const authQuery = useAuthSession();
  const canAccessReadiness = canViewReadiness(authQuery.data?.user);
  const query = useProjectReadiness(canAccessReadiness ? projectId : Number.NaN);

  if (authQuery.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (!canAccessReadiness) {
    return (
      <EmptyState
        title="Readiness access restricted"
        description={getRestrictionMessage("readiness")}
        action={
          <Link href={`/projects/${projectId}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            Back to project
          </Link>
        }
      />
    );
  }

  if (query.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (query.error) return <ErrorPanel message={query.error.message} />;
  const data = (query.data ?? {}) as Record<string, unknown>;
  const highRiskIndicators = Array.isArray(data.high_risk_indicators) ? data.high_risk_indicators.length : 0;
  const readinessAction =
    highRiskIndicators > 0
      ? "Resolve high-risk indicators before relying on readiness outputs."
      : Number(data.percent_blocked ?? 0) > 0
        ? "Clear blocked indicators from the worklist."
        : "Use worklist and recurring queue to lift the final readiness score to 100%.";
  const readinessReason =
    highRiskIndicators > 0
      ? `${highRiskIndicators} high-risk indicator(s) still need corrective action.`
      : `Overall score is ${Number(data.overall_score ?? 0)} with recurring compliance at ${Number(
          data.recurring_compliance_score ?? 0,
        )}%.`;
  const readinessStatus = `Met: ${Number(data.percent_met ?? 0)}% • In progress: ${Number(
    data.percent_in_progress ?? 0,
  )}% • Blocked: ${Number(data.percent_blocked ?? 0)}%`;
  const readinessBlockers = [
    highRiskIndicators > 0 ? `Critical indicators pending: ${highRiskIndicators}` : "",
    Number(data.recurring_compliance_score ?? 0) < 100
      ? `Recurring compliance is ${Number(data.recurring_compliance_score ?? 0)}%, not 100%.`
      : "",
  ].filter(Boolean);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Readiness"
        title="Project readiness"
        description="Readiness summarizes current execution posture. Use worklist and recurring queue to improve low scores."
        actions={
          <>
            <Link
              href={`/projects/${projectId}/worklist`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Open worklist
            </Link>
            <Link
              href={`/projects/${projectId}/recurring`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Open recurring queue
            </Link>
          </>
        }
      />
      <WorkflowContextStrip
        scope={`Project ${projectId} · Readiness`}
        current="Reviewing execution risk and readiness metrics."
        nextStep="Use worklist and recurring queue to clear low-scoring dimensions, then re-check readiness."
        actions={[
          { label: "Back to project", href: `/projects/${projectId}` },
          { label: "Open worklist", href: `/projects/${projectId}/worklist` },
          { label: "Open recurring queue", href: `/projects/${projectId}/recurring` },
        ]}
      />
      <NextActionBanner
        action={readinessAction}
        reason={readinessReason}
        status={readinessStatus}
        blockers={readinessBlockers}
      />
      <OnboardingCallout
        storageKey={`readiness-${projectId}`}
        title="Interpreting readiness"
        description="If blocked or recurring compliance is low, open Worklist for indicator actions and Recurring queue for due submissions."
      />
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
