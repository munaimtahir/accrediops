"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  FileStack,
  FileText,
  FolderKanban,
  Gauge,
  ListTodo,
  ShieldCheck,
  Settings,
  Eye,
} from "lucide-react";

import { canAccessAdminArea, canViewExports } from "@/lib/authz";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { cn } from "@/utils/cn";
import { UserRole } from "@/types";

type NavItem = {
  href: string;
  label: string;
  icon: typeof FolderKanban;
  disabledReason?: string;
  allowedRoles?: UserRole[];
};

const coreItems: NavItem[] = [
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

const settingsItem: NavItem = { href: "/admin", label: "Settings", icon: Settings };

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  
  // Robust projectId extraction from pathname to avoid useParams inconsistencies in layouts
  const pathSegments = pathname.split("/");
  const projectsIndex = pathSegments.indexOf("projects");
  const nextSegment = projectsIndex !== -1 ? pathSegments[projectsIndex + 1] : undefined;
  const projectId = nextSegment && /^\d+$/.test(nextSegment) ? nextSegment : undefined;
  
  if (process.env.NODE_ENV === "development") {
    console.log("[Sidebar] pathname:", pathname, "params:", params, "projectId:", projectId);
  }
  
  const authQuery = useAuthSession();
  const user = authQuery.data?.user;
  const role = user?.role;
  const canAccessAdmin = canAccessAdminArea(user);
  const canManageExports = canViewExports(user);

  const projectItems: NavItem[] = projectId ? [
    { href: `/projects/${projectId}`, label: "Dashboard", icon: Gauge },
    { href: `/projects/${projectId}/worklist`, label: "Worklist", icon: ListTodo },
    {
      href: `/projects/${projectId}/inspection`,
      label: "Review / Inspection",
      icon: Eye,
      allowedRoles: ["ADMIN", "LEAD", "REVIEWER", "APPROVER"],
    },
    {
      href: `/projects/${projectId}/exports`,
      label: "Reports",
      icon: FileStack,
      disabledReason: canManageExports ? undefined : "No permission",
    },
  ] : [];

  const visibleProjectItems = projectItems.filter(item => {
    if (!item.allowedRoles) return true;
    return role && item.allowedRoles.includes(role);
  });

  return (
    <aside className="flex min-h-screen w-full max-w-[260px] flex-col border-r border-slate-200 bg-[linear-gradient(180deg,#0f172a_0%,#172554_100%)] px-4 py-6 text-slate-100">
      <div className="border-b border-white/10 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">Accreditation Platform</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">AccrediOps</h1>
        <p className="mt-2 text-sm text-slate-300">Simplified accreditation tracking.</p>
      </div>

      <nav aria-label="Primary navigation" className="mt-6 flex flex-1 flex-col justify-between">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Menu</p>
            {coreItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {(role === "ADMIN" || role === "LEAD") && (
              <Link
                href="/admin/frameworks/classification"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                  pathname === "/admin/frameworks/classification"
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                AI Classification
              </Link>
            )}
          </div>

          {visibleProjectItems.length ? (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Current project</p>
              {visibleProjectItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                if (item.disabledReason) {
                  return (
                    <div
                      key={item.href}
                      aria-disabled="true"
                      title={item.disabledReason}
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                      active
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          {canAccessAdmin && (
             <div className="space-y-1">
               <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Admin</p>
               <Link
                  key={settingsItem.href}
                  href={settingsItem.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                    pathname === settingsItem.href
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <settingsItem.icon className="h-4 w-4" />
                  {settingsItem.label}
                </Link>
                <Link
                  href="/admin/ai/usage"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                    pathname === "/admin/ai/usage"
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Gauge className="h-4 w-4" />
                  AI Usage
                </Link>
                <Link
                  href="/admin/queues/document-generation"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                    pathname === "/admin/queues/document-generation"
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Document Queue
                </Link>
             </div>
          )}

          {role ? (
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              Viewing as <span className="font-semibold text-white">{role}</span>
            </div>
          ) : null}
        </div>
      </nav>
    </aside>
  );
}
