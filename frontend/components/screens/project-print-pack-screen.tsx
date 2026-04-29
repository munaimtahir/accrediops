"use client";

import { useMemo } from "react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { NextActionBanner } from "@/components/common/next-action-banner";
import { PageHeader } from "@/components/common/page-header";
import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { canViewExports, getRestrictionMessage } from "@/lib/authz";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { useProjectExport } from "@/lib/hooks/use-mutations";
import { useProjectReadiness } from "@/lib/hooks/use-readiness";
import { cn } from "@/utils/cn";

export function ProjectPrintPackScreen({ projectId }: { projectId: number }) {
  const authQuery = useAuthSession();
  const canManageExports = canViewExports(authQuery.data?.user);
  const effectiveProjectId = canManageExports ? projectId : Number.NaN;
  const printBundle = useProjectExport(projectId, "print-bundle");
  const readiness = useProjectReadiness(effectiveProjectId);

  if (authQuery.isLoading) {
    return <LoadingSkeleton className="h-40 w-full" />;
  }

  if (!canManageExports) {
    return (
      <EmptyState
        title="Print pack access restricted"
        description={getRestrictionMessage("exports")}
        action={
          <Link href={`/projects/${projectId}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            Back to project
          </Link>
        }
      />
    );
  }

  if (readiness.isLoading) {
    return <LoadingSkeleton className="h-40 w-full" />;
  }
  if (readiness.error) {
    return <ErrorPanel message={readiness.error.message} />;
  }

  const sections = useMemo(() => {
    if (!printBundle.data) {
      return [];
    }
    return printBundle.data.sections ?? printBundle.data.bundle?.sections ?? [];
  }, [printBundle.data]);
  const readinessData = (readiness.data ?? {}) as Record<string, unknown>;
  const exportBlockers = [
    Number(readinessData.percent_met ?? 0) < 100
      ? `Project readiness is incomplete: ${Number(readinessData.percent_met ?? 0)}% of indicators are met.`
      : "",
    Number(readinessData.recurring_compliance_score ?? 0) < 100
      ? `Recurring compliance is ${Number(readinessData.recurring_compliance_score ?? 0)}%, not 100%.`
      : "",
    Array.isArray(readinessData.high_risk_indicators) && readinessData.high_risk_indicators.length > 0
      ? `Critical indicators pending: ${readinessData.high_risk_indicators.length}`
      : "",
  ].filter(Boolean);
  const exportReady = exportBlockers.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Exports"
        title="Print pack preview"
        description="Structured print pack with area → standard → indicator → evidence ordering."
        actions={
          <Button
            onClick={() => printBundle.mutate()}
            loading={printBundle.isPending}
            disabled={!exportReady}
            title={exportReady ? "Generate print pack preview" : "Resolve export blockers before generation."}
          >
            Generate Print Pack
          </Button>
        }
      />

      <WorkflowContextStrip
        scope={`Project ${projectId} · Print pack`}
        current="Previewing print-bundle structure and evidence ordering."
        nextStep="Generate the print pack, then verify indicator evidence labels and physical locations."
        actions={[
          { label: "Back to project", href: `/projects/${projectId}` },
          { label: "Open export history", href: `/projects/${projectId}/exports` },
          { label: "Open worklist", href: `/projects/${projectId}/worklist` },
        ]}
      />
      <NextActionBanner
        action={exportReady ? "Generate the print pack preview and verify evidence ordering." : "Resolve export blockers before generating the print pack."}
        reason={
          exportReady
            ? "The project is ready for governed print-pack output."
            : "Print-pack generation is governed by the same readiness and approval rules as other exports."
        }
        status={`Sections loaded: ${sections.length} • Readiness score: ${Number(readinessData.overall_score ?? 0)}`}
        blockers={exportBlockers}
      />

      {printBundle.isPending ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-40 w-full" />
          <LoadingSkeleton className="h-40 w-full" />
        </div>
      ) : null}

      {printBundle.error ? <ErrorPanel message={printBundle.error.message} /> : null}

      {!sections.length && !printBundle.isPending && !printBundle.error ? (
        <EmptyState
          title="No print pack generated"
          description="Generate print pack to preview evidence structure and print order."
        />
      ) : null}

      {sections.map((section) => (
        <div key={section.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-950">{section.name}</h3>
          <div className="mt-3 space-y-3">
            {section.standards.map((standard) => (
              <div key={standard.name} className="rounded-lg border border-slate-200 p-3">
                <h4 className="font-semibold text-slate-900">{standard.name}</h4>
                <div className="mt-2 space-y-2">
                  {standard.indicators.map((indicator) => (
                    <div key={indicator.project_indicator_id} className="rounded border border-slate-200 p-3">
                      <p className="font-medium text-slate-900">
                        {indicator.indicator_code} — {indicator.status}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{indicator.indicator_text}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Reuse: {indicator.reusable_template_allowed ? "Allowed" : "Not allowed"} • Policy:{" "}
                        {indicator.evidence_reuse_policy}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {indicator.evidence_list.map((evidence) => (
                          <li key={evidence.id}>
                            #{evidence.order} {evidence.title} [{evidence.approval_status}] • {evidence.file_label || "no label"}
                            {" • "}
                            {evidence.physical_location_type || "No location"}
                            {evidence.location_details ? ` (${evidence.location_details})` : ""}
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
