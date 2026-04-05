"use client";

import { useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFrameworkImportValidation, useImportLogs } from "@/lib/hooks/use-admin";

export function AdminImportLogsScreen() {
  const logs = useImportLogs();
  const validate = useFrameworkImportValidation();
  const [fileName, setFileName] = useState("framework-import.json");

  if (logs.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (logs.error) return <ErrorPanel message={logs.error.message} />;
  const rows = logs.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Framework import logs" />
      <div className="flex gap-2">
        <Input value={fileName} onChange={(event) => setFileName(event.target.value)} />
        <Button
          onClick={() =>
            validate.mutate({
              file_name: fileName,
              rows: [],
            })
          }
          loading={validate.isPending}
        >
          Validate sample
        </Button>
      </div>
      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "file", header: "File", render: (row) => String(row.file_name ?? "") },
          { key: "rows", header: "Rows", render: (row) => String(row.rows_processed ?? 0) },
          { key: "errors", header: "Errors", render: (row) => String(((row.errors as unknown[]) ?? []).length) },
          { key: "created", header: "Created", render: (row) => String(row.created_at ?? "") },
        ]}
        rows={rows}
        rowKey={(row) => String(row.id)}
      />
    </div>
  );
}
