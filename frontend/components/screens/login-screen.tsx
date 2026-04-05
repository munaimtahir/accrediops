"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ErrorPanel } from "@/components/common/error-panel";
import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLogin, useAuthSession } from "@/lib/hooks/use-auth";
import { getSafeErrorMessage } from "@/lib/api/client";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const sessionQuery = useAuthSession();
  const login = useLogin();
  const nextPath = searchParams.get("next") || "/projects";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (sessionQuery.data?.authenticated) {
      router.replace(nextPath);
    }
  }, [nextPath, router, sessionQuery.data?.authenticated]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await login.mutateAsync({ username, password });
      pushToast("Signed in.", "success");
      router.replace(nextPath);
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#dbe7f3_0%,#f5f7fb_50%,#eef2f7_100%)] p-6">
      <Card className="w-full max-w-md p-6">
        <div className="border-b border-slate-200 pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Internal Access</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">AccrediOps sign-in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Session-authenticated access for the accreditation operations workbench.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Username</span>
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Password</span>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <Button type="submit" className="w-full" loading={login.isPending}>
            Sign in
          </Button>
        </form>

        {sessionQuery.error ? <div className="mt-4"><ErrorPanel message={sessionQuery.error.message} /></div> : null}
      </Card>
    </div>
  );
}
