"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SettingsPageHeader } from "@/components/common/settings-page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { useToast } from "@/components/common/toaster";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError, getSafeErrorMessage } from "@/lib/api/client";
import {
  useAdminFrameworks,
  useCreateFramework,
  useFrameworkExport,
  useFrameworkImportCreate,
  useFrameworkImportValidate,
  useFrameworkTemplate,
} from "@/lib/hooks/use-framework-management";
import { useProjects } from "@/lib/hooks/use-projects";
import { FrameworkSummary } from "@/types";
import { cn } from "@/utils/cn";

function downloadText(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function collectTextDetails(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTextDetails(item));
  }
  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap((item) => collectTextDetails(item));
  }
  return [];
}

function getImportErrorMessage(error: unknown) {
  if (!(error instanceof ApiClientError)) {
    return getSafeErrorMessage(error);
  }
  if (error.status === 404) {
    return "Selected project was not found.";
  }
  if (error.status === 409) {
    return "Selected project already has initialized indicators. Use a draft project for import.";
  }
  if (error.status === 403) {
    return "You do not have permission to validate or import frameworks.";
  }
  if (error.status === 400) {
    const detailMessage = collectTextDetails(error.details)[0];
    return detailMessage ?? "Checklist validation failed.";
  }
  if (error.status >= 500) {
    return "Unexpected server error during import.";
  }
  return error.message;
}

