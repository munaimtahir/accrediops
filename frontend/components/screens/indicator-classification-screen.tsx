"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SettingsPageHeader } from "@/components/common/settings-page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { useToast } from "@/components/common/toaster";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ClassificationFilters,
  useBulkReviewClassification,
  useFrameworkClassification,
  useRunAIClassification,
  useUpdateIndicatorClassification,
} from "@/lib/hooks/use-indicator-classification";
import { useAdminFrameworks } from "@/lib/hooks/use-framework-management";
import { getSafeErrorMessage } from "@/lib/api/client";
import { IndicatorClassification } from "@/types";
import { cn } from "@/utils/cn";

const evidenceTypes = [
  ["DOCUMENT_POLICY", "Document / Policy"],
  ["RECORD_REGISTER", "Record / Register"],
  ["PHYSICAL_FACILITY", "Physical / Facility"],
  ["LICENSE_CERTIFICATE", "License / Certificate"],
  ["STAFF_TRAINING", "Staff / Training"],
  ["PROCESS_WORKFLOW", "Process / Workflow"],
  ["AUDIT_QUALITY", "Audit / Quality"],
  ["MIXED_EVIDENCE", "Mixed Evidence"],
  ["MANUAL_REVIEW", "Manual Review Needed"],
] as const;

const aiLevels = [
  ["FULL_AI", "Full AI"],
  ["PARTIAL_AI", "Partial AI"],
  ["NO_AI", "No AI"],
] as const;

const frequencies = [
  ["ONE_TIME", "One-time"],
  ["RECURRING", "Recurring"],
  ["EVENT_BASED", "Event-based"],
] as const;

const actions = [
  ["GENERATE_DOCUMENT", "Generate Document"],
  ["COLLECT_RECORD", "Collect Record"],
  ["UPLOAD_PHOTO", "Upload Photo"],
  ["ARRANGE_PHYSICAL_COMPLIANCE", "Arrange Physical Compliance"],
  ["OBTAIN_CERTIFICATE", "Obtain Certificate"],
  ["TRAIN_STAFF", "Train Staff"],
  ["MAINTAIN_LOG", "Maintain Log"],
  ["REVIEW_EXISTING_EVIDENCE", "Review Existing Evidence"],
  ["MANUAL_DECISION", "Manual Decision"],
] as const;

const statuses = [
  ["UNCLASSIFIED", "Unclassified"],
  ["AI_SUGGESTED", "AI Suggested"],
  ["HUMAN_REVIEWED", "Human Reviewed"],
  ["MANUALLY_CHANGED", "Manually Changed"],
  ["NEEDS_REVIEW", "Needs Review"],
] as const;

const confidences = [
  ["HIGH", "High"],
  ["MEDIUM", "Medium"],
  ["LOW", "Low"],
] as const;

function optionLabel(options: readonly (readonly [string, string])[], value: string) {
  return (options.find(([code]) => code === value)?.[1] ?? value) || "-";
}

function Badge({ value, tone = "slate" }: { value: string; tone?: "slate" | "amber" | "green" | "red" }) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    red: "border-rose-200 bg-rose-50 text-rose-800",
  };
  return <span className={cn("inline-flex rounded-md border px-2 py-1 text-xs font-medium", tones[tone])}>{value}</span>;
}

