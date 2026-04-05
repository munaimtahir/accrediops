"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import {
  AIOutput,
  ApproveRecurringPayload,
  AssignIndicatorPayload,
  CloneProjectPayload,
  CreateProjectPayload,
  Project,
  EvidenceItem,
  EvidencePayload,
  EvidenceReviewPayload,
  ExportResponse,
  GenerateAIPayload,
  ProjectIndicator,
  RecurringInstance,
  ReopenPayload,
  InitializeProjectPayload,
  InitializeProjectResponse,
  UpdateProjectPayload,
  SubmitRecurringPayload,
  WorkingStatePayload,
  WorkflowReasonPayload,
} from "@/types";

function useInvalidateIndicatorFamily() {
  const queryClient = useQueryClient();

  return (indicatorId: number, projectId?: number) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.indicator(indicatorId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.evidence(indicatorId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.aiOutputs(indicatorId) }),
      queryClient.invalidateQueries({ queryKey: ["worklist"] }),
      projectId ? queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) : Promise.resolve(),
      projectId ? queryClient.invalidateQueries({ queryKey: queryKeys.standardsProgress(projectId) }) : Promise.resolve(),
      projectId ? queryClient.invalidateQueries({ queryKey: queryKeys.areasProgress(projectId) }) : Promise.resolve(),
      queryClient.invalidateQueries({ queryKey: ["recurring-queue"] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
    ]);
}

export function useAssignIndicator(indicatorId: number, projectId?: number) {
  const invalidate = useInvalidateIndicatorFamily();

  return useMutation({
    mutationFn: (payload: AssignIndicatorPayload) =>
      apiClient.post<ProjectIndicator>(`/api/project-indicators/${indicatorId}/assign/`, payload),
    onSuccess: async () => invalidate(indicatorId, projectId),
  });
}

export function useUpdateWorkingState(indicatorId: number, projectId?: number) {
  const invalidate = useInvalidateIndicatorFamily();

  return useMutation({
    mutationFn: (payload: WorkingStatePayload) =>
      apiClient.post<ProjectIndicator>(`/api/project-indicators/${indicatorId}/update-working-state/`, payload),
    onSuccess: async () => invalidate(indicatorId, projectId),
  });
}

export function useAddEvidence(indicatorId: number, projectId?: number) {
  const invalidate = useInvalidateIndicatorFamily();

  return useMutation({
    mutationFn: (payload: EvidencePayload) => apiClient.post<EvidenceItem>("/api/evidence/", payload),
    onSuccess: async () => invalidate(indicatorId, projectId),
  });
}

export function useEditEvidence(indicatorId: number, evidenceId: number, projectId?: number) {
  const invalidate = useInvalidateIndicatorFamily();

  return useMutation({
    mutationFn: ({
      evidenceId,
      payload,
    }: {
      evidenceId: number;
      payload: Partial<EvidencePayload>;
    }) => apiClient.post<EvidenceItem>(`/api/evidence/${evidenceId}/update/`, payload),
    onSuccess: async () => invalidate(indicatorId, projectId),
  });
}

export function useReviewEvidence(indicatorId: number, evidenceId: number, projectId?: number) {
  const invalidate = useInvalidateIndicatorFamily();

  return useMutation({
    mutationFn: ({
      evidenceId,
      payload,
    }: {
      evidenceId: number;
      payload: EvidenceReviewPayload;
    }) => apiClient.post<EvidenceItem>(`/api/evidence/${evidenceId}/review/`, payload),
    onSuccess: async () => invalidate(indicatorId, projectId),
  });
}

function useWorkflowMutation(
  indicatorId: number,
  path: string,
  projectId?: number,
) {
  const invalidate = useInvalidateIndicatorFamily();

  return useMutation({
    mutationFn: (payload: WorkflowReasonPayload | ReopenPayload) =>
      apiClient.post<ProjectIndicator>(`/api/project-indicators/${indicatorId}/${path}/`, payload),
    onSuccess: async () => invalidate(indicatorId, projectId),
  });
}

