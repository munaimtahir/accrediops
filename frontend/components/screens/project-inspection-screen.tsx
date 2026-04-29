"use client";

import Link from "next/link";

import { ErrorPanel } from "@/components/common/error-panel";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { OnboardingCallout } from "@/components/common/onboarding-callout";
import { PageHeader } from "@/components/common/page-header";
import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
import { buttonVariants } from "@/components/ui/button";
import { canViewReadiness } from "@/lib/authz";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { useInspectionView, usePreInspectionCheck } from "@/lib/hooks/use-readiness";
import { cn } from "@/utils/cn";

export function ProjectInspectionScreen({ projectId }: { projectId: number }) {
  const authQuery = useAuthSession();
  const canAccessReadiness = canViewReadiness(authQuery.data?.user);
  const preCheck = usePreInspectionCheck(projectId);
  const inspection = useInspectionView(projectId);

  if (preCheck.isLoading || inspection.isLoading) {
    return <LoadingSkeleton className="h-56 w-full" />;
  }
  if (preCheck.error) return <ErrorPanel message={preCheck.error.message} />;
  if (inspection.error) return <ErrorPanel message={inspection.error.message} />;

  const check = (preCheck.data ?? {}) as Record<string, unknown>;
  const sections = ((inspection.data ?? {}).sections as Array<Record<string, unknown>> | undefined) ?? [];
  const missing = ((check.missing_evidence as unknown[]) ?? []).length;
  const unapproved = ((check.unapproved_items as unknown[]) ?? []).length;
  const overdue = ((check.overdue_recurring as unknown[]) ?? []).length;
  const highRisk = ((check.high_risk_indicators as unknown[]) ?? []).length;
  const hasBlocking = missing > 0 || unapproved > 0 || overdue > 0 || highRisk > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inspection"
        title="Inspection mode"
        description="Inspection-day view with only MET indicators, ordered by print pack structure."
      />
      <WorkflowContextStrip
        scope={`Project ${projectId} · Inspection mode`}
        current="Reviewing MET-only evidence structure for inspection execution."
        nextStep="Resolve blockers in worklist first, then return for final inspection traceability check."
        actions={
          canAccessReadiness
            ? [
                { label: "Back to project", href: `/projects/${projectId}` },
                { label: "Open worklist", href: `/projects/${projectId}/worklist` },
                { label: "Open readiness", href: `/projects/${projectId}/readiness` },
              ]
            : [
                { label: "Back to project", href: `/projects/${projectId}` },
                { label: "Open worklist", href: `/projects/${projectId}/worklist` },
              ]
        }
      />
      <OnboardingCallout
        storageKey={`inspection-${projectId}`}
        title="Inspection prep flow"
        description="Resolve blocking warnings first, then return here to verify MET-only evidence ordering for inspection use."
      />
      {hasBlocking ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="font-semibold">Blocking warnings detected</p>
          <p className="mt-1">
            Missing evidence {missing}, unapproved items {unapproved}, overdue recurring {overdue}, high-risk indicators{" "}
            {highRisk}.
          </p>
          <div className="mt-3">
            <Link
              href={`/projects/${projectId}/worklist?overdue=true`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Open worklist with overdue filter
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          Pre-inspection checks clear.
        </div>
      )}
      {!sections.length ? (
        <EmptyState
          title="No MET indicators available"
          description="Inspection view appears after indicators are marked MET through governed workflow."
          action={
            <Link
              href={`/projects/${projectId}/worklist`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Open worklist
            </Link>
          }
        />
      ) : null}
      {sections.map((section) => (
        <div key={String(section.name)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-950">{String(section.name)}</h3>
          <div className="mt-3 space-y-3">
            {((section.standards as Array<Record<string, unknown>> | undefined) ?? []).map((standard) => (
              <div key={String(standard.name)} className="rounded-lg border border-slate-200 p-3">
                <h4 className="font-semibold text-slate-900">{String(standard.name)}</h4>
                <div className="mt-2 space-y-2">
                  {((standard.indicators as Array<Record<string, unknown>> | undefined) ?? []).map((indicator) => (
                    <div key={String(indicator.project_indicator_id)} className="rounded border border-slate-200 p-3">
                      <p className="font-medium text-slate-900">{String(indicator.indicator_code)}</p>
                      <p className="mt-1 text-sm text-slate-700">{String(indicator.indicator_text ?? "")}</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {((indicator.evidence_list as Array<Record<string, unknown>> | undefined) ?? []).map((ev) => (
                          <li key={String(ev.id)}>
                            {String(ev.title)} • {String(ev.file_label ?? "no label")} •{" "}
                            {String(ev.physical_location_type ?? "No location")}
                            {ev.location_details ? ` (${String(ev.location_details)})` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
