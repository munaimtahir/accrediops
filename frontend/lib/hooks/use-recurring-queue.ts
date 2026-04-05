"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import { RecurringInstance, RecurringQueueFilters } from "@/types";

export function useRecurringQueue(filters: RecurringQueueFilters) {
  return useQuery({
    queryKey: queryKeys.recurringQueue(filters),
    queryFn: () => apiClient.get<RecurringInstance[]>("/api/recurring/queue/", filters),
  });
}
