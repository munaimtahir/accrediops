"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import { AreaProgress, StandardProgress } from "@/types";

export function useProgress(projectId: number, kind: "standards" | "areas") {
  return useQuery({
    queryKey:
      kind === "standards"
        ? queryKeys.standardsProgress(projectId)
        : queryKeys.areasProgress(projectId),
    queryFn: () =>
      apiClient.get<StandardProgress[] | AreaProgress[]>(
        kind === "standards"
          ? `/api/projects/${projectId}/standards-progress/`
          : `/api/projects/${projectId}/areas-progress/`,
      ),
    enabled: Number.isFinite(projectId),
  });
}
