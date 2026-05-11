"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageHeader } from "@/components/common/page-header";
import { PermissionHint } from "@/components/common/permission-hint";
import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { canAccessAdminArea, getRestrictionMessage } from "@/lib/authz";
import { apiClient, getSafeErrorMessage } from "@/lib/api/client";
import { useAuthSession } from "@/lib/hooks/use-auth";
import { useFrameworkClassification } from "@/lib/hooks/use-indicator-classification";
import { useAdminFrameworks, useListDocumentDrafts, useUpdateDocumentDraft } from "@/lib/hooks/use-admin";
import type { DocumentDraft } from "@/types";

type Scope = "single_indicator" | "selected_indicators" | "area" | "standard" | "framework";
type Kind =
  | "SOP"
  | "POLICY"
  | "CHECKLIST"
  | "REGISTER_TEMPLATE"
  | "EVIDENCE_REQUIREMENT_SHEET"
  | "GAP_CLOSURE_PLAN";

const scopeOptions: Array<{ value: Scope; label: string; description: string }> = [
  { value: "single_indicator", label: "Single indicator", description: "Generate a draft for one requirement." },
  { value: "selected_indicators", label: "Selected indicators", description: "Generate one draft covering multiple selected requirements." },
  { value: "area", label: "Area", description: "Generate one draft for all indicators in an area." },
  { value: "standard", label: "Standard", description: "Generate one draft for all indicators in a standard." },
  { value: "framework", label: "Full framework", description: "Generate one draft covering the full framework." },
];

const kindOptions: Array<{ value: Kind; label: string }> = [
  { value: "SOP", label: "SOP" },
  { value: "POLICY", label: "Policy" },
  { value: "CHECKLIST", label: "Checklist" },
  { value: "REGISTER_TEMPLATE", label: "Register template" },
  { value: "EVIDENCE_REQUIREMENT_SHEET", label: "Evidence requirement sheet" },
  { value: "GAP_CLOSURE_PLAN", label: "Gap closure plan" },
];