export function AdminFrameworksScreen() {
  const { pushToast } = useToast();
  const frameworksQuery = useAdminFrameworks();
  const projectsQuery = useProjects();
  const templateQuery = useFrameworkTemplate();
  const createFramework = useCreateFramework();
  const validateImport = useFrameworkImportValidate();
  const createImport = useFrameworkImportCreate();

  const [newFrameworkName, setNewFrameworkName] = useState("");
  const [newFrameworkDescription, setNewFrameworkDescription] = useState("");
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<number>(NaN);
  const [importFrameworkId, setImportFrameworkId] = useState<number>(NaN);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validatedFingerprint, setValidatedFingerprint] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const validationRows = (validateImport.data?.errors ?? []) as Record<string, unknown>[];
  const frameworks = useMemo(() => frameworksQuery.data ?? [], [frameworksQuery.data]);
  const selectedFramework = useMemo(
    () => frameworks.find((framework) => framework.id === selectedFrameworkId),
    [frameworks, selectedFrameworkId],
  );
  const exportQuery = useFrameworkExport(selectedFrameworkId);
  const importFingerprint = useMemo(() => {
    if (!Number.isFinite(importFrameworkId) || !importFile) {
      return null;
    }
    return `${importFrameworkId}:${importFile.name}:${importFile.size}:${importFile.lastModified}`;
  }, [importFile, importFrameworkId]);
  const canRunImport = Boolean(
    importFingerprint &&
      validatedFingerprint === importFingerprint &&
      validateImport.data &&
      validateImport.data.errors.length === 0,
  );

  async function handleCreateFramework(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const created = await createFramework.mutateAsync({
        name: newFrameworkName,
        description: newFrameworkDescription,
      });
      setNewFrameworkName("");
      setNewFrameworkDescription("");
      setSelectedFrameworkId(created.id);
      pushToast("Framework created.", "success");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  function resetImportValidationState() {
    setValidatedFingerprint(null);
    validateImport.reset();
  }

  function handleImportFrameworkChange(event: ChangeEvent<HTMLSelectElement>) {
    setImportFrameworkId(Number(event.target.value));
    resetImportValidationState();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setImportFile(selected);
    resetImportValidationState();
  }

  async function handleValidateImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Number.isFinite(importFrameworkId)) {
      pushToast("Select a framework before validation.", "error");
      return;
    }
    if (!importFile) {
      pushToast("Select a checklist CSV file before validation.", "error");
      return;
    }

    try {
      const result = await validateImport.mutateAsync({
        framework_id: importFrameworkId,
        file: importFile,
      });
      setValidatedFingerprint(importFingerprint);
      if (result.errors.length || result.missing_headers.length) {
        pushToast(`Validation completed with ${result.errors.length} issue(s).`, "error");
      } else {
        pushToast(`Validation passed (${result.normalized_rows} normalized rows).`, "success");
      }
    } catch (error) {
      pushToast(getImportErrorMessage(error), "error");
    }
  }

  async function handleRunImport() {
    if (!Number.isFinite(importFrameworkId)) {
      pushToast("Select a framework before import.", "error");
      return;
    }
    if (!importFile) {
      pushToast("Select a checklist CSV file before import.", "error");
      return;
    }
    if (!canRunImport) {
      pushToast("Run validation successfully before importing.", "error");
      return;
    }

    try {
      const result = await createImport.mutateAsync({
        framework_id: importFrameworkId,
        file: importFile,
      });
      setImportFile(null);
      setValidatedFingerprint(null);
      validateImport.reset();
      setFileInputKey((value) => value + 1);
      setSelectedFrameworkId(result.framework_id);
      pushToast(
        `Imported ${result.indicators_count} indicators to framework. Run AI Classification when ready.`,
        "success",
      );
    } catch (error) {
      pushToast(getImportErrorMessage(error), "error");
    }
  }

  function handleDownloadTemplate() {
    if (!templateQuery.data?.template_csv) return;
    downloadText("framework-template.csv", templateQuery.data.template_csv);
    pushToast("Template downloaded.", "success");
  }

  function handleDownloadExport() {
    if (!selectedFramework || !exportQuery.data?.export_csv) return;
    const safeName = selectedFramework.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadText(`${safeName || "framework"}-export.csv`, exportQuery.data.export_csv);
    pushToast("Framework export downloaded.", "success");
  }

  if (frameworksQuery.isLoading || templateQuery.isLoading) {
    return <LoadingSkeleton className="h-48 w-full" />;
  }

  if (frameworksQuery.error) {
    return <ErrorPanel message={frameworksQuery.error.message} />;
  }

  if (templateQuery.error) {
    return <ErrorPanel message={templateQuery.error.message} />;
  }

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Framework management"
        description="Create frameworks, download checklist templates, validate/import indicator CSVs, and export framework checklists."
        actions={
          <>
            <Link href="/admin/import-logs" className={cn(buttonVariants({ variant: "secondary", size: "default" }))}>
              Import logs
            </Link>
            <Link href="/admin/frameworks/classification" className={cn(buttonVariants({ variant: "secondary", size: "default" }))}>
              Indicator Classification
            </Link>
            <Button variant="secondary" onClick={handleDownloadTemplate}>
              Download template
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Create framework</h3>
          <form className="space-y-3" onSubmit={handleCreateFramework}>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Name</span>
              <Input value={newFrameworkName} onChange={(event) => setNewFrameworkName(event.target.value)} required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Description</span>
              <Textarea
                value={newFrameworkDescription}
                onChange={(event) => setNewFrameworkDescription(event.target.value)}
              />
            </label>
            <Button type="submit" loading={createFramework.isPending}>
              Create framework
            </Button>
          </form>
        </Card>

        <Card className="space-y-4 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Export framework checklist</h3>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Framework</span>
            <Select
              value={Number.isFinite(selectedFrameworkId) ? String(selectedFrameworkId) : ""}
              onChange={(event) => setSelectedFrameworkId(Number(event.target.value))}
            >
              <option value="">Select framework</option>
              {frameworks.map((framework: FrameworkSummary) => (
                <option key={framework.id} value={framework.id}>
                  {framework.name}
                </option>
              ))}
            </Select>
          </label>
          {Number.isFinite(selectedFrameworkId) ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {exportQuery.isLoading ? "Loading export summary..." : null}
              {exportQuery.error ? `Export fetch failed: ${exportQuery.error.message}` : null}
              {exportQuery.data ? `Rows: ${exportQuery.data.row_count}` : null}
            </div>
          ) : (
            <p className="text-sm text-slate-600">Select a framework to preview and download export CSV.</p>
          )}
          <Button
            variant="secondary"
            onClick={handleDownloadExport}
            disabled={!selectedFramework || !exportQuery.data || exportQuery.isLoading}
          >
            Download export CSV
          </Button>
        </Card>
      </div>

      <Card className="space-y-4 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Import framework checklist</h3>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleValidateImport}>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Framework</span>
            <Select value={Number.isFinite(importFrameworkId) ? String(importFrameworkId) : ""} onChange={handleImportFrameworkChange}>
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
            <Input
              key={fileInputKey}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              required
            />
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" variant="secondary" loading={validateImport.isPending}>
              Validate import
            </Button>
            <Button
              type="button"
              onClick={handleRunImport}
              loading={createImport.isPending}
              disabled={!canRunImport}
            >
              Run import
            </Button>
          </div>
        </form>

        {importFile ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p>
              Selected file: <strong>{importFile.name}</strong> ({formatBytes(importFile.size)})
            </p>
          </div>
        ) : null}

        {validateImport.data ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p>
              Validation rows processed: <strong>{validateImport.data.rows_processed}</strong>, normalized:{" "}
              <strong>{validateImport.data.normalized_rows}</strong>, errors:{" "}
              <strong>{validateImport.data.errors.length}</strong>.
            </p>
            <p>
              Missing required values: <strong>{validateImport.data.missing_required_values}</strong>, duplicate warnings:{" "}
              <strong>{validateImport.data.duplicate_warnings.length}</strong>.
            </p>
            <p>
              Missing headers:{" "}
              <strong>{validateImport.data.missing_headers.length ? validateImport.data.missing_headers.join(", ") : "none"}</strong>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Run validation before importing. Import remains disabled until validation passes.</p>
        )}

        {validateImport.data?.errors?.length ? (
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
      </Card>

      <WorkbenchTable<FrameworkSummary>
        columns={[
          { key: "name", header: "Framework", render: (row) => row.name },
          { key: "description", header: "Description", render: (row) => row.description || "-" },
          {
            key: "analysis",
            header: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/frameworks/${row.id}/analysis`}
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                >
                  Open
                </Link>
                <Link
                  href={`/admin/frameworks/classification?framework=${row.id}`}
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                >
                  Classify Indicators
                </Link>
              </div>
            ),
          },
        ]}
        rows={frameworks}
        rowKey={(row) => row.id}
      />
    </div>
  );
}
