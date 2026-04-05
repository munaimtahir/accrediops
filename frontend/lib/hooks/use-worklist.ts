"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import { DashboardRow, PaginatedResult, WorklistFilters } from "@/types";

export function useWorklist(filters: WorklistFilters) {
  return useQuery({
    queryKey: queryKeys.worklist(filters),
    queryFn: () => apiClient.get<PaginatedResult<DashboardRow>>("/api/dashboard/worklist/", filters),
  });
}
