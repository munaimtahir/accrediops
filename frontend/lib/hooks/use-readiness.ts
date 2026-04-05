"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import { ExportResponse } from "@/types";

export function useProjectReadiness(projectId: number) {
  return useQuery({
    queryKey: queryKeys.projectReadiness(projectId),
    queryFn: () => apiClient.get<Record<string, unknown>>(`/api/projects/${projectId}/readiness/`),
    enabled: Number.isFinite(projectId),
  });
}

export function useInspectionView(projectId: number) {
  return useQuery({
    queryKey: queryKeys.inspection(projectId),
    queryFn: () => apiClient.get<Record<string, unknown>>(`/api/projects/${projectId}/inspection-view/`),
    enabled: Number.isFinite(projectId),
  });
}

export function usePreInspectionCheck(projectId: number) {
  return useQuery({
    queryKey: queryKeys.preInspection(projectId),
    queryFn: () => apiClient.get<Record<string, unknown>>(`/api/projects/${projectId}/pre-inspection-check/`),
    enabled: Number.isFinite(projectId),
  });
}

export function useExportHistory(projectId: number) {
  return useQuery({
    queryKey: queryKeys.exportHistory(projectId),
    queryFn: () => apiClient.get<Record<string, unknown>[]>(`/api/exports/projects/${projectId}/history/`),
    enabled: Number.isFinite(projectId),
  });
}

export function useGenerateExport(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post<Record<string, unknown>>(`/api/exports/projects/${projectId}/generate/`, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.exportHistory(projectId) });
    },
  });
}

export function usePhysicalRetrievalExport(projectId: number) {
  return useQuery({
    queryKey: ["projects", projectId, "exports", "physical-retrieval"],
    queryFn: () =>
      apiClient.get<ExportResponse>(
        `/api/exports/projects/${projectId}/physical-retrieval/`,
      ),
    enabled: Number.isFinite(projectId),
  });
}
