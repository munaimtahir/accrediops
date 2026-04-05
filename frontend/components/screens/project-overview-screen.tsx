"use client";

import Link from "next/link";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/common/toaster";
import { Modal } from "@/components/common/modal";
import { CloneProjectForm } from "@/components/forms/clone-project-form";
import { ProjectManagementForm } from "@/components/forms/project-management-form";
import { useProject } from "@/lib/hooks/use-projects";
import { useProgress } from "@/lib/hooks/use-progress";
import { useProjectExport } from "@/lib/hooks/use-mutations";
import { usePhysicalRetrievalExport } from "@/lib/hooks/use-readiness";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  const { pushToast } = useToast();
  const authQuery = useAuthSession();
  const [showClone, setShowClone] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const projectQuery = useProject(projectId);
  const standardsQuery = useProgress(projectId, "standards");
  const excelExport = useProjectExport(projectId, "excel");
  const bundleExport = useProjectExport(projectId, "print-bundle");
  const physicalExportQuery = usePhysicalRetrievalExport(projectId);

  if (projectQuery.isLoading) {
    return <ProjectOverviewLoading />;
  }

  if (projectQuery.error) {
    return <ErrorPanel message={projectQuery.error.message} />;
  }

  const project = projectQuery.data;
  const standards = Array.isArray(standardsQuery.data) ? standardsQuery.data : [];
  const underReviewCount = standards.reduce((sum, item) => sum + ("in_review_count" in item ? item.in_review_count : 0), 0);
  const role = authQuery.data?.user?.role;
  const canClone = role === "ADMIN" || role === "LEAD";
  const canManage = role === "ADMIN" || role === "LEAD";
  const physicalItems = useMemo(
    () => (Array.isArray(physicalExportQuery.data?.items) ? physicalExportQuery.data.items : []),
    [physicalExportQuery.data?.items],
  );

  async function handleExport(format: "excel" | "print-bundle") {
    const mutation = format === "excel" ? excelExport : bundleExport;
    try {
      const result = await mutation.mutateAsync();
      pushToast(result.message, "info");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Export request failed.", "error");
    }
  }

  if (!project) {
    return <ErrorPanel message="Project not found." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={`${project.client_name} • ${project.accrediting_body_name} • Target ${formatDate(
          project.target_date,
        )}`}
        actions={
          <>
            <Link
              href={`/projects/${project.id}/worklist`}
              className={cn(buttonVariants({ variant: "default", size: "default" }))}
            >
              Go to worklist
            </Link>
            <Link
              href={`/projects/${project.id}/recurring`}
              className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
            >
              Go to recurring
            </Link>
            <Link
              href={`/projects/${project.id}/standards-progress`}
              className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
            >
              Standards progress
            </Link>
            <Link
              href={`/projects/${project.id}/areas-progress`}
              className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
            >
              Areas progress
            </Link>
            <Link
              href={`/projects/${project.id}/readiness`}
              className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
            >
              Readiness
            </Link>
            <Link
              href={`/projects/${project.id}/inspection`}
              className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
            >
              Inspection mode
            </Link>
            <Link
              href={`/projects/${project.id}/exports`}
              className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
            >
              Export history
            </Link>
            <Button
              variant="secondary"
              onClick={() => handleExport("excel")}
              loading={excelExport.isPending}
            >
              Export excel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleExport("print-bundle")}
              loading={bundleExport.isPending}
            >
              Print bundle
            </Button>
            <Button
              variant="secondary"
              onClick={() => physicalExportQuery.refetch()}
              loading={physicalExportQuery.isFetching}
              disabled={!canManage}
            >
              Physical retrieval
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowClone(true)}
              disabled={!canClone}
            >
              Clone project
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowManage(true)}
              disabled={!canManage}
            >
              Manage project
            </Button>
            <Link
              href={`/projects/${project.id}/print-pack`}
              className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
            >
              Print pack preview
            </Link>
            <Link
              href={`/projects/${project.id}/client-profile`}
              className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
            >
              Client profile
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Indicators total" value={project.total_indicators} />
        <MetricCard label="Met" value={project.met_indicators} />
        <MetricCard label="Pending" value={project.pending_indicators} />
        <MetricCard label="Overdue recurring" value={project.overdue_recurring_items} />
        <MetricCard label="Under review" value={underReviewCount} />
      </div>

      {physicalExportQuery.data ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold text-slate-950">Physical retrieval summary</h3>
          <p className="mt-2 text-sm text-slate-700">
            {physicalItems.length} evidence items with physical location metadata.
          </p>
          {physicalItems.length ? (
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {physicalItems.slice(0, 5).map((item, index) => (
                <li key={`${item.indicator_code}-${item.evidence_title}-${index}`}>
                  {item.indicator_code}: {item.evidence_title} • {item.binder_or_location || "No location"}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold text-slate-950">Project context</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Status</p>
              <p className="mt-1 text-sm text-slate-800">{project.status}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Start date</p>
              <p className="mt-1 text-sm text-slate-800">{formatDate(project.start_date)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Target date</p>
              <p className="mt-1 text-sm text-slate-800">{formatDate(project.target_date)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Framework ID</p>
              <p className="mt-1 text-sm text-slate-800">{project.framework}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold text-slate-950">Operator note</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {project.notes || "No project note recorded."}
          </p>
        </div>
      </div>

      <Modal
        open={showClone}
        title="Clone Project"
        description="Create a new project from this framework setup without copying evidence or comments."
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

      <Modal
        open={showManage}
        title="Manage project"
        description="Update project metadata, status, framework, and client profile linkage."
        onClose={() => setShowManage(false)}
      >
        <ProjectManagementForm
          project={project}
          onSuccess={() => {
            setShowManage(false);
          }}
        />
      </Modal>
    </div>
  );
}
