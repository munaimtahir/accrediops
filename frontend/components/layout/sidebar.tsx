"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  FileStack,
  FolderKanban,
  Gauge,
  ListTodo,
  RefreshCcw,
  ShieldCheck,
  UserSquare2,
  Shield,
  Users,
  History,
  RotateCcw,
  HeartPulse,
} from "lucide-react";

import { useAuthSession } from "@/lib/hooks/use-auth";
import { cn } from "@/utils/cn";

const coreItems = [
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

const adminItems = [
  { href: "/admin", label: "Admin Dashboard", icon: Shield },
  { href: "/admin/users", label: "Admin Users", icon: Users },
  { href: "/admin/audit", label: "Admin Audit", icon: History },
  { href: "/admin/overrides", label: "Admin Overrides", icon: RotateCcw },
  { href: "/admin/masters/statuses", label: "Master Statuses", icon: ShieldCheck },
  { href: "/admin/masters/priorities", label: "Master Priorities", icon: ShieldCheck },
  { href: "/admin/masters/evidence-types", label: "Master Evidence Types", icon: ShieldCheck },
  { href: "/admin/masters/document-types", label: "Master Document Types", icon: ShieldCheck },
  { href: "/admin/system-health", label: "System Health", icon: HeartPulse },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const projectId = params.projectId;
  const authQuery = useAuthSession();
  const role = authQuery.data?.user?.role;
  const canAccessAdmin = role === "ADMIN" || role === "LEAD";
  const canManageExports = canAccessAdmin;

  const projectItems = projectId ? [{ href: `/projects/${projectId}`, label: "Project Home", icon: Gauge }] : [];

  if (projectId) {
    projectItems.push(
      { href: `/projects/${projectId}/worklist`, label: "Worklist", icon: ListTodo },
      { href: `/projects/${projectId}/recurring`, label: "Recurring Queue", icon: RefreshCcw },
      { href: `/projects/${projectId}/standards-progress`, label: "Standards Progress", icon: ShieldCheck },
      { href: `/projects/${projectId}/areas-progress`, label: "Areas Progress", icon: ShieldCheck },
      { href: `/projects/${projectId}/print-pack`, label: "Print Pack", icon: FileStack },
      { href: `/projects/${projectId}/readiness`, label: "Readiness", icon: ShieldCheck },
      { href: `/projects/${projectId}/inspection`, label: "Inspection Mode", icon: FileStack },
      { href: `/projects/${projectId}/client-profile`, label: "Client Profile", icon: UserSquare2 },
    );
    if (canManageExports) {
      projectItems.push({ href: `/projects/${projectId}/exports`, label: "Export History", icon: FileStack });
    }
  }

  const navItems = [...coreItems, ...(canAccessAdmin ? adminItems : []), ...projectItems];

  return (
    <aside className="flex min-h-screen w-full max-w-[260px] flex-col border-r border-slate-200 bg-[linear-gradient(180deg,#0f172a_0%,#172554_100%)] px-4 py-6 text-slate-100">
      <div className="border-b border-white/10 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">Internal Workbench</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">AccrediOps</h1>
        <p className="mt-2 text-sm text-slate-300">Accreditation operations control surface.</p>
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
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
      </nav>
    </aside>
  );
}
