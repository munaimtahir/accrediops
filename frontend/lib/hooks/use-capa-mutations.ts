"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/hooks/query-keys";
import type { Capa } from "@/types";

export type UpdateCapaPayload = Partial<
  Pick<
    Capa,
    "title" | "root_cause" | "corrective_action" | "preventive_action" | "responsible_person" | "due_date"
  >
>;

export function useUpdateCapa(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ capaId, payload }: { capaId: number; payload: UpdateCapaPayload }) =>
      apiClient.patch<Capa>(`/api/capas/${capaId}/`, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects", projectId, "capas"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projectCapaSummary(projectId) }),
      ]);
    },
  });
}

