"use client";

import Link from "next/link";
import { ReactNode } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { canAccessAdminArea, getRestrictionMessage } from "@/lib/authz";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { cn } from "@/utils/cn";

export function AdminAreaGuard({ children }: { children: ReactNode }) {
  const sessionQuery = useAuthSession();

  if (sessionQuery.isLoading) {
    return <LoadingSkeleton className="h-40 w-full" />;
  }

  if (!canAccessAdminArea(sessionQuery.data?.user)) {
    return (
      <EmptyState
        title="Admin access restricted"
        description={getRestrictionMessage("adminArea")}
        action={
          <Link href="/projects" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            Back to projects
          </Link>
        }
      />
    );
  }

  return <>{children}</>;
}
