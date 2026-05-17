"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { Modal } from "@/components/common/modal";
import { NextActionBanner } from "@/components/common/next-action-banner";
import { OnboardingCallout } from "@/components/common/onboarding-callout";
import { PageHeader } from "@/components/common/page-header";
import { CloneProjectForm } from "@/components/forms/clone-project-form";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProjectWorkspaceBoard } from "@/components/screens/project-workspace-board";
import { canAccessAdminArea, canViewExports, canViewReadiness, getRestrictionMessage } from "@/lib/authz";
import { useProject } from "@/lib/hooks/use-projects";
import { useProgress } from "@/lib/hooks/use-progress";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

function ProjectOverviewLoading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-24 w-full" />
      <div className="grid gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      <LoadingSkeleton className="h-48 w-full" />
    </div>
  );
}

export function ProjectOverviewScreen({ projectId }: { projectId: number }) {
  const router = useRouter();
  const authQuery = useAuthSession();
  const projectQuery = useProject(projectId);
  const standardsQuery = useProgress(projectId, "standards");
  const authUser = authQuery.data?.user;
  const role = authUser?.role;
  const canAccessAdmin = canAccessAdminArea(authUser);
  const canReview = role && ["ADMIN", "LEAD", "REVIEWER", "APPROVER"].includes(role);
  const canSeeReadiness = canViewReadiness(authUser);
  const canSeeExports = canViewExports(authUser);
  const canClone = role && ["ADMIN", "LEAD"].includes(role);
  const [showClone, setShowClone] = useState(false);

  const underReviewCount = useMemo(() => {
    const standards = Array.isArray(standardsQuery.data) ? standardsQuery.data : [];
    return standards.reduce((sum, item) => sum + ("in_review_count" in item ? item.in_review_count : 0), 0);
  }, [standardsQuery.data]);

  if (projectQuery.isLoading) {
    return <ProjectOverviewLoading />;
  }

  if (projectQuery.error) {
    return <ErrorPanel message={projectQuery.error.message} />;
  }

  const project = projectQuery.data;

  if (!project) {
    return <ErrorPanel message="Project not found." />;
  }

  const nextAction = "Open Worklist and operate indicators";
  const nextReason = "Worklist is the primary workspace to add evidence, request AI assistance, and submit indicators for review.";
  const nextStatus = `${project.met_indicators}/${project.total_indicators} indicators met • ${project.pending_indicators} pending`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project Dashboard"
        title={project.name}
        description={`${project.client_name} • ${project.accrediting_body_name} • Target ${formatDate(
          project.target_date,
        )}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${project.id}/worklist`}
              className={cn(buttonVariants({ variant: "default", size: "default" }))}
            >
              Open Worklist
            </Link>
            {canReview && (
              <Link
                href={`/projects/${project.id}/inspection`}
                className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
              >
                Open Review / Inspection
              </Link>
            )}
            {canAccessAdmin && (
              <Link
                href="/admin"
                className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
              >
                Open Admin Dashboard
              </Link>
            )}
            {canClone ? (
              <button
                type="button"
                className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
                onClick={() => setShowClone(true)}
              >
                Clone project
              </button>
            ) : null}
          </div>
        }
      />

      <NextActionBanner action={nextAction} reason={nextReason} status={nextStatus} />

      <section className="grid gap-3 lg:grid-cols-3">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-950">Gap & CAPA workspace</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review open, overdue, and export-blocking CAPA across the project in one workspace.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/projects/${project.id}/capa`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
              Open CAPA workspace
            </Link>
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-950">Operate indicators</h2>
          <p className="mt-1 text-sm text-slate-600">
            Add evidence, update working notes, use AI assistance, and submit indicators for review.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/projects/${project.id}/worklist`} className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              Open worklist
            </Link>
            <Link href={`/projects/${project.id}/recurring`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
              Recurring queue
            </Link>
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-950">Review readiness</h2>
          <p className="mt-1 text-sm text-slate-600">
            Inspect what is missing, what is unapproved, and what is overdue before marking indicators met.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {canSeeReadiness ? (
              <Link
                href={`/projects/${project.id}/readiness`}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              >
                Readiness
              </Link>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                disabled
                title={getRestrictionMessage("readiness")}
                aria-label={`Readiness (${getRestrictionMessage("readiness")})`}
              >
                Readiness
              </Button>
            )}
            <Link href={`/projects/${project.id}/inspection`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
              Inspection view
            </Link>
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-950">Export and documentation</h2>
          <p className="mt-1 text-sm text-slate-600">
            Generate packs and exports for inspection preparation. Drafts remain advisory until governed promotion.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {canSeeExports ? (
              <Link
                href={`/projects/${project.id}/print-pack`}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              >
                Print pack preview
              </Link>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                disabled
                title={getRestrictionMessage("exports")}
                aria-label={`Print pack preview (${getRestrictionMessage("exports")})`}
              >
                Print pack preview
              </Button>
            )}
            {canSeeExports ? (
              <Link
                href={`/projects/${project.id}/exports`}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              >
                Export history
              </Link>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                disabled
                title={getRestrictionMessage("exports")}
                aria-label={`Export history (${getRestrictionMessage("exports")})`}
              >
                Export history
              </Button>
            )}
          </div>
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Indicators total" value={project.total_indicators} />
        <MetricCard label="Met" value={project.met_indicators} />
        <MetricCard label="Pending" value={project.pending_indicators} />
        <MetricCard label="Overdue recurring" value={project.overdue_recurring_items} />
        <MetricCard label="Under review" value={underReviewCount} />
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-slate-950">Priority Work</h3>
        <p className="mt-2 text-sm text-slate-600">
          Focus on these items to keep the project on track.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/projects/${project.id}/worklist?overdue=true`}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Overdue items
          </Link>
          <Link
            href={`/projects/${project.id}/worklist?due_today=true`}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Due today
          </Link>
          <Link
            href={`/projects/${project.id}/worklist?status=UNDER_REVIEW`}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Under review
          </Link>
          <Link
            href={`/projects/${project.id}/recurring?overdue=true`}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Missing evidence
          </Link>
        </div>
      </Card>
      
      <OnboardingCallout
        storageKey={`project-overview-simplified-${project.id}`}
        title="Quick Tip"
        description="Open an indicator from the worklist to update evidence, use AI assistance, or send for review."
      />

      <ProjectWorkspaceBoard projectId={project.id} />

      <Modal
        open={showClone}
        title="Clone project"
        description="Create a copy of this project for reuse. Indicators remain governed and evidence remains project-specific."
        onClose={() => setShowClone(false)}
      >
        <CloneProjectForm
          projectId={project.id}
          onSuccess={(newProjectId) => {
            setShowClone(false);
            router.push(`/projects/${newProjectId}`);
          }}
        />
      </Modal>
    </div>
  );
}
