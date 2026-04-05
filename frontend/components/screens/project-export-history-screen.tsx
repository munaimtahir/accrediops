"use client";

import { useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { useGenerateExport, useExportHistory, usePhysicalRetrievalExport } from "@/lib/hooks/use-readiness";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useAuthSession } from "@/lib/hooks/use-auth";

export function ProjectExportHistoryScreen({ projectId }: { projectId: number }) {
  const { pushToast } = useToast();
  const authQuery = useAuthSession();
  const [type, setType] = useState<"print-bundle" | "excel">("print-bundle");
  const history = useExportHistory(projectId);
  const generate = useGenerateExport(projectId);
  const physical = usePhysicalRetrievalExport(projectId);
  const role = authQuery.data?.user?.role;
  const canManageExports = role === "ADMIN" || role === "LEAD";

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
  const rows = history.data ?? [];
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Exports"
        title="Export history"
        actions={
          <Button
            onClick={handleGenerate}
            loading={generate.isPending}
            disabled={!canManageExports}
          >
            Generate {type}
          </Button>
        }
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
          disabled={!canManageExports}
        >
          Physical Retrieval
        </Button>
      </div>
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
