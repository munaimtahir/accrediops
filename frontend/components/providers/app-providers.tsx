"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { ToastProvider } from "@/components/common/toaster";
import { AUTH_REQUIRED_EVENT } from "@/lib/api/client";
import { AUTH_QUERY_KEY } from "@/lib/hooks/use-auth";
import { AuthSession } from "@/types";

function AuthFailureBridge({ queryClient }: { queryClient: QueryClient }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleAuthRequired(event: Event) {
      const detail = (event as CustomEvent<{ nextPath?: string }>).detail;
      const fallbackPath = pathname || "/projects";
      const nextPath = detail?.nextPath?.startsWith("/") ? detail.nextPath : fallbackPath;

      queryClient.setQueryData<AuthSession>(AUTH_QUERY_KEY, {
        authenticated: false,
        user: null,
      });
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== AUTH_QUERY_KEY[0],
      });

      if (!pathname?.startsWith("/login")) {
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      }
    }

    window.addEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
    return () => {
      window.removeEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
    };
  }, [pathname, queryClient, router]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthFailureBridge queryClient={queryClient} />
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