export function useStartIndicator(indicatorId: number, projectId?: number) {
  return useWorkflowMutation(indicatorId, "start", projectId);
}

export function useSendForReview(indicatorId: number, projectId?: number) {
  return useWorkflowMutation(indicatorId, "send-for-review", projectId);
}

export function useMarkMet(indicatorId: number, projectId?: number) {
  return useWorkflowMutation(indicatorId, "mark-met", projectId);
}

export function useReopen(indicatorId: number, projectId?: number) {
  return useWorkflowMutation(indicatorId, "reopen", projectId);
}

export function useSubmitRecurring(indicatorId: number | undefined, recurringInstanceId: number, projectId?: number) {
  const invalidate = useInvalidateIndicatorFamily();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitRecurringPayload) =>
      apiClient.post<RecurringInstance>(`/api/recurring/instances/${recurringInstanceId}/submit/`, payload),
    onSuccess: async () => {
      if (indicatorId) {
        await invalidate(indicatorId, projectId);
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["recurring-queue"] }),
        queryClient.invalidateQueries({ queryKey: ["worklist"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
        projectId ? queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) : Promise.resolve(),
      ]);
    },
  });
}

export function useApproveRecurring(indicatorId: number | undefined, recurringInstanceId: number, projectId?: number) {
  const invalidate = useInvalidateIndicatorFamily();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApproveRecurringPayload) =>
      apiClient.post<RecurringInstance>(`/api/recurring/instances/${recurringInstanceId}/approve/`, payload),
    onSuccess: async () => {
      if (indicatorId) {
        await invalidate(indicatorId, projectId);
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["recurring-queue"] }),
        queryClient.invalidateQueries({ queryKey: ["worklist"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
        projectId ? queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) : Promise.resolve(),
      ]);
    },
  });
}

export function useGenerateAI(indicatorId: number, projectId?: number) {
  const invalidate = useInvalidateIndicatorFamily();

  return useMutation({
    mutationFn: (payload: GenerateAIPayload) => apiClient.post<AIOutput>("/api/ai/generate/", payload),
    onSuccess: async () => invalidate(indicatorId, projectId),
  });
}

export function useAcceptAI(indicatorId: number, outputId: number, projectId?: number) {
  const invalidate = useInvalidateIndicatorFamily();

  return useMutation({
    mutationFn: () => apiClient.post<AIOutput>(`/api/ai/outputs/${outputId}/accept/`, {}),
    onSuccess: async () => invalidate(indicatorId, projectId),
  });
}

export function useProjectExport(projectId: number, format: "excel" | "print-bundle") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.get<ExportResponse>(
        format === "excel"
          ? `/api/exports/projects/${projectId}/excel/`
          : `/api/exports/projects/${projectId}/print-bundle/`,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    },
  });
}

export function useCloneProject(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CloneProjectPayload) =>
      apiClient.post<Project>(`/api/projects/${projectId}/clone/`, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => apiClient.post<Project>("/api/projects/", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useUpdateProject(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) =>
      apiClient.patch<Project>(`/api/projects/${projectId}/`, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
      ]);
    },
  });
}

export function useInitializeProjectFromFramework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number;
      payload: InitializeProjectPayload;
    }) =>
      apiClient.post<InitializeProjectResponse>(
        `/api/projects/${projectId}/initialize-from-framework/`,
        payload,
      ),
    onSuccess: async (_, variables) => {
      const projectId = variables.projectId;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
        queryClient.invalidateQueries({ queryKey: queryKeys.standardsProgress(projectId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.areasProgress(projectId) }),
        queryClient.invalidateQueries({ queryKey: ["worklist"] }),
        queryClient.invalidateQueries({ queryKey: ["recurring-queue"] }),
      ]);
    },
  });
}
