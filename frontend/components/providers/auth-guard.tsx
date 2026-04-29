"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useAuthSession } from "@/lib/hooks/use-auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sessionQuery = useAuthSession();
  const authCheckPending = sessionQuery.isLoading;

  useEffect(() => {
    if (authCheckPending) {
      return;
    }

    if (!sessionQuery.data?.authenticated) {
      const next = encodeURIComponent(pathname || "/projects");
      const loginUrl = `/login?next=${next}`;

      router.replace(loginUrl);

      // Fallback hard navigation prevents a blank protected screen if client routing stalls.
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          if (!window.location.pathname.startsWith("/login")) {
            window.location.assign(loginUrl);
          }
        }, 150);
      }
    }
  }, [authCheckPending, pathname, router, sessionQuery.data?.authenticated]);

  if (authCheckPending) {
    return (
      <div className="min-h-screen space-y-4 p-6">
        <LoadingSkeleton className="h-16 w-full" />
        <LoadingSkeleton className="h-[calc(100vh-140px)] w-full" />
      </div>
    );
  }

  if (!sessionQuery.data?.authenticated) {
    return (
      <div className="min-h-screen space-y-4 p-6">
        <LoadingSkeleton className="h-16 w-full" />
        <LoadingSkeleton className="h-[calc(100vh-140px)] w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
