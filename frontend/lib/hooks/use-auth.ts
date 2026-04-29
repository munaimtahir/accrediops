"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { AuthSession } from "@/types";

export const AUTH_QUERY_KEY = ["auth", "session"] as const;

export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => apiClient.get<AuthSession>("/api/auth/session/"),
    staleTime: 60_000,
    retry: false,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: { username: string; password: string }) =>
      apiClient.post<AuthSession>("/api/auth/login/", payload),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post<AuthSession>("/api/auth/logout/", {}),
    onSuccess: async (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["worklist"] }),
        queryClient.invalidateQueries({ queryKey: ["recurring-queue"] }),
      ]);
    },
  });
}
