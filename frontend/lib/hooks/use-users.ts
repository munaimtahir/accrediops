"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { UserFilters, UserSummary } from "@/types";

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => apiClient.get<UserSummary[]>("/api/users/", filters),
  });
}
