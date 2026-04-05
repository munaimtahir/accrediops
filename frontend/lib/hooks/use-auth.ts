"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { AuthSession } from "@/types";

const authQueryKey = ["auth", "session"] as const;

export function useAuthSession() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: () => apiClient.get<AuthSession>("/api/auth/session/"),
    staleTime: 60_000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { username: string; password: string }) =>
      apiClient.post<AuthSession>("/api/auth/login/", payload),
    onSuccess: async (data) => {
      queryClient.setQueryData(authQueryKey, data);
      await queryClient.invalidateQueries({ queryKey: authQueryKey });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post<AuthSession>("/api/auth/logout/", {}),
    onSuccess: async (data) => {
      queryClient.setQueryData(authQueryKey, data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: authQueryKey }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["worklist"] }),
        queryClient.invalidateQueries({ queryKey: ["recurring-queue"] }),
      ]);
    },
  });
}
