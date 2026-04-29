"use client";

import Link from "next/link";
import { useMemo } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { OnboardingCallout } from "@/components/common/onboarding-callout";
import { PageHeader } from "@/components/common/page-header";
import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProject } from "@/lib/hooks/use-projects";
import { useWorklist } from "@/lib/hooks/use-worklist";
import { cn } from "@/utils/cn";
import { formatDate, formatUserName } from "@/utils/format";

function PendingActionsLoading() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton className="h-24 w-full" />
      <LoadingSkeleton className="h-40 w-full" />
      <LoadingSkeleton className="h-40 w-full" />
    </div>
  );
}

export function ProjectPendingActionsScreen({ projectId }: { projectId: number }) {
  const projectQuery = useProject(projectId);
  const worklistQuery = useWorklist({
    project_id: projectId,
    page: 1,
    page_size: "all",
  });

  const pendingRows = useMemo(
    () =>
      (worklistQuery.data?.results ?? []).filter(
        (row) => row.notes.trim().length > 0 && row.current_status !== "MET",
      ),
    [worklistQuery.data?.results],
  );

  function handlePrint() {
    window.print();
  }

  if (projectQuery.isLoading || worklistQuery.isLoading) {
    return <PendingActionsLoading />;
  }

  if (projectQuery.error) {
    return <ErrorPanel message={projectQuery.error.message} />;
  }

  if (worklistQuery.error) {
    return <ErrorPanel message={worklistQuery.error.message} />;
  }

  const project = projectQuery.data;

  if (!project) {
    return <ErrorPanel message="Project not found." />;
  }

  return (
    <div className="space-y-6">
      <style jsx global>{`
        @media print {
          .pending-actions-print-controls,
          .pending-actions-print-hint {
            display: none !important;
          }

          .pending-actions-print-card {
            break-inside: avoid;
            box-shadow: none !important;
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>

      <PageHeader
        eyebrow="Project"
        title="Pending actions"
        description={`Printable list of operator-entered pending tasks for ${project.name}.`}
        actions={
          <div className="pending-actions-print-controls flex flex-wrap gap-2">
            <Link
              href={`/projects/${project.id}/worklist`}
              className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
            >
              Back to worklist
            </Link>
            <Button onClick={handlePrint}>Print actionable list</Button>
          </div>
        }
      />

      <WorkflowContextStrip
        scope={`Project ${projectId} · Pending actions`}
        current="Reviewing all non-empty working notes that still require follow-up."
        nextStep="Print this page or open each indicator from the worklist to clear the listed tasks."
        actions={[
          { label: "Project home", href: `/projects/${projectId}` },
          { label: "Workbench", href: `/projects/${projectId}/worklist` },
          { label: "Recurring queue", href: `/projects/${projectId}/recurring` },
        ]}
      />

      <div className="pending-actions-print-hint rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">What is included</p>
        <p className="mt-1">
          This list shows indicators with working notes entered by users and excludes indicators already marked MET.
        </p>
      </div>

      <OnboardingCallout
        storageKey={`pending-actions-${projectId}`}
        title="Printable task roll-up"
        description="Use this page when you need a hard-copy checklist of open operator notes across all indicators in the project."
      />

      <Card className="pending-actions-print-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{project.name}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {project.client_name} • {project.accrediting_body_name} • Target {formatDate(project.target_date)}
            </p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{pendingRows.length} pending action items</p>
            <p>Generated from working notes</p>
          </div>
        </div>

        {pendingRows.length ? (
          <div className="mt-4 space-y-4">
            {pendingRows.map((row) => (
              <article
                key={row.project_indicator_id}
                className="pending-actions-print-card rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {row.area_name} • {row.standard_name}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-950">{row.indicator_code}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-800">{row.indicator_text}</p>
                  </div>
                  <div className="min-w-[180px] text-sm text-slate-600">
                    <p>Status: {row.current_status}</p>
                    <p>Priority: {row.priority}</p>
                    <p>Owner: {row.owner ? formatUserName(row.owner) : "Unassigned"}</p>
                    <p>Due: {row.due_date ? formatDate(row.due_date) : "Not set"}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Action description</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-900">{row.notes}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No pending actions recorded"
              description="No non-empty working notes are currently recorded on unfinished indicators for this project."
              action={
                <Link
                  href={`/projects/${project.id}/worklist`}
                  className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
                >
                  Open worklist
                </Link>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
