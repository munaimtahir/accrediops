"use client";

import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Modal } from "@/components/common/modal";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { CreateProjectForm } from "@/components/forms/create-project-form";
import { ProjectManagementForm } from "@/components/forms/project-management-form";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/hooks/use-projects";
import { Project } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import { useRouter } from "next/navigation";

function ProjectsLoading() {
  return (
    <div className="space-y-3">
      <LoadingSkeleton className="h-28 w-full" />
      <LoadingSkeleton className="h-28 w-full" />
      <LoadingSkeleton className="h-28 w-full" />
    </div>
  );
}

export function ProjectsListScreen() {
  const router = useRouter();
  const authQuery = useAuthSession();
  const projectsQuery = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [projectToManage, setProjectToManage] = useState<Project | null>(null);

  if (projectsQuery.isLoading) {
    return <ProjectsLoading />;
  }

  if (projectsQuery.error) {
    return <ErrorPanel message={projectsQuery.error.message} />;
  }

  const projects = projectsQuery.data?.results ?? [];
  const role = authQuery.data?.user?.role;
  const canCreate = role === "ADMIN" || role === "LEAD";
  const canManage = role === "ADMIN" || role === "LEAD";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Project register"
        description="Create, initialize, and operate accreditation workspaces with governed status flow and evidence-first execution."
        actions={
          <Button onClick={() => setShowCreate(true)} disabled={!canCreate}>
            Create project
          </Button>
        }
      />

      <WorkbenchTable<Project>
        dense={false}
        columns={[
          {
            key: "project",
            header: "Project",
            render: (project) => (
              <div className="space-y-1">
                <p className="font-semibold text-slate-950">{project.name}</p>
                <p className="text-sm text-slate-600">
                  {project.client_name} • {project.accrediting_body_name}
                </p>
                <span className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
                  {project.status}
                </span>
              </div>
            ),
          },
          {
            key: "dates",
            header: "Window",
            render: (project) => (
              <div className="space-y-1 text-sm text-slate-700">
                <p>Start {formatDate(project.start_date)}</p>
                <p>Target {formatDate(project.target_date)}</p>
              </div>
            ),
          },
          {
            key: "progress",
            header: "Progress Summary",
            render: (project) => (
              <div className="space-y-1 text-sm text-slate-700">
                <p>
                  {project.met_indicators} met / {project.total_indicators} total
                </p>
                <p>{project.pending_indicators} pending</p>
              </div>
            ),
          },
          {
            key: "counts",
            header: "Operational Counts",
            render: (project) => (
              <div className="space-y-1 text-sm text-slate-700">
                <p>Total indicators: {project.total_indicators}</p>
                <p>Met: {project.met_indicators}</p>
                <p>Pending: {project.pending_indicators}</p>
                <p>Overdue recurring: {project.overdue_recurring_items}</p>
              </div>
            ),
          },
          {
            key: "actions",
            header: "Action",
            className: "w-[260px]",
            render: (project) => (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/projects/${project.id}`}
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                >
                  Open project
                </Link>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setProjectToManage(project)}
                  disabled={!canManage}
                >
                  Manage
                </Button>
              </div>
            ),
          },
        ]}
        rows={projects}
        rowKey={(project) => project.id}
        empty={
          <EmptyState
            title="No projects available"
            description="Project records will appear here once the backend returns workspaces."
          />
        }
      />
      <Modal
        open={showCreate}
        title="Create project"
        description="Create a new project and initialize governed indicators from a selected framework."
        onClose={() => setShowCreate(false)}
      >
        <CreateProjectForm
          onSuccess={(projectId) => {
            setShowCreate(false);
            router.push(`/projects/${projectId}`);
          }}
        />
      </Modal>
      <Modal
        open={Boolean(projectToManage)}
        title="Manage project"
        description="Update project metadata, status, framework, and client profile linkage."
        onClose={() => setProjectToManage(null)}
      >
        {projectToManage ? (
          <ProjectManagementForm
            project={projectToManage}
            onSuccess={() => {
              setProjectToManage(null);
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
