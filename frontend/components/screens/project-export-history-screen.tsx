"use client";

import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { NextActionBanner } from "@/components/common/next-action-banner";
import { OnboardingCallout } from "@/components/common/onboarding-callout";
import { PermissionHint } from "@/components/common/permission-hint";
import { PageHeader } from "@/components/common/page-header";
import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
import { useToast } from "@/components/common/toaster";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { useExportHistory, useGenerateExport, usePhysicalRetrievalExport, useProjectReadiness } from "@/lib/hooks/use-readiness";
import { getSafeErrorMessage } from "@/lib/api/client";
import { canViewExports, getRestrictionMessage } from "@/lib/authz";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { cn } from "@/utils/cn";

export function ProjectExportHistoryScreen({ projectId }: { projectId: number }) {
  const { pushToast } = useToast();
  const authQuery = useAuthSession();
  const [type, setType] = useState<"print-bundle" | "excel">("print-bundle");
  const role = authQuery.data?.user?.role;
  const canManageExports = canViewExports(authQuery.data?.user);
  const effectiveProjectId = canManageExports ? projectId : Number.NaN;
  const history = useExportHistory(effectiveProjectId);
  const generate = useGenerateExport(projectId);
  const physical = usePhysicalRetrievalExport(effectiveProjectId);
  const readiness = useProjectReadiness(effectiveProjectId);

  if (authQuery.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (!canManageExports) {
    return (
      <EmptyState
        title="Export access restricted"
        description={getRestrictionMessage("exports")}
        action={
          <Link href={`/projects/${projectId}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            Back to project
          </Link>
        }
      />
    );
  }

  async function handleGenerate() {
    if (!canManageExports) {
      pushToast("You are not allowed to generate exports.", "error");
      return;
    }
    try {
      await generate.mutateAsync({ type, parameters: {} });
      pushToast(`Export job created for ${type}.`, "success");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function handlePhysicalRetrieval() {
    if (!canManageExports) {
      pushToast("You are not allowed to access physical retrieval export.", "error");
      return;
    }
    try {
      const result = await physical.refetch();
      if (result.error) {
        throw result.error;
      }
      pushToast("Physical retrieval export refreshed.", "success");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  if (history.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (history.error) return <ErrorPanel message={history.error.message} />;
  if (readiness.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (readiness.error) return <ErrorPanel message={readiness.error.message} />;
  const rows = history.data ?? [];
  const readinessData = (readiness.data ?? {}) as Record<string, unknown>;
  const exportBlockers = [
    !canManageExports ? `Role restriction: ${getRestrictionMessage("exports")}` : "",
    Number(readinessData.percent_met ?? 0) < 100
      ? `Project readiness is incomplete: ${Number(readinessData.percent_met ?? 0)}% of indicators are met.`
      : "",
    Number(readinessData.recurring_compliance_score ?? 0) < 100
      ? `Recurring compliance is ${Number(readinessData.recurring_compliance_score ?? 0)}%, not 100%.`
      : "",
    Array.isArray(readinessData.high_risk_indicators) && readinessData.high_risk_indicators.length > 0
      ? `Critical indicators pending: ${readinessData.high_risk_indicators.length}`
      : "",
  ].filter(Boolean);
  const exportReady = canManageExports && exportBlockers.length === 0;
  const exportAction = exportReady
    ? `Generate ${type} export and verify the resulting history row.`
    : "Resolve readiness blockers before generating governed exports.";
  const exportReason = exportReady
    ? "The project is ready for governed export generation."
    : "Backend export guards will reject generation until readiness, approvals, and recurring compliance are complete.";
  const exportStatus = `History rows: ${rows.length} • Readiness score: ${Number(readinessData.overall_score ?? 0)}`;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Exports"
        title="Export history"
        description={
          canManageExports
            ? "Generate and track print-bundle, excel, and physical retrieval outputs."
            : "You can view export history, but generation requires ADMIN or LEAD role."
        }
        actions={
          <Button
            onClick={handleGenerate}
            loading={generate.isPending}
            disabled={!exportReady}
            title={exportReady ? "Generate selected export type" : "Resolve export blockers before generation."}
          >
            Generate {type}
          </Button>
        }
      />
      <WorkflowContextStrip
        scope={`Project ${projectId} · Exports`}
        current="Viewing export jobs and generation controls."
        nextStep={
          canManageExports
            ? "Generate required export type, then verify history status and warnings."
            : "Review existing export history or request ADMIN/LEAD support for generation."
        }
        roleHint="Export generation and physical retrieval remain role-restricted to ADMIN/LEAD."
        actions={[
          { label: "Back to project", href: `/projects/${projectId}` },
          { label: "Print pack preview", href: `/projects/${projectId}/print-pack` },
          { label: "Open worklist", href: `/projects/${projectId}/worklist` },
        ]}
      />
      <NextActionBanner
        action={exportAction}
        reason={exportReason}
        status={exportStatus}
        blockers={exportBlockers}
      />
      <OnboardingCallout
        storageKey={`exports-${projectId}-${role ?? "unknown"}`}
        title="Export lifecycle"
        description="Generate one export type at a time, then use history rows to confirm status and retrieve output metadata."
      />
      <div className="flex gap-2">
        <Button
          variant={type === "print-bundle" ? "default" : "secondary"}
          onClick={() => setType("print-bundle")}
          disabled={!canManageExports}
        >
          Print Bundle
        </Button>
        <Button
          variant={type === "excel" ? "default" : "secondary"}
          onClick={() => setType("excel")}
          disabled={!canManageExports}
        >
          Excel
        </Button>
        <Button
          variant="secondary"
          onClick={handlePhysicalRetrieval}
          loading={physical.isFetching}
          disabled={!exportReady}
          title={exportReady ? "Generate physical retrieval export" : "Resolve export blockers before generation."}
        >
          Physical Retrieval
        </Button>
      </div>
      <PermissionHint allowed={canManageExports}>
        Export generation and physical retrieval are restricted to ADMIN or LEAD roles.
      </PermissionHint>
      {physical.data ? (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
          Physical retrieval rows: {physical.data.items?.length ?? 0}
        </div>
      ) : null}
      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "type", header: "Type", render: (row) => String(row.type ?? "") },
          { key: "status", header: "Status", render: (row) => String(row.status ?? "") },
          { key: "file_name", header: "File", render: (row) => String(row.file_name ?? "") },
          {
            key: "warnings",
            header: "Warnings",
            render: (row) => String(((row.warnings as unknown[]) ?? []).length),
          },
          { key: "created", header: "Created", render: (row) => String(row.created_at ?? "") },
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
      />
    </div>
  );
}
