"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";

import { useIndicator } from "@/lib/hooks/use-indicator";
import { useProject, useProjects } from "@/lib/hooks/use-projects";
import { useAuthSession, useLogout } from "@/lib/hooks/use-auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { formatDate, formatUserName } from "@/utils/format";
import { useToast } from "@/components/common/toaster";
import { GlobalStatusLegend } from "@/components/common/global-status-legend";

function getPageLabel(pathname: string) {
  if (pathname.endsWith("/worklist")) return "Worklist";
  if (pathname.endsWith("/recurring")) return "Recurring Queue";
  if (pathname.endsWith("/standards-progress")) return "Standards Progress";
  if (pathname.endsWith("/areas-progress")) return "Areas Progress";
  if (pathname.endsWith("/exports")) return "Export History";
  if (pathname.endsWith("/print-pack")) return "Print Pack";
  if (pathname.endsWith("/pending-actions")) return "Pending Actions";
  if (pathname.endsWith("/readiness")) return "Readiness";
  if (pathname.endsWith("/inspection")) return "Inspection Mode";
  if (pathname.endsWith("/client-profile")) return "Client Profile";
  if (pathname.startsWith("/admin")) return "Admin";
  if (pathname.startsWith("/project-indicators/")) return "Indicator Detail";
  if (pathname === "/projects") return "Project Register";
  if (pathname.startsWith("/projects/")) return "Project Overview";
  return "Workbench";
}

export function Topbar() {
  const router = useRouter();
  const { pushToast } = useToast();
  const pathname = usePathname();
  const params = useParams<{ projectId?: string; id?: string }>();
  const projectId = params.projectId ? Number(params.projectId) : NaN;
  const indicatorId = params.id ? Number(params.id) : NaN;

  const projectQuery = useProject(projectId);
  const indicatorQuery = useIndicator(indicatorId);
  const projectsQuery = useProjects();
  const sessionQuery = useAuthSession();
  const logout = useLogout();

  const resolvedProject =
    projectQuery.data ??
    (indicatorQuery.data && !Number.isNaN(indicatorQuery.data.project)
      ? projectsQuery.data?.results.find((project) => project.id === indicatorQuery.data?.project)
      : undefined);

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      pushToast("Signed out.", "success");
      router.replace("/login");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Sign-out failed.", "error");
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {getPageLabel(pathname)}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {resolvedProject?.name ?? "Accreditation Operations"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {resolvedProject
              ? `${resolvedProject.client_name} • ${resolvedProject.accrediting_body_name} • Target ${formatDate(
                  resolvedProject.target_date,
                )}`
              : "Governed internal workflow. All actions route through the API service layer."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {resolvedProject ? (
            <>
              <Link
                href={`/projects/${resolvedProject.id}`}
                className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
              >
                Project Home
              </Link>
              <Link
                href={`/projects/${resolvedProject.id}/worklist`}
                className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
              >
                Open Worklist
              </Link>
              <Link
                href={`/projects/${resolvedProject.id}/pending-actions`}
                className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
              >
                Pending actions
              </Link>
            </>
          ) : null}
          {sessionQuery.data?.user ? (
            <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {formatUserName(sessionQuery.data.user)} • {sessionQuery.data.user.role}
            </span>
          ) : null}
          <Button variant="secondary" onClick={handleLogout} loading={logout.isPending}>
            Sign out
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <GlobalStatusLegend compact />
      </div>
    </header>
  );
}
