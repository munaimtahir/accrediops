"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import {
  BulkClassificationReviewPayload,
  ClassificationRunResult,
  FrameworkClassificationPayload,
  IndicatorClassification,
} from "@/types";

export interface ClassificationFilters {
  evidence_type?: string;
  ai_assistance_level?: string;
  evidence_frequency?: string;
  primary_action_required?: string;
  classification_review_status?: string;
  classification_confidence?: string;
  area?: string;
  standard?: string;
  search?: string;
}

export function useFrameworkClassification(frameworkId: number, filters: ClassificationFilters) {
  return useQuery({
    queryKey: queryKeys.frameworkClassification(frameworkId, filters),
    queryFn: () =>
      apiClient.get<FrameworkClassificationPayload>(
        `/api/admin/frameworks/${frameworkId}/classification/`,
        filters,
      ),
    enabled: Number.isFinite(frameworkId),
  });
}

export function useRunAIClassification(frameworkId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      mode?: "unclassified_only" | "selected" | "unreviewed_only" | "force_all";
      indicator_ids?: number[];
      overwrite_human_reviewed?: boolean;
      confirm_force?: boolean;
    }) =>
      apiClient.post<ClassificationRunResult>(
        `/api/admin/frameworks/${frameworkId}/classify-indicators/`,
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "frameworks", frameworkId, "classification"] });
    },
  });
}

export function useUpdateIndicatorClassification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      indicatorId,
      payload,
    }: {
      indicatorId: number;
      payload: Partial<IndicatorClassification>;
    }) => apiClient.patch<IndicatorClassification>(`/api/admin/indicators/${indicatorId}/classification/`, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "frameworks"] });
    },
  });
}

export function useBulkReviewClassification(frameworkId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkClassificationReviewPayload) =>
      apiClient.post<{ updated_count: number; skipped_count: number; results: IndicatorClassification[] }>(
        `/api/admin/frameworks/${frameworkId}/classification/bulk-review/`,
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "frameworks", frameworkId, "classification"] });
    },
  });
}
