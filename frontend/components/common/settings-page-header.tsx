import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { cn } from "@/utils/cn";

export function SettingsPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 -ml-3 text-slate-500 hover:text-slate-900")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
      </div>
      <PageHeader eyebrow="Admin" title={title} description={description} actions={actions} />
    </div>
  );
}
