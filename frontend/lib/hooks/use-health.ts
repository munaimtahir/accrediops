"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

export function useBackendHealth() {
  return useQuery({
    queryKey: ["health", "backend"],
    queryFn: () => apiClient.get<Record<string, unknown>>("/api/health/"),
    retry: false,
  });
}
