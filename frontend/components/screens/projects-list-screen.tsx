"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Modal } from "@/components/common/modal";
import { OnboardingCallout } from "@/components/common/onboarding-callout";
import { PageHeader } from "@/components/common/page-header";
import { PermissionHint } from "@/components/common/permission-hint";
import { StatusSemanticBadge } from "@/components/common/status-semantic-badge";
import { CreateProjectForm } from "@/components/forms/create-project-form";
import { ProjectManagementForm } from "@/components/forms/project-management-form";
import { canCreateProject, getRestrictionMessage } from "@/lib/authz";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFrameworks } from "@/lib/hooks/use-frameworks";
import { useProjects } from "@/lib/hooks/use-projects";
import { Project } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import { getProjectStatusTone } from "@/utils/status-semantics";
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
  const frameworksQuery = useFrameworks();
  const projectsQuery = useProjects();
  const projects = projectsQuery.data?.results ?? [];
  const frameworkById = useMemo(() => {
    const rows = Array.isArray(frameworksQuery.data) ? frameworksQuery.data : [];
    return new Map(rows.map((framework) => [framework.id, framework.name]));
  }, [frameworksQuery.data]);
  const [showCreate, setShowCreate] = useState(false);
  const [projectToManage, setProjectToManage] = useState<Project | null>(null);
  const [showPowerTable, setShowPowerTable] = useState(false);

  if (projectsQuery.isLoading) {
    return <ProjectsLoading />;
  }

  if (projectsQuery.error) {
    return <ErrorPanel message={projectsQuery.error.message} />;
  }

  const role = authQuery.data?.user?.role;
  const canCreate = canCreateProject(authQuery.data?.user);
  const canManage = canCreate;
  const projectRestrictionMessage = getRestrictionMessage("projectCreation");
  const roleGuidance = canCreate
    ? "You can create and initialize projects from this register."
    : `You can view and open projects. ${projectRestrictionMessage}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Project register"
        description="Create, initialize, and operate accreditation workspaces with governed status flow and evidence-first execution."
        actions={
          <Button
            onClick={() => setShowCreate(true)}
            disabled={!canCreate}
            title={canCreate ? "Create a new project workspace" : projectRestrictionMessage}
            aria-label={canCreate ? "Create project" : `Create project (${projectRestrictionMessage})`}
          >
            Create project
          </Button>
        }
      />

      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <p className="font-semibold">Where to start</p>
        <p className="mt-1">{roleGuidance}</p>
      </div>

      <OnboardingCallout
        storageKey={`projects-register-${role ?? "unknown"}`}
        title="First-time flow"
        description={
          canCreate
            ? "Create a project, initialize from framework, then open the project worklist to begin evidence-first execution."
            : "Open an existing project and start from worklist. If you need a new project, request ADMIN or LEAD support."
        }
      />

      <PermissionHint allowed={canCreate}>
        {projectRestrictionMessage}
      </PermissionHint>

      {projects.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const progressPercent =
              project.total_indicators > 0
                ? Math.round((project.met_indicators / project.total_indicators) * 100)
                : 0;
            return (
              <Card key={project.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">{project.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{project.client_name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Framework: {frameworkById.get(project.framework) ?? `#${project.framework}`} •{" "}
                      {project.accrediting_body_name}
                    </p>
                  </div>
                  <StatusSemanticBadge tone={getProjectStatusTone(project.status)} />
                </div>
                <div className="mt-4 space-y-1 text-xs text-slate-600">
                  <p>
                    Progress: {project.met_indicators}/{project.total_indicators} indicators met ({progressPercent}%)
                  </p>
                  <p>
                    Pending {project.pending_indicators} • Overdue recurring {project.overdue_recurring_items}
                  </p>
                  <p>
                    Window {formatDate(project.start_date)} → {formatDate(project.target_date)}
                  </p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/projects/${project.id}`} className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
                    Open project
                  </Link>
                  <Link
                    href={`/projects/${project.id}/client-profile`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                  >
                    Client profile
                  </Link>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setProjectToManage(project)}
                    disabled={!canManage}
                    title={canManage ? "Manage selected project" : projectRestrictionMessage}
                    aria-label={canManage ? "Manage project" : `Manage project (${projectRestrictionMessage})`}
                  >
                    Manage
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No projects available"
          description={
            canCreate
              ? "Create your first project to start indicator initialization and daily workbench execution."
              : "No projects are currently assigned to your access scope."
          }
          action={
            canCreate ? (
              <Button onClick={() => setShowCreate(true)}>Create first project</Button>
            ) : (
              <span className="text-xs text-slate-500">{projectRestrictionMessage}</span>
            )
          }
        />
      )}

      {projects.length ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Power view</p>
            <Button size="sm" variant="secondary" onClick={() => setShowPowerTable((current) => !current)}>
              {showPowerTable ? "Hide power table" : "Show power table"}
            </Button>
          </div>
          {showPowerTable ? (
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Project</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Client</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={`power-${project.id}`} className="border-t border-slate-100">
                      <td className="px-3 py-2">{project.name}</td>
                      <td className="px-3 py-2">{project.client_name}</td>
                      <td className="px-3 py-2">{project.status}</td>
                      <td className="px-3 py-2">
                        {project.met_indicators}/{project.total_indicators}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
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
            onDelete={() => {
              setProjectToManage(null);
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
