"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import { FrameworkSummary } from "@/types";

export function useFrameworks() {
  return useQuery({
    queryKey: queryKeys.frameworks,
    queryFn: () => apiClient.get<FrameworkSummary[]>("/api/frameworks/"),
  });
}