export function IndicatorClassificationScreen({ initialFrameworkId }: { initialFrameworkId?: number }) {
  const { pushToast } = useToast();
  const frameworksQuery = useAdminFrameworks();
  const frameworks = frameworksQuery.data ?? [];
  const [frameworkId, setFrameworkId] = useState<number>(initialFrameworkId ?? NaN);
  const [filters, setFilters] = useState<ClassificationFilters>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [drafts, setDrafts] = useState<Record<number, Partial<IndicatorClassification>>>({});
  const [forceOpen, setForceOpen] = useState(false);
  const [overwriteHuman, setOverwriteHuman] = useState(false);

  const classificationQuery = useFrameworkClassification(frameworkId, filters);
  const runClassification = useRunAIClassification(frameworkId);
  const updateClassification = useUpdateIndicatorClassification();
  const bulkReview = useBulkReviewClassification(frameworkId);

  const rows = classificationQuery.data?.results ?? [];
  const summary = classificationQuery.data?.summary;
  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function setFilter(key: keyof ClassificationFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  }

  function updateDraft(id: number, field: keyof IndicatorClassification, value: string) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  function rowValue(row: IndicatorClassification, field: keyof IndicatorClassification) {
    return String(drafts[row.id]?.[field] ?? row[field] ?? "");
  }

  async function saveRow(row: IndicatorClassification, approve = false) {
    try {
      await updateClassification.mutateAsync({
        indicatorId: row.id,
        payload: {
          ...drafts[row.id],
          classification_review_status: approve ? "HUMAN_REVIEWED" : "MANUALLY_CHANGED",
        },
      });
      setDrafts((current) => {
        const next = { ...current };
        delete next[row.id];
        return next;
      });
      pushToast(approve ? "Classification approved." : "Classification saved.", "success");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function run(mode: "unclassified_only" | "selected" | "unreviewed_only" | "force_all") {
    try {
      const result = await runClassification.mutateAsync({
        mode,
        indicator_ids: mode === "selected" ? selectedIds : [],
        overwrite_human_reviewed: mode === "force_all" ? overwriteHuman : false,
        confirm_force: mode === "force_all",
      });
      setForceOpen(false);
      pushToast(`Classified ${result.classified_count}; skipped ${result.skipped_count}.`, "success");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function bulkApprove(mode: "selected" | "ai_suggested" | "filtered" = "selected") {
    if (mode === "selected" && !selectedIds.length) {
      pushToast("Select indicators first.", "error");
      return;
    }
    
    const confirmMessage = 
      mode === "ai_suggested" ? "Approve all AI-suggested classifications? (LOW confidence rows will be skipped)" :
      mode === "filtered" ? "Approve all indicators currently matching filters? (UNCLASSIFIED rows will be skipped)" :
      undefined;

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    try {
      const result = await bulkReview.mutateAsync({ 
        mode,
        indicator_ids: mode === "selected" ? selectedIds : [], 
        action: "approve",
        filters: mode === "filtered" ? (filters as unknown as Record<string, unknown>) : undefined,
      });
      setSelected(new Set());
      pushToast(`Approved ${result.updated_count} classifications. Skipped ${result.skipped_count} rows.`, "success");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  if (frameworksQuery.isLoading) return <LoadingSkeleton className="h-48 w-full" />;
  if (frameworksQuery.error) return <ErrorPanel message={frameworksQuery.error.message} />;

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Indicator Classification"
        description="Classify indicators by evidence type, AI assistance level, frequency, and required action."
        actions={
          <Link href="/admin/frameworks" className={cn(buttonVariants({ variant: "secondary", size: "default" }))}>
            Frameworks
          </Link>
        }
      />

      <Card className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1 text-sm lg:col-span-2">
          <label htmlFor="framework-select" className="font-medium text-slate-700">Framework</label>
          <Select id="framework-select" value={Number.isFinite(frameworkId) ? String(frameworkId) : ""} onChange={(event) => setFrameworkId(Number(event.target.value))}>
            <option value="">Select framework</option>
            {frameworks.map((framework) => (
              <option key={framework.id} value={framework.id}>{framework.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="search-filter" className="font-medium text-slate-700">Search</label>
          <Input id="search-filter" value={filters.search ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => setFilter("search", event.target.value)} placeholder="Code or text" />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="area-filter" className="font-medium text-slate-700">Area / Standard</label>
          <Input id="area-filter" value={filters.area ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => setFilter("area", event.target.value)} placeholder="Area" />
        </div>
      </Card>

      {Number.isFinite(frameworkId) ? (
        <>
          {classificationQuery.isLoading ? <LoadingSkeleton className="h-48 w-full" /> : null}
          {classificationQuery.error ? <ErrorPanel message={classificationQuery.error.message} /> : null}
          {summary ? (
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ["Total", summary.total],
                ["Unclassified", summary.unclassified],
                ["Needs Review", summary.needs_review],
                ["Reviewed", summary.human_reviewed],
              ].map(([label, value]) => (
                <Card key={label} className="p-4">
                  <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-950">{value}</div>
                </Card>
              ))}
            </div>
          ) : null}

          <Card className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => run("unclassified_only")} loading={runClassification.isPending}>
                Run AI Classification
              </Button>
              <Button variant="secondary" onClick={() => bulkApprove("selected")} disabled={!selectedIds.length} loading={bulkReview.isPending}>
                Approve Selected
              </Button>
              <Button variant="secondary" onClick={() => bulkApprove("ai_suggested")} loading={bulkReview.isPending}>
                Approve All AI Suggested
              </Button>
              <Button variant="secondary" onClick={() => bulkApprove("filtered")} loading={bulkReview.isPending}>
                Approve Filtered
              </Button>
              <Button variant="secondary" onClick={() => run("unreviewed_only")} loading={runClassification.isPending}>
                Reclassify Unreviewed
              </Button>
              <Button variant="danger" onClick={() => setForceOpen((value) => !value)}>Force Reclassify All</Button>
              <Button variant="ghost" onClick={() => setFilters({})}>Reset Filters</Button>
            </div>
            {summary?.unclassified === 0 ? (
              <p className="text-sm text-slate-600">Classification already completed.</p>
            ) : null}
            {forceOpen ? (
              <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p>This may replace existing AI-suggested classifications. Human-reviewed or manually changed classifications will not be overwritten unless you explicitly allow it.</p>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={overwriteHuman} onChange={(event) => setOverwriteHuman(event.target.checked)} />
                  Also overwrite human-reviewed/manually changed classifications
                </label>
                <Button variant="danger" size="sm" onClick={() => run("force_all")} loading={runClassification.isPending}>
                  Confirm Force Reclassify
                </Button>
              </div>
            ) : null}
          </Card>

          <Card className="grid gap-3 p-4 md:grid-cols-3 lg:grid-cols-6">
            <Select value={filters.evidence_type ?? ""} onChange={(event) => setFilter("evidence_type", event.target.value)}>
              <option value="">Evidence Type</option>
              {evidenceTypes.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </Select>
            <Select value={filters.ai_assistance_level ?? ""} onChange={(event) => setFilter("ai_assistance_level", event.target.value)}>
              <option value="">AI Assistance</option>
              {aiLevels.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </Select>
            <Select value={filters.evidence_frequency ?? ""} onChange={(event) => setFilter("evidence_frequency", event.target.value)}>
              <option value="">Frequency</option>
              {frequencies.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </Select>
            <Select value={filters.primary_action_required ?? ""} onChange={(event) => setFilter("primary_action_required", event.target.value)}>
              <option value="">Primary Action</option>
              {actions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </Select>
            <Select value={filters.classification_review_status ?? ""} onChange={(event) => setFilter("classification_review_status", event.target.value)}>
              <option value="">Review Status</option>
              {statuses.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </Select>
            <Select value={filters.classification_confidence ?? ""} onChange={(event) => setFilter("classification_confidence", event.target.value)}>
              <option value="">Confidence</option>
              {confidences.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </Select>
          </Card>

          <div className="flex flex-wrap gap-2">
            {[
              ["Unclassified", "classification_review_status", "UNCLASSIFIED"],
              ["Needs Review", "classification_review_status", "NEEDS_REVIEW"],
              ["Full AI", "ai_assistance_level", "FULL_AI"],
              ["No AI", "ai_assistance_level", "NO_AI"],
              ["Recurring", "evidence_frequency", "RECURRING"],
              ["Document / Policy", "evidence_type", "DOCUMENT_POLICY"],
              ["Physical / Facility", "evidence_type", "PHYSICAL_FACILITY"],
              ["Manual Review Needed", "evidence_type", "MANUAL_REVIEW"],
            ].map(([label, key, value]) => (
              <Button key={label} variant="secondary" size="sm" onClick={() => setFilter(key as keyof ClassificationFilters, value)}>
                {label}
              </Button>
            ))}
          </div>

          <WorkbenchTable<IndicatorClassification>
            rows={rows}
            rowKey={(row) => row.id}
            empty={<Card className="p-4 text-sm text-slate-600">No indicators match the current filters.</Card>}
            columns={[
              {
                key: "select",
                header: "",
                render: (row) => (
                  <input
                    type="checkbox"
                    aria-label={`Select indicator ${row.code}`}
                    checked={selected.has(row.id)}
                    onChange={(event) => {
                      setSelected((current) => {
                        const next = new Set(current);
                        if (event.target.checked) next.add(row.id);
                        else next.delete(row.id);
                        return next;
                      });
                    }}
                  />
                ),
              },
              { key: "code", header: "Indicator", render: (row) => <div className="font-medium">{row.code}<div className="mt-1 max-w-sm font-normal text-slate-600">{row.text}</div></div> },
              { key: "area", header: "Area / Standard", render: (row) => <div>{row.area_name}<div className="text-xs text-slate-500">{row.standard_name}</div></div> },
              {
                key: "evidence_type",
                header: "Evidence Type",
                render: (row) => (
                  <Select className="min-w-48" value={rowValue(row, "evidence_type")} onChange={(event) => updateDraft(row.id, "evidence_type", event.target.value)}>
                    {evidenceTypes.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                  </Select>
                ),
              },
              {
                key: "ai",
                header: "AI",
                render: (row) => (
                  <Select className="min-w-32" value={rowValue(row, "ai_assistance_level")} onChange={(event) => updateDraft(row.id, "ai_assistance_level", event.target.value)}>
                    <option value="">Unset</option>
                    {aiLevels.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                  </Select>
                ),
              },
              {
                key: "frequency",
                header: "Frequency",
                render: (row) => (
                  <Select className="min-w-36" value={rowValue(row, "evidence_frequency")} onChange={(event) => updateDraft(row.id, "evidence_frequency", event.target.value)}>
                    <option value="">Unset</option>
                    {frequencies.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                  </Select>
                ),
              },
              {
                key: "action",
                header: "Primary Action",
                render: (row) => (
                  <Select className="min-w-56" value={rowValue(row, "primary_action_required")} onChange={(event) => updateDraft(row.id, "primary_action_required", event.target.value)}>
                    <option value="">Unset</option>
                    {actions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                  </Select>
                ),
              },
              {
                key: "confidence",
                header: "Confidence",
                render: (row) => <Badge value={row.classification_confidence || "-"} tone={row.classification_confidence === "LOW" ? "amber" : "slate"} />,
              },
              { key: "reason", header: "Reason", render: (row) => <div className="max-w-xs text-slate-600">{row.classification_reason || "-"}</div> },
              {
                key: "status",
                header: "Review Status",
                render: (row) => (
                  <Badge
                    value={optionLabel(statuses, row.classification_review_status)}
                    tone={row.classification_review_status === "HUMAN_REVIEWED" ? "green" : row.classification_review_status === "NEEDS_REVIEW" ? "red" : "slate"}
                  />
                ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="secondary" onClick={() => saveRow(row)} disabled={!drafts[row.id]} loading={updateClassification.isPending}>Save row</Button>
                    <Button size="sm" onClick={() => saveRow(row, true)} loading={updateClassification.isPending}>Approve</Button>
                  </div>
                ),
              },
            ]}
          />
        </>
      ) : (
        <Card className="p-4 text-sm text-slate-600">Select a framework to review indicator classifications.</Card>
      )}
    </div>
  );
}
