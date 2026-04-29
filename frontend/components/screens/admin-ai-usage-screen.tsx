"use client";

import { useState } from "react";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SettingsPageHeader } from "@/components/common/settings-page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useAIHealth, useAIUsage, useTestAIConnection } from "@/lib/hooks/use-admin";
import { useUsers } from "@/lib/hooks/use-users";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { getSafeErrorMessage } from "@/lib/api/client";

export function AdminAIUsageScreen() {
  const { pushToast } = useToast();
  const authQuery = useAuthSession();
  const [user, setUser] = useState("");
  const [feature, setFeature] = useState("");
  const [isSuccess, setIsSuccess] = useState("");

  const filters = {
    user: user || undefined,
    feature: feature || undefined,
    is_success: isSuccess || undefined,
  };

  const query = useAIUsage(filters);
  const healthQuery = useAIHealth();
  const testConnection = useTestAIConnection();
  const users = useUsers();

  if (query.isLoading || users.isLoading || authQuery.isLoading || healthQuery.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (query.error) return <ErrorPanel message={query.error.message} />;

  const rows = query.data ?? [];
  const userOptions = users.data ?? [];
  const health = healthQuery.data;
  const isAdmin = authQuery.data?.user?.role === "ADMIN";
  
  const successCount = rows.filter(r => r.is_success).length;
  const failureCount = rows.length - successCount;

  async function handleTestConnection() {
    try {
      const result = await testConnection.mutateAsync();
      pushToast(String(result.message), "success");
      healthQuery.refetch();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="AI System Control"
        description="Monitor AI activity, audit usage, and verify provider connectivity."
        actions={
          isAdmin && (
            <Button onClick={handleTestConnection} loading={testConnection.isPending} variant="secondary">
              Test AI Connection
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
             <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Provider Health</h3>
             {health?.is_configured ? (
               <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
             ) : (
               <span className="flex h-2 w-2 rounded-full bg-rose-500" />
             )}
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Provider</span>
              <span className="font-medium text-slate-900">{String(health?.provider ?? "Not Configured")}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Model</span>
              <span className="font-medium text-slate-900">{String(health?.model ?? "-")}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Mode</span>
              <span className="font-medium text-slate-900">{health?.demo_mode ? "[DEMO] Simulation" : "Production"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">API Key</span>
              <span className="font-medium text-slate-900">{health?.api_key_present ? "PRESENT" : "MISSING"}</span>
            </div>
          </div>
          {!health?.is_configured && !health?.demo_mode && (
             <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
               AI service is not configured. Check environment variables.
             </div>
          )}
        </Card>

        <div className="grid gap-3 grid-cols-2 lg:col-span-2">
          <Card className="p-4 flex flex-col justify-center">
            <div className="text-xs font-semibold uppercase text-slate-500">Total Requests</div>
            <div className="mt-1 text-2xl font-semibold text-slate-950">{rows.length}</div>
          </Card>
          <Card className="p-4 flex flex-col justify-center">
            <div className="text-xs font-semibold uppercase text-emerald-600">Successful</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-700">{successCount}</div>
          </Card>
          <Card className="p-4 flex flex-col justify-center">
            <div className="text-xs font-semibold uppercase text-rose-600">Failed</div>
            <div className="mt-1 text-2xl font-semibold text-rose-700">{failureCount}</div>
          </Card>
          <Card className="p-4 flex flex-col justify-center">
            <div className="text-xs font-semibold uppercase text-slate-500">Avg Duration</div>
            <div className="mt-1 text-2xl font-semibold text-slate-950">
              {rows.length ? Math.round(rows.reduce((acc, r) => acc + (Number(r.request_duration_ms) || 0), 0) / rows.length) : 0}ms
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Select value={user} onChange={(e) => setUser(e.target.value)}>
          <option value="">All users</option>
          {userOptions.map((u) => (
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </Select>
        <Select value={feature} onChange={(e) => setFeature(e.target.value)}>
          <option value="">All features</option>
          <option value="AI Classification">AI Classification</option>
          <option value="AI Guidance">AI Guidance</option>
          <option value="AI Draft">AI Draft</option>
        </Select>
        <Select value={isSuccess} onChange={(e) => setIsSuccess(e.target.value)}>
          <option value="">All statuses</option>
          <option value="true">Success</option>
          <option value="false">Failure</option>
        </Select>
      </div>

      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "timestamp", header: "Timestamp", render: (row) => String(row.timestamp ?? "").replace("T", " ").slice(0, 19) },
          { key: "user", header: "User", render: (row) => String(row.user_username ?? "System") },
          { key: "feature", header: "Feature", render: (row) => String(row.feature ?? "") },
          { key: "context", header: "Context", render: (row) => (
            <div className="text-xs">
              {Boolean(row.framework_name) && <div>FW: {String(row.framework_name)}</div>}
              {Boolean(row.project_name) && <div>PRJ: {String(row.project_name)}</div>}
              {Boolean(row.indicator_code) && <div>IND: {String(row.indicator_code)}</div>}
            </div>
          )},
          { key: "result", header: "Result", render: (row) => (
            row.is_success ? (
              <span className="text-emerald-700 font-medium">Success ({String(row.request_duration_ms)}ms)</span>
            ) : (
              <div className="text-rose-700">
                <div className="font-medium">Failure</div>
                <div className="text-[10px] max-w-xs truncate" title={String(row.error_message)}>{String(row.error_message)}</div>
              </div>
            )
          )},
          { key: "model", header: "Model", render: (row) => (
            <div className="text-xs text-slate-500">
              {String(row.provider)} / {String(row.model)}
              {Boolean(row.is_demo_mode) && <div className="text-amber-600 font-semibold">[DEMO]</div>}
            </div>
          )},
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
      />
    </div>
  );
}