export function FrameworkDocumentationAIScreen() {
  const { pushToast } = useToast();
  const authQuery = useAuthSession();
  const user = authQuery.data?.user;
  const allowed = canAccessAdminArea(user);
  const restrictionMessage = getRestrictionMessage("adminArea");

  const frameworksQuery = useAdminFrameworks();
  const frameworks = frameworksQuery.data ?? [];

  const [frameworkId, setFrameworkId] = useState<number>(NaN);
  const [scope, setScope] = useState<Scope>("single_indicator");
  const [kind, setKind] = useState<Kind>("POLICY");
  const [indicatorId, setIndicatorId] = useState<number>(NaN);
  const [indicatorIds, setIndicatorIds] = useState<number[]>([]);
  const [areaId, setAreaId] = useState<number>(NaN);
  const [standardId, setStandardId] = useState<number>(NaN);
  const [userInstruction, setUserInstruction] = useState("");

  const classificationQuery = useFrameworkClassification(frameworkId, {});
  const indicators = useMemo(() => classificationQuery.data?.results ?? [], [classificationQuery.data]);

  const areas = useMemo(() => {
    const map = new Map<number, string>();
    for (const row of indicators) map.set(row.area_id, `${row.area_code} — ${row.area_name}`);
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [indicators]);

  const standards = useMemo(() => {
    const map = new Map<number, string>();
    for (const row of indicators) map.set(row.standard_id, `${row.standard_code} — ${row.standard_name}`);
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [indicators]);

  const draftsQuery = useListDocumentDrafts(Number.isFinite(frameworkId) ? { framework_id: frameworkId } : {});
  const drafts = (draftsQuery.data as DocumentDraft[] | undefined) ?? [];

  const [draftId, setDraftId] = useState<number | null>(null);
  const updateDraft = useUpdateDocumentDraft(draftId ?? 0);

  const [editableTitle, setEditableTitle] = useState("");
  const [editableContent, setEditableContent] = useState("");

  async function generateDraft() {
    if (!Number.isFinite(frameworkId)) {
      pushToast("Select a framework first.", "error");
      return;
    }
    if (scope === "single_indicator" && !Number.isFinite(indicatorId)) {
      pushToast("Select an indicator.", "error");
      return;
    }
    if (scope === "selected_indicators" && indicatorIds.length === 0) {
      pushToast("Select one or more indicators.", "error");
      return;
    }
    if (scope === "area" && !Number.isFinite(areaId)) {
      pushToast("Select an area.", "error");
      return;
    }
    if (scope === "standard" && !Number.isFinite(standardId)) {
      pushToast("Select a standard.", "error");
      return;
    }

    try {
      const payload: Record<string, unknown> = { scope, kind, user_instruction: userInstruction };
      if (scope === "single_indicator") payload.indicator_id = indicatorId;
      if (scope === "selected_indicators") payload.indicator_ids = indicatorIds;
      if (scope === "area") payload.area_id = areaId;
      if (scope === "standard") payload.standard_id = standardId;

      const result = await apiClient.post<DocumentDraft>(
        `/api/admin/frameworks/${frameworkId}/documentation/generate-draft/`,
        payload,
      );
      pushToast("AI draft generated.", "success");
      setDraftId(result.id);
      setEditableTitle(result.title ?? "");
      setEditableContent(result.draft_content ?? "");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function saveDraft() {
    if (!draftId) return;
    try {
      await updateDraft.mutateAsync({ title: editableTitle, draft_content: editableContent });
      pushToast("Draft saved.", "success");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  if (authQuery.isLoading || frameworksQuery.isLoading) return <LoadingSkeleton className="h-48 w-full" />;
  if (authQuery.error) return <ErrorPanel message={authQuery.error.message} />;
  if (frameworksQuery.error) return <ErrorPanel message={frameworksQuery.error.message} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Framework"
        title="Framework Documentation AI"
        description="Generate AI-assisted draft documentation for a framework. Drafts are advisory and require human review before promotion."
        actions={
          <Link href="/admin/document-drafts" className="text-sm font-medium text-slate-700 underline">
            Open draft review queue
          </Link>
        }
      />

      <PermissionHint allowed={allowed}>{restrictionMessage}</PermissionHint>

      <Card className="space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm" htmlFor="framework-docai-framework">
            <span className="font-medium text-slate-700">Framework</span>
            <Select
              id="framework-docai-framework"
              value={Number.isFinite(frameworkId) ? String(frameworkId) : ""}
              onChange={(e) => {
                setFrameworkId(Number(e.target.value));
                setDraftId(null);
                setIndicatorIds([]);
              }}
              disabled={!allowed}
            >
              <option value="">Select framework</option>
              {frameworks.map((fw) => (
                <option key={fw.id} value={fw.id}>
                  {fw.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-1 text-sm" htmlFor="framework-docai-kind">
            <span className="font-medium text-slate-700">Document type</span>
            <Select id="framework-docai-kind" value={kind} onChange={(e) => setKind(e.target.value as Kind)} disabled={!allowed}>
              {kindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <label className="space-y-1 text-sm" htmlFor="framework-docai-scope">
          <span className="font-medium text-slate-700">Scope</span>
          <Select id="framework-docai-scope" value={scope} onChange={(e) => setScope(e.target.value as Scope)} disabled={!allowed}>
            {scopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-500">
            {scopeOptions.find((o) => o.value === scope)?.description}
          </p>
        </label>

        {classificationQuery.isLoading ? <LoadingSkeleton className="h-20 w-full" /> : null}
        {classificationQuery.error ? <ErrorPanel message={classificationQuery.error.message} /> : null}

        {scope === "single_indicator" ? (
          <label className="space-y-1 text-sm" htmlFor="framework-docai-indicator">
            <span className="font-medium text-slate-700">Indicator</span>
            <Select
              id="framework-docai-indicator"
              value={Number.isFinite(indicatorId) ? String(indicatorId) : ""}
              onChange={(e) => setIndicatorId(Number(e.target.value))}
              disabled={!allowed || !Number.isFinite(frameworkId)}
            >
              <option value="">Select indicator</option>
              {indicators.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.code} — {row.text.slice(0, 80)}
                </option>
              ))}
            </Select>
          </label>
        ) : null}

        {scope === "selected_indicators" ? (
          <label className="space-y-1 text-sm" htmlFor="framework-docai-indicators">
            <span className="font-medium text-slate-700">Indicators</span>
            <Select
              id="framework-docai-indicators"
              multiple
              value={indicatorIds.map(String)}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
                setIndicatorIds(values);
              }}
              disabled={!allowed || !Number.isFinite(frameworkId)}
              className="h-44"
            >
              {indicators.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.code} — {row.text.slice(0, 80)}
                </option>
              ))}
            </Select>
            <p className="text-xs text-slate-500">Tip: Hold Ctrl/Cmd to select multiple.</p>
          </label>
        ) : null}

        {scope === "area" ? (
          <label className="space-y-1 text-sm" htmlFor="framework-docai-area">
            <span className="font-medium text-slate-700">Area</span>
            <Select
              id="framework-docai-area"
              value={Number.isFinite(areaId) ? String(areaId) : ""}
              onChange={(e) => setAreaId(Number(e.target.value))}
              disabled={!allowed || !Number.isFinite(frameworkId)}
            >
              <option value="">Select area</option>
              {areas.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
          </label>
        ) : null}

        {scope === "standard" ? (
          <label className="space-y-1 text-sm" htmlFor="framework-docai-standard">
            <span className="font-medium text-slate-700">Standard</span>
            <Select
              id="framework-docai-standard"
              value={Number.isFinite(standardId) ? String(standardId) : ""}
              onChange={(e) => setStandardId(Number(e.target.value))}
              disabled={!allowed || !Number.isFinite(frameworkId)}
            >
              <option value="">Select standard</option>
              {standards.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
          </label>
        ) : null}

        <label className="space-y-1 text-sm" htmlFor="framework-docai-instruction">
          <span className="font-medium text-slate-700">Optional instructions</span>
          <Textarea id="framework-docai-instruction" value={userInstruction} onChange={(e) => setUserInstruction(e.target.value)} rows={3} disabled={!allowed} />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generateDraft} disabled={!allowed}>
            Generate draft
          </Button>
          <Button variant="secondary" onClick={saveDraft} disabled={!allowed || !draftId || updateDraft.isPending}>
            Save draft
          </Button>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-semibold">AI-generated draft — requires human review</p>
          <p className="mt-1">
            Drafts are not evidence. Promotion into project evidence must be explicit and governed.
          </p>
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="text-sm font-semibold text-slate-950">Draft preview</h2>
        {!draftId ? (
          <p className="text-sm text-slate-600">Generate a draft to preview and edit it here.</p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm" htmlFor="framework-docai-draft-title">
                <span className="font-medium text-slate-700">Title</span>
                <Input id="framework-docai-draft-title" value={editableTitle} onChange={(e) => setEditableTitle(e.target.value)} disabled={!allowed} />
              </label>
              <div className="flex items-end justify-end gap-2">
                <Link
                  href={`/admin/document-drafts/${draftId}`}
                  className="text-sm font-medium text-slate-700 underline"
                >
                  Review / promote
                </Link>
              </div>
            </div>
            <Textarea
              aria-label="Draft content"
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              rows={18}
              disabled={!allowed}
            />
          </>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-950">Recent drafts for selected framework</h2>
        {draftsQuery.isLoading ? (
          <LoadingSkeleton className="h-24 w-full" />
        ) : drafts.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {drafts.slice(0, 8).map((draft) => (
              <li key={draft.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-950">{draft.title}</div>
                  <div className="text-xs text-slate-500">
                    Status: {draft.review_status} • Advisory: {String(draft.is_advisory)}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => {
                  setDraftId(draft.id);
                  setEditableTitle(draft.title ?? "");
                  setEditableContent(draft.draft_content ?? "");
                }}>
                  Open
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No drafts yet for this framework.</p>
        )}
      </Card>
    </div>
  );
}
