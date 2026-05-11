"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import { PaginatedResult, Project } from "@/types";

export type ProjectIndicatorOption = {
  project_indicator_id: number;
  indicator_code: string;
  indicator_text: string;
};

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => apiClient.get<PaginatedResult<Project>>("/api/projects/", { page_size: "all" }),
  });
}

export function useAdminProjects() {
  return useQuery({
    queryKey: ["admin", "projects"],
    queryFn: async () => {
      const payload = await apiClient.get<PaginatedResult<Project>>("/api/projects/", { page_size: "all", is_active: true });
      return payload.results;
    },
  });
}

export function useProject(projectId: number) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => apiClient.get<Project>(`/api/projects/${projectId}/`),
    enabled: Number.isFinite(projectId),
  });
}

export function useProjectIndicatorsForProject(projectId: number) {
  return useQuery({
    queryKey: ["project-indicators", { projectId }],
    queryFn: async () => {
      const payload = await apiClient.get<PaginatedResult<ProjectIndicatorOption>>("/api/dashboard/worklist/", {
        project_id: projectId,
        page_size: "all",
      });
      return payload.results;
    },
    enabled: Number.isFinite(projectId),
  });
}
