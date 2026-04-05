"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import { AIOutput, ProjectIndicatorDetail } from "@/types";

export function useIndicator(indicatorId: number) {
  return useQuery({
    queryKey: queryKeys.indicator(indicatorId),
    queryFn: () => apiClient.get<ProjectIndicatorDetail>(`/api/project-indicators/${indicatorId}/`),
    enabled: Number.isFinite(indicatorId),
  });
}

export function useAIOutputs(indicatorId: number) {
  return useQuery({
    queryKey: queryKeys.aiOutputs(indicatorId),
    queryFn: () => apiClient.get<AIOutput[]>(`/api/project-indicators/${indicatorId}/ai-outputs/`),
    enabled: Number.isFinite(indicatorId),
  });
}
