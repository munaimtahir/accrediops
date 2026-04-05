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

export function useProject(projectId: number) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => apiClient.get<Project>(`/api/projects/${projectId}/`),
    enabled: Number.isFinite(projectId),
  });
}
