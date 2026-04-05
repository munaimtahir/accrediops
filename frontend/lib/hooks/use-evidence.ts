"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import { EvidenceItem } from "@/types";

export function useEvidence(indicatorId: number) {
  return useQuery({
    queryKey: queryKeys.evidence(indicatorId),
    queryFn: () => apiClient.get<EvidenceItem[]>(`/api/project-indicators/${indicatorId}/evidence/`),
    enabled: Number.isFinite(indicatorId),
  });
}
