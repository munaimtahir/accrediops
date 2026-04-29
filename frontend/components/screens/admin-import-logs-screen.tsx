"use client";

import { ChangeEvent, FormEvent, useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SettingsPageHeader } from "@/components/common/settings-page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ApiClientError } from "@/lib/api/client";
import { canValidateFrameworkImport, getRestrictionMessage } from "@/lib/authz";
import { useAdminFrameworks, useFrameworkImportValidation, useImportLogs } from "@/lib/hooks/use-admin";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { FrameworkImportValidateResult, FrameworkSummary } from "@/types";

export function AdminImportLogsScreen() {
  const logs = useImportLogs();
  const authQuery = useAuthSession();
  const frameworksQuery = useAdminFrameworks();
  const validate = useFrameworkImportValidation();
  const [frameworkId, setFrameworkId] = useState<number>(Number.NaN);
  const [file, setFile] = useState<File | null>(null);

  if (logs.isLoading || frameworksQuery.isLoading || authQuery.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (logs.error) return <ErrorPanel message={logs.error.message} />;
  if (frameworksQuery.error) return <ErrorPanel message={frameworksQuery.error.message} />;

  const rows = logs.data ?? [];
  const frameworks = frameworksQuery.data ?? [];
  const canValidate = canValidateFrameworkImport(authQuery.data?.user);
  const validateResult: FrameworkImportValidateResult | null = validate.data ?? null;
  const validationRows = (validateResult?.errors ?? []) as Record<string, unknown>[];
  const disableReason = !canValidate
    ? getRestrictionMessage("frameworkImportValidation")
    : !Number.isFinite(frameworkId)
      ? "Select a framework before validation."
      : !file
        ? "Select a CSV file before validation."
        : null;

  const structuredError = (() => {
    if (!validate.error) {
      return null;
    }
    if (validate.error instanceof ApiClientError) {
      return {
        message: validate.error.message,
        code: validate.error.code,
        status: validate.error.status,
        details: validate.error.details,
      };
    }
    return {
      message: validate.error.message,
      code: "UNKNOWN",
      status: 0,
      details: null,
    };
  })();

  function handleFrameworkChange(event: ChangeEvent<HTMLSelectElement>) {
    setFrameworkId(Number(event.target.value));
    validate.reset();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    validate.reset();
  }

  async function handleValidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disableReason || !file || !Number.isFinite(frameworkId)) {
      return;
    }

    await validate.mutateAsync({
      framework_id: frameworkId,
      file,
    });
  }

  return (
    <div className="space-y-6">
      <SettingsPageHeader title="Framework import logs" />

      <form className="space-y-3" onSubmit={handleValidate}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Framework</span>
            <Select value={Number.isFinite(frameworkId) ? String(frameworkId) : ""} onChange={handleFrameworkChange}>
              <option value="">Select framework</option>
              {frameworks.map((framework: FrameworkSummary) => (
                <option key={framework.id} value={framework.id}>
                  {framework.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Checklist CSV file</span>
            <Input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
          </label>
        </div>
        <Button
          type="submit"
          disabled={Boolean(disableReason)}
          loading={validate.isPending}
          title={disableReason ?? "Validate framework checklist import sample."}
        >
          Validate sample
        </Button>
        {disableReason ? <p className="text-xs text-slate-600">{disableReason}</p> : null}
      </form>

      {validateResult ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p>
            Validation rows processed: <strong>{validateResult.rows_processed}</strong>, normalized:{" "}
            <strong>{validateResult.normalized_rows}</strong>, errors: <strong>{validateResult.errors.length}</strong>.
          </p>
          <p>
            Missing required values: <strong>{validateResult.missing_required_values}</strong>, duplicate warnings:{" "}
            <strong>{validateResult.duplicate_warnings.length}</strong>.
          </p>
          <p>
            Missing headers: <strong>{validateResult.missing_headers.length ? validateResult.missing_headers.join(", ") : "none"}</strong>
          </p>
        </div>
      ) : null}

      {structuredError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          <p className="font-semibold">Validation failed</p>
          <p className="mt-1">{structuredError.message}</p>
          <p className="mt-1 text-xs">
            Code: {structuredError.code} • Status: {structuredError.status || "n/a"}
          </p>
          {structuredError.details ? <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(structuredError.details, null, 2)}</pre> : null}
        </div>
      ) : null}

      {validationRows.length ? (
        <WorkbenchTable<Record<string, unknown>>
          columns={[
            { key: "row", header: "Row", render: (row) => String(row.row ?? "") },
            { key: "error", header: "Error", render: (row) => String(row.error ?? "") },
            { key: "details", header: "Details", render: (row) => JSON.stringify(row.details ?? row) },
          ]}
          rows={validationRows}
          rowKey={(row) => `${String(row.row ?? "")}-${String(row.error ?? "")}-${String(row.details ?? "")}`}
          dense
        />
      ) : null}

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
