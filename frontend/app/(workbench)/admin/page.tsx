"use client";

import { PageHeader } from "@/components/common/page-header";
import {
    Users,
    UserSquare2,
    BookOpenCheck,
    FileStack,
    ShieldCheck,
    History,
    RotateCcw,
    HeartPulse,
    ListChecks
} from "lucide-react";
import Link from "next/link";

const adminSections = [
    {
        title: "People",
        links: [
            { href: "/admin/users", label: "Users", icon: Users },
            { href: "/admin/client-profiles", label: "Client Profiles", icon: UserSquare2 },
        ],
    },
    {
        title: "Framework Setup",
        links: [
            { href: "/admin/frameworks", label: "Frameworks", icon: BookOpenCheck },
            { href: "/admin/frameworks/classification", label: "Indicator Classification", icon: ListChecks },
            { href: "/admin/import-logs", label: "Import History", icon: FileStack },
        ],
    },
    {
        title: "Master Lists",
        links: [
            { href: "/admin/masters/statuses", label: "Statuses", icon: ShieldCheck },
            { href: "/admin/masters/priorities", label: "Priorities", icon: ShieldCheck },
            { href: "/admin/masters/evidence-types", label: "Evidence Types", icon: ShieldCheck },
            { href: "/admin/masters/document-types", label: "Document Types", icon: ShieldCheck },
        ],
    },
    {
        title: "Governance",
        links: [
            { href: "/admin/audit", label: "Audit Log", icon: History },
            { href: "admin/overrides", label: "Advanced Controls", icon: RotateCcw },
        ],
    },
    {
        title: "System",
        links: [
            { href: "/admin/system-health", label: "System Status", icon: HeartPulse },
        ],
    },
];

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Settings"
                title="Admin Settings"
                description="Manage users, frameworks, and system settings."
            />
            <div className="space-y-8">
                {adminSections.map((section) => (
                    <section key={section.title}>
                        <h2 className="text-lg font-semibold text-slate-950 mb-3">{section.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.links.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="block p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5 text-slate-500" />
                                            <h3 className="font-semibold text-slate-800">{link.label}</h3>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
