"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { OnboardingCallout } from "@/components/common/onboarding-callout";
import { PageHeader } from "@/components/common/page-header";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ProjectWorkspaceBoard } from "@/components/screens/project-workspace-board";
import { canAccessAdminArea } from "@/lib/authz";
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
  const authQuery = useAuthSession();
  const projectQuery = useProject(projectId);
  const standardsQuery = useProgress(projectId, "standards");
  const authUser = authQuery.data?.user;
  const role = authUser?.role;
  const canAccessAdmin = canAccessAdminArea(authUser);
  const canReview = role && ["ADMIN", "LEAD", "REVIEWER", "APPROVER"].includes(role);

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
                Open Settings
              </Link>
            )}
          </div>
        }
      />

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
    </div>
  );
}
