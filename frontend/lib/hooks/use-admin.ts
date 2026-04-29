"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { buildFrameworkImportFormData } from "@/lib/framework-import";
import { queryKeys } from "@/lib/hooks/query-keys";
import { FrameworkImportCreatePayload, FrameworkImportCreateResult, FrameworkImportValidatePayload, FrameworkImportValidateResult, FrameworkSummary } from "@/types";

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => apiClient.get<Record<string, unknown>>("/api/admin/dashboard/"),
  });
}

export function useOverrides() {
  return useQuery({
    queryKey: queryKeys.overrides,
    queryFn: () => apiClient.get<Record<string, unknown>[]>("/api/admin/overrides/"),
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

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post<Record<string, unknown>>("/api/admin/users/", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
}

export function useResetAdminUserPassword(userId: number) {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post<Record<string, unknown>>(`/api/admin/users/${userId}/password/`, payload),
  });
}

export function useAIUsage(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["admin", "ai-usage", filters],
    queryFn: () => apiClient.get<Record<string, unknown>[]>("/api/admin/ai/usage/", filters),
  });
}

export function useAIHealth() {
  return useQuery({
    queryKey: ["admin", "ai-health"],
    queryFn: () => apiClient.get<Record<string, unknown>>("/api/admin/ai/health/"),
  });
}

export function useTestAIConnection() {
  return useMutation({
    mutationFn: () => apiClient.post<Record<string, unknown>>("/api/admin/ai/test-connection/"),
  });
}

export function useAuditLogs(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.audit(filters),
    queryFn: () => apiClient.get<Record<string, unknown>[]>("/api/audit/", filters),
  });
}

export function useDocumentGenerationQueue(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["admin", "queue", "document-generation", filters],
    queryFn: () => apiClient.get<{ results: Record<string, unknown>[] }>("/api/admin/queues/document-generation/", filters),
  });
}

export function useGenerateDocumentDraft(indicatorId: number) {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post<Record<string, unknown>>(`/api/admin/queues/document-generation/${indicatorId}/generate-draft/`, payload),
  });
}

export function useListDocumentDrafts(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["admin", "document-drafts", filters],
    queryFn: () => apiClient.get<Record<string, unknown>[]>("/api/admin/document-drafts/", filters),
  });
}

export function useRetrieveDocumentDraft(draftId: number) {
  return useQuery({
    queryKey: ["admin", "document-drafts", draftId],
    queryFn: () => apiClient.get<Record<string, unknown>>(`/api/admin/document-drafts/${draftId}/`),
    enabled: Number.isFinite(draftId),
  });
}

export function useUpdateDocumentDraft(draftId: number) {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.patch<Record<string, unknown>>(`/api/admin/document-drafts/${draftId}/`, payload),
  });
}

export function usePromoteDocumentDraftToEvidence(draftId: number) {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post<Record<string, unknown>>(`/api/admin/document-drafts/${draftId}/promote-to-evidence/`, payload),
  });
}

export function useAdminFrameworks() {
  return useQuery({
    queryKey: ["admin", "frameworks"],
    queryFn: () => apiClient.get<FrameworkSummary[]>("/api/admin/frameworks/"),
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
    mutationFn: (payload: FrameworkImportValidatePayload) =>
      apiClient.postForm<FrameworkImportValidateResult>(
        "/api/admin/import/validate-framework/",
        buildFrameworkImportFormData(payload),
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.importLogs });
    },
  });
}

export function useFrameworkImportCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FrameworkImportCreatePayload) =>
      apiClient.postForm<FrameworkImportCreateResult>(
        "/api/admin/frameworks/import/",
        buildFrameworkImportFormData(payload),
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "frameworks"] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.importLogs });
    },
  });
}
