"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import { PaginatedResult, Project } from "@/types";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => apiClient.get<PaginatedResult<Project>>("/api/projects/"),
  });
}

export function useAdminProjects() {
  return useQuery({
    queryKey: ["admin", "projects"],
    queryFn: () => apiClient.get<Project[]>("/api/projects/?is_active=true"),
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
    queryFn: () => apiClient.get<Record<string, unknown>[]>(`/api/projects/${projectId}/project-indicators/`),
    enabled: Number.isFinite(projectId),
  });
}
