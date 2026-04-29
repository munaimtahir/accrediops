"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { buildFrameworkImportFormData } from "@/lib/framework-import";
import { queryKeys } from "@/lib/hooks/query-keys";
import {
  FrameworkExportPayload,
  FrameworkImportCreatePayload,
  FrameworkImportCreateResult,
  FrameworkImportValidatePayload,
  FrameworkImportValidateResult,
  FrameworkSummary,
  FrameworkTemplatePayload,
} from "@/types";

export function useAdminFrameworks() {
  return useQuery({
    queryKey: queryKeys.adminFrameworks,
    queryFn: () => apiClient.get<FrameworkSummary[]>("/api/admin/frameworks/"),
  });
}

export function useCreateFramework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      apiClient.post<FrameworkSummary>("/api/admin/frameworks/", payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.frameworks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminFrameworks }),
      ]);
    },
  });
}

export function useFrameworkTemplate() {
  return useQuery({
    queryKey: queryKeys.frameworkTemplate,
    queryFn: () => apiClient.get<FrameworkTemplatePayload>("/api/frameworks/template/"),
  });
}

export function useFrameworkExport(frameworkId: number) {
  return useQuery({
    queryKey: queryKeys.frameworkExport(frameworkId),
    queryFn: () => apiClient.get<FrameworkExportPayload>(`/api/frameworks/${frameworkId}/export/`),
    enabled: Number.isFinite(frameworkId),
  });
}

export function useFrameworkImportValidate() {
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.frameworks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminFrameworks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.importLogs }),
      ]);
    },
  });
}
