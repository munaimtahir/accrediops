"use client";

import { useState } from "react";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SettingsPageHeader } from "@/components/common/settings-page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useAdminFrameworks,
  useDocumentGenerationQueue,
  useGenerateDocumentDraft,
  useListDocumentDrafts,
  useRetrieveDocumentDraft,
} from "@/lib/hooks/use-admin";
import { useAdminProjects, useProjectIndicatorsForProject } from "@/lib/hooks/use-projects";
import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { FileText, Wand2 } from "lucide-react";
import Link from "next/link";
import { DocumentDraft, FrameworkSummary, ProjectSummary } from "@/types";
import { Modal } from "@/components/common/modal";
import { SafeHTML } from "@/components/common/safe-html";
import { Textarea } from "@/components/ui/textarea";
import { FormEvent } from "react";
import { getSafeErrorMessage } from "@/lib/api/client";

function GenerateDraftModal({ indicatorId, open, onClose, onGenerated }: { indicatorId: number; open: boolean; onClose: () => void; onGenerated: () => void }) {
  const { pushToast } = useToast();
  const generateDraft = useGenerateDocumentDraft(indicatorId);
  const [userInstruction, setUserInstruction] = useState("");
  const [generateMode, setGenerateMode] = useState<"framework" | "project">("framework");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProjectIndicatorId, setSelectedProjectIndicatorId] = useState<number | null>(null);

  const projectsQuery = useAdminProjects();
  const projects = projectsQuery.data ?? [];
  const projectIndicatorsQuery = useProjectIndicatorsForProject(selectedProjectId ?? NaN);
  const projectIndicators = projectIndicatorsQuery.data ?? [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (generateMode === "project" && (!selectedProjectId || !selectedProjectIndicatorId)) {
        pushToast("Select both project and project indicator for project-specific drafts.", "error");
        return;
      }
      await generateDraft.mutateAsync({
        user_instruction: userInstruction,
        ...(generateMode === "project" && selectedProjectId && selectedProjectIndicatorId ? { project_id: selectedProjectId, project_indicator_id: selectedProjectIndicatorId } : {}),
      });
      pushToast("Document draft generated.", "success");
      onGenerated();
      onClose();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <Modal open={open} title="Generate Document Draft" description="Generate an AI-assisted document draft for this indicator." onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Instructions for AI (optional)</span>
          <Textarea value={userInstruction} onChange={(e) => setUserInstruction(e.target.value)} rows={3} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Generate Mode</span>
          <Select value={generateMode} onChange={(e) => {
            setGenerateMode(e.target.value as "framework" | "project");
            setSelectedProjectId(null);
            setSelectedProjectIndicatorId(null);
          }}>
            <option value="framework">Framework Template Draft</option>
            <option value="project">Project-Specific Draft</option>
          </Select>
        </label>
        {generateMode === "project" && (
          <>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Select Project</span>
              <Select value={selectedProjectId ?? ""} onChange={(e) => setSelectedProjectId(Number(e.target.value))}>
                <option value="">Select a project</option>
                {projects.map((p: ProjectSummary) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </label>
            {selectedProjectId && projectIndicatorsQuery.isLoading && <LoadingSkeleton className="h-10 w-full" />}
            {selectedProjectId && projectIndicatorsQuery.data && (
              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">Select Project Indicator</span>
                <Select value={selectedProjectIndicatorId ?? ""} onChange={(e) => setSelectedProjectIndicatorId(Number(e.target.value))}>
                  <option value="">Select an indicator</option>
                  {projectIndicators.map((pi: any) => ( // TODO: Define ProjectIndicatorSummary type
                    <option key={pi.id} value={pi.id}>{pi.indicator_code} - {pi.indicator_text.substring(0, 50)}...</option>
                  ))}
                </Select>
              </label>
            )}
          </>
        )}
        <div className="flex justify-end">
          <Button type="submit" loading={generateDraft.isPending}>Generate Draft</Button>
        </div>
      </form>
    </Modal>
  );
}

function ViewDraftModal({ draftId, open, onClose }: { draftId: number; open: boolean; onClose: () => void }) {
  const { pushToast } = useToast();
  const draftQuery = useRetrieveDocumentDraft(draftId);

  if (draftQuery.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (draftQuery.error) return <ErrorPanel message={draftQuery.error.message} />;

  const draft = draftQuery.data as DocumentDraft;

  return (
    <Modal open={open} title={draft.title} description={`Version ${draft.version} | Status: ${draft.review_status}`} onClose={onClose} size="xl">
      <SafeHTML
        html={draft.draft_content as string}
        className="prose prose-sm max-w-none"
      />
    </Modal>
  );
}

export function AdminDocumentGenerationQueueScreen() {
  const { pushToast } = useToast();
  const [frameworkId, setFrameworkId] = useState("");
  const [search, setSearch] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState<number | null>(null);
  const [showViewModal, setShowViewModal] = useState<number | null>(null);

  const frameworksQuery = useAdminFrameworks();
  const queueQuery = useDocumentGenerationQueue({ framework: frameworkId || undefined, search: search || undefined });
  const allDraftsQuery = useListDocumentDrafts(); // Fetch all drafts for summary
  

  if (frameworksQuery.isLoading || queueQuery.isLoading || allDraftsQuery.isLoading)
    return <LoadingSkeleton className="h-40 w-full" />;
  if (frameworksQuery.error) return <ErrorPanel message={frameworksQuery.error.message} />;

  const frameworks = frameworksQuery.data ?? [];
  const rows = queueQuery.data?.results ?? [];
  const allDrafts = (allDraftsQuery.data ?? []) as DocumentDraft[];

  const fullAICount = rows.filter((row) => row.ai_assistance_level === "FULL_AI").length;
  const partialAICount = rows.filter((row) => row.ai_assistance_level === "PARTIAL_AI").length;
  const draftsGenerated = allDrafts.length;
  const draftsPendingReview = allDrafts.filter(
    (draft) => draft.review_status === "HUMAN_REVIEW_REQUIRED" || draft.review_status === "DRAFT",
  ).length;
  const draftsPromoted = allDrafts.filter((draft) => draft.review_status === "PROMOTED_TO_EVIDENCE").length;

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Document Generation Queue"
        description="Indicators classified for automated document drafting. AI drafts remain advisory until human promotion."
      />

      <div className="grid gap-3 lg:grid-cols-5">
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">Eligible Indicators</div>
          <div className="mt-1 text-2xl font-semibold text-slate-950">{rows.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase text-sky-600">Full AI Support</div>
          <div className="mt-1 text-2xl font-semibold text-sky-700">{fullAICount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase text-indigo-600">Partial AI Support</div>
          <div className="mt-1 text-2xl font-semibold text-indigo-700">{partialAICount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase text-teal-600">Drafts Generated</div>
          <div className="mt-1 text-2xl font-semibold text-teal-700">{draftsGenerated}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase text-amber-600">Pending Review</div>
          <div className="mt-1 text-2xl font-semibold text-amber-700">{draftsPendingReview}</div>
        </Card>
      </div>

      <Card className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1 text-sm">
          <label className="font-medium text-slate-700">Framework</label>
          <Select value={frameworkId} onChange={(e) => setFrameworkId(e.target.value)}>
            <option value="">All Frameworks</option>
            {frameworks.map((fw) => (
              <option key={fw.id} value={fw.id}>{fw.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1 text-sm">
          <label className="font-medium text-slate-700">Search</label>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Code or text" />
        </div>
      </Card>

      <WorkbenchTable<Record<string, unknown>>
        columns={[
          { key: "code", header: "Indicator", render: (row) => <div className="font-medium">{String(row.code)}</div> },
          { key: "text", header: "Requirement", render: (row) => <div className="text-xs text-slate-600 line-clamp-2" title={String(row.text)}>{String(row.text)}</div> },
          { key: "framework", header: "Framework", render: (row) => <div className="text-xs">{String(row.framework_name)}</div> },
          { key: "ai", header: "AI Assistance", render: (row) => <div className="text-xs font-semibold text-indigo-700">{String(row.ai_assistance_level)}</div> },
          { key: "draft_status", header: "Latest Draft", render: (row) => (
            row.latest_draft ? (
              <div className="text-xs">
                <div>v{row.latest_draft.version} ({row.latest_draft.review_status})</div>
                <div className="text-slate-500">{String(row.latest_draft.generated_at).slice(0, 10)}</div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">No Draft</div>
            )
          )},
          { 
            key: "actions", 
            header: "Actions", 
            render: (row) => (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" className="gap-2" onClick={() => setShowGenerateModal(row.indicator_id as number)}>
                  <Wand2 className="h-3 w-3" />
                  Generate
                </Button>
                {row.latest_draft && (
                  <Button size="sm" variant="ghost" className="gap-2" onClick={() => setShowViewModal(row.latest_draft.id as number)}>
                    <FileText className="h-3 w-3" />
                    View
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="gap-2" asChild>
                  <Link href={`/projects/1/worklist?indicator_id=${row.indicator_id}`}>Open Indicator</Link>
                </Button>
              </div>
            )
          },
        ]}
        rows={rows}
        rowKey={(row) => String(row.indicator_id)}
      />

      {showGenerateModal !== null && (
        <GenerateDraftModal
          indicatorId={showGenerateModal}
          open={true}
          onClose={() => setShowGenerateModal(null)}
          onGenerated={() => queueQuery.refetch()}
        />
      )}
      {showViewModal !== null && (
        <ViewDraftModal draftId={showViewModal} open={true} onClose={() => setShowViewModal(null)} />
      )}
    </div>
  );
}