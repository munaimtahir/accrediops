"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import type { Capa, CapaSummary, Gap } from "@/types";

export type ProjectCapaFilters = {
  status?: string | string[];
  responsible_person?: string | "me";
  overdue?: boolean;
  high_risk?: boolean;
  export_blocker?: boolean;
  search?: string;
  ordering?: string;
};

export type ProjectGapFilters = {
  status?: string | string[];
  severity?: string | string[];
  source?: string | string[];
  search?: string;
  ordering?: string;
};

function normalizeFilters(filters: ProjectCapaFilters | ProjectGapFilters) {
  const normalized: Record<string, string> = {};

  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "boolean") {
      normalized[k] = v ? "true" : "false";
      continue;
    }
    if (Array.isArray(v)) {
      normalized[k] = v.join(",");
      continue;
    }
    normalized[k] = String(v);
  }

  return normalized;
}

export function useProjectCapas(projectId: number, filters: ProjectCapaFilters = {}) {
  const f = normalizeFilters(filters);
  return useQuery({
    queryKey: queryKeys.projectCapas(projectId, f),
    queryFn: () => apiClient.get<Capa[]>(`/api/projects/${projectId}/capas/`, f),
    enabled: Number.isFinite(projectId),
  });
}

export function useProjectGaps(projectId: number, filters: ProjectGapFilters = {}) {
  const f = normalizeFilters(filters);
  return useQuery({
    queryKey: ["projects", projectId, "gaps", f],
    queryFn: () => apiClient.get<Gap[]>(`/api/projects/${projectId}/gaps/`, f),
    enabled: Number.isFinite(projectId),
  });
}

export function useProjectCapaSummary(projectId: number) {
  return useQuery({
    queryKey: queryKeys.projectCapaSummary(projectId),
    queryFn: () => apiClient.get<CapaSummary>(`/api/projects/${projectId}/capa-summary/`),
    enabled: Number.isFinite(projectId),
  });
}
