"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => apiClient.get<Record<string, unknown>>("/api/admin/dashboard/"),
  });
}

export function useMasterValues(key: string) {
  return useQuery({
    queryKey: queryKeys.adminMasters(key),
    queryFn: () => apiClient.get<Record<string, unknown>[]>(`/api/admin/masters/${key}/`),
  });
}

export function useSaveMasterValue(key: string, id?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      id
        ? apiClient.patch<Record<string, unknown>>(`/api/admin/masters/${key}/${id}/`, payload)
        : apiClient.post<Record<string, unknown>>(`/api/admin/masters/${key}/`, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminMasters(key) });
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: () => apiClient.get<Record<string, unknown>[]>("/api/admin/users/"),
  });
}

export function useUpdateAdminUser(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.patch<Record<string, unknown>>(`/api/admin/users/${userId}/`, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
}

export function useAuditLogs(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.audit(filters),
    queryFn: () => apiClient.get<Record<string, unknown>[]>("/api/audit/", filters),
  });
}

export function useOverrides() {
  return useQuery({
    queryKey: queryKeys.overrides,
    queryFn: () => apiClient.get<Record<string, unknown>[]>("/api/admin/overrides/"),
  });
}

export function useImportLogs() {
  return useQuery({
    queryKey: queryKeys.importLogs,
    queryFn: () => apiClient.get<Record<string, unknown>[]>("/api/admin/import/logs/"),
  });
}

export function useFrameworkImportValidation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post<Record<string, unknown>>("/api/admin/import/validate-framework/", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.importLogs });
    },
  });
}
