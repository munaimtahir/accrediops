"use client";

import { useMemo } from "react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { NextActionBanner } from "@/components/common/next-action-banner";
import { PageHeader } from "@/components/common/page-header";
import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
import { Badge } from "@/components/ui/badge";
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
  
  const projectSummary = printBundle.data?.data?.project_summary;
  const sections = useMemo(() => {
    if (!printBundle.data?.data) {
      return [];
    }
    return printBundle.data.data.sections ?? [];
  }, [printBundle.data?.data]);

  const consolidatedLists = printBundle.data?.data?.consolidated_lists;

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

  if (readiness.error) {
    return <ErrorPanel message={readiness.error.message} />;
  }

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
  const exportReady = !readiness.isLoading && exportBlockers.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Exports"
        title="Inspection Pack Preview"
        description="Structured inspection pack with area → standard → indicator → evidence ordering."
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
              title="Print this inspection pack"
            >
              Print
            </Button>
            <Button
              onClick={() => printBundle.mutate()}
              loading={printBundle.isPending}
              disabled={!exportReady}
              title={exportReady ? "Generate inspection pack" : "Resolve export blockers before generation."}
            >
              Generate Inspection Pack
            </Button>
          </div>
        }
      />

      <WorkflowContextStrip
        scope={`Project ${projectId} · Inspection Pack`}
        current="Previewing inspection pack structure and evidence ordering."
        nextStep="Generate the inspection pack, then verify indicator evidence labels and physical locations."
        actions={[
          { label: "Back to project", href: `/projects/${projectId}` },
          { label: "Open export history", href: `/projects/${projectId}/exports` },
          { label: "Open worklist", href: `/projects/${projectId}/worklist` },
        ]}
      />
      <NextActionBanner
        action={exportReady ? "Generate the inspection pack preview and verify evidence ordering." : "Resolve export blockers before generating the inspection pack."}
        reason={
          exportReady
            ? "The project is ready for governed inspection pack output."
            : "Inspection pack generation is governed by the same readiness and approval rules as other exports."
        }
        status={`Sections loaded: ${sections.length} • Readiness score: ${projectSummary?.overall_readiness_score ? (projectSummary.overall_readiness_score * 100).toFixed(0) + "%" : "N/A"}`}
        blockers={exportBlockers}
      />

      {readiness.isLoading || printBundle.isPending ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-40 w-full" />
          <LoadingSkeleton className="h-40 w-full" />
        </div>
      ) : null}

      {printBundle.error ? <ErrorPanel message={printBundle.error.message} /> : null}

      {!sections.length && !printBundle.isPending && !printBundle.error ? (
        <EmptyState
          title="No inspection pack generated"
          description="Generate inspection pack to preview evidence structure and print order."
        />
      ) : null}

      {/* Project Summary */}
      {projectSummary && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-950">Project Summary</h3>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-slate-500">Project Name</dt>
              <dd className="mt-1 text-sm text-slate-900">{projectSummary.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-slate-500">Framework</dt>
              <dd className="mt-1 text-sm text-slate-900">{projectSummary.framework_name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-slate-500">Generated On</dt>
              <dd className="mt-1 text-sm text-slate-900">{new Date(projectSummary.date_generated).toLocaleString()}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-slate-500">Client</dt>
              <dd className="mt-1 text-sm text-slate-900">{projectSummary.client_info.organization_name}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Overall Readiness</dt>
              <dd className="mt-1 text-sm text-slate-900">
                <Badge variant={projectSummary.overall_readiness_score >= 0.8 ? "success" : projectSummary.overall_readiness_score >= 0.5 ? "warning" : "destructive"}>
                  {(projectSummary.overall_readiness_score * 100).toFixed(0)}% Ready
                </Badge>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Indicator Summary</dt>
              <dd className="mt-1 text-sm text-slate-900">
                Total: {projectSummary.total_indicators} • Met: {projectSummary.met_indicators} • Partial: {projectSummary.partial_indicators} • Missing: {projectSummary.missing_indicators}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 shadow-panel">
        <p className="font-semibold">AI Advisory Disclaimer:</p>
        <p className="mt-1">
          This inspection pack may contain AI-assisted drafts. AI-generated drafts are not final evidence until
          reviewed and promoted. Always verify all content against official policies and client context.
        </p>
      </div>

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
                        {indicator.indicator_code} — <Badge>{indicator.status}</Badge> — Risk: <Badge variant={indicator.readiness_summary.risk_level === "HIGH" ? "destructive" : indicator.readiness_summary.risk_level === "MEDIUM" ? "warning" : "default"}>{indicator.readiness_summary.risk_level}</Badge>
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{indicator.indicator_text}</p>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                        {indicator.assigned_owner && <div><strong>Owner:</strong> {indicator.assigned_owner}</div>}
                        {indicator.assigned_reviewer && <div><strong>Reviewer:</strong> {indicator.assigned_reviewer}</div>}
                        {indicator.assigned_approver && <div><strong>Approver:</strong> {indicator.assigned_approver}</div>}
                      </div>

                      {/* Evidence List */}
                      {indicator.evidence_list.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-semibold text-slate-800">Linked Evidence:</h5>
                          <ul className="mt-1 space-y-1 text-sm text-slate-700">
                            {indicator.evidence_list.map((evidence) => (
                              <li key={evidence.id}>
                                #{evidence.order} {evidence.title} <Badge>{evidence.approval_status}</Badge> • {evidence.file_label || "no label"}
                                {" • "}
                                {evidence.physical_location_type || "No location"}
                                {evidence.location_details ? ` (${evidence.location_details})` : ""}
                                {evidence.reviewed_by && <span className="text-xs text-slate-500 ml-2">Reviewed by {evidence.reviewed_by} on {new Date(evidence.reviewed_at).toLocaleDateString()}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* AI Drafts Advisory */}
                      {indicator.ai_drafts_advisory.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-semibold text-orange-800">AI Drafts (Advisory, Review Required):</h5>
                          <ul className="mt-1 space-y-1 text-sm text-orange-700">
                            {indicator.ai_drafts_advisory.map((draft) => (
                              <li key={draft.id}>
                                <Badge variant="warning">AI Draft</Badge> {draft.title} [{draft.review_status}] • Generated by {draft.generated_by} on {new Date(draft.generated_at).toLocaleDateString()}
                                <p className="text-xs text-orange-600 mt-1 pl-2">Preview: {draft.draft_content_preview}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Promoted AI Drafts */}
                      {indicator.promoted_ai_drafts.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-semibold text-green-800">Promoted AI Drafts (Linked to Evidence):</h5>
                          <ul className="mt-1 space-y-1 text-sm text-green-700">
                            {indicator.promoted_ai_drafts.map((draft) => (
                              <li key={draft.id}>
                                <Badge variant="success">Promoted AI Draft</Badge> {draft.title} • Linked to Evidence ID: {draft.promoted_evidence_id}
                                <p className="text-xs text-green-600 mt-1 pl-2">Generated by {draft.generated_by} on {new Date(draft.generated_at).toLocaleDateString()}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Consolidated Lists */}
      {consolidatedLists && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-panel space-y-4">
          <h3 className="text-lg font-semibold text-slate-950">Consolidated Lists</h3>

          {/* Missing Evidence */}
          {consolidatedLists.missing_evidence?.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-800">Missing Evidence:</h4>
              <ul className="mt-1 space-y-1 text-sm text-red-700">
                {consolidatedLists.missing_evidence.map((item, index) => (
                  <li key={index}>
                    <Badge variant="destructive">Missing</Badge> Indicator {item.indicator_code} - {item.missing_evidence_count} item(s) missing.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Partial Evidence */}
          {consolidatedLists.partial_evidence?.length > 0 && (
            <div>
              <h4 className="font-semibold text-yellow-800">Partial/Unapproved Evidence:</h4>
              <ul className="mt-1 space-y-1 text-sm text-yellow-700">
                {consolidatedLists.partial_evidence.map((item, index) => (
                  <li key={index}>
                    <Badge variant="warning">Partial</Badge> Indicator {item.indicator_code} - {item.unapproved_evidence_count} item(s) unapproved.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Drafts for Review */}
          {consolidatedLists.ai_drafts_for_review?.length > 0 && (
            <div>
              <h4 className="font-semibold text-orange-800">AI Drafts Requiring Review:</h4>
              <ul className="mt-1 space-y-1 text-sm text-orange-700">
                {consolidatedLists.ai_drafts_for_review.map((item) => (
                  <li key={item.project_indicator_id}>
                    <Badge variant="warning">AI Draft</Badge> Indicator {item.indicator_code} - {item.title} [{item.review_status}]
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
