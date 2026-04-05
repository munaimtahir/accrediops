"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { ClientProfile, VariablesPreviewPayload, VariablesPreviewResponse } from "@/types";

const clientProfilesKey = ["client-profiles"] as const;

export function useClientProfiles() {
  return useQuery({
    queryKey: clientProfilesKey,
    queryFn: () => apiClient.get<ClientProfile[]>("/api/client-profiles/"),
  });
}

export function useClientProfile(profileId: number) {
  return useQuery({
    queryKey: ["client-profiles", profileId],
    queryFn: () => apiClient.get<ClientProfile>(`/api/client-profiles/${profileId}/`),
    enabled: Number.isFinite(profileId),
  });
}

export function useSaveClientProfile(profileId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ClientProfile>) =>
      profileId
        ? apiClient.patch<ClientProfile>(`/api/client-profiles/${profileId}/`, payload)
        : apiClient.post<ClientProfile>("/api/client-profiles/", payload),
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clientProfilesKey }),
        queryClient.invalidateQueries({ queryKey: ["client-profiles", data.id] }),
      ]);
    },
  });
}

export function useVariablesPreview(profileId: number) {
  return useMutation({
    mutationFn: (payload: VariablesPreviewPayload) =>
      apiClient.post<VariablesPreviewResponse>(`/api/client-profiles/${profileId}/variables-preview/`, payload),
  });
}
