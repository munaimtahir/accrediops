"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";

export function useFrameworkAnalysis(frameworkId: number) {
  return useQuery({
    queryKey: queryKeys.frameworkAnalysis(frameworkId),
    queryFn: () => apiClient.get<Record<string, unknown>>(`/api/frameworks/${frameworkId}/analysis/`),
    enabled: Number.isFinite(frameworkId),
  });
}
