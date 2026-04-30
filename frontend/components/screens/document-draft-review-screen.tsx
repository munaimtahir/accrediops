"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SettingsPageHeader } from "@/components/common/settings-page-header";
import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSafeErrorMessage } from "@/lib/api/client";
import {
  useAdminProjects,
  useProjectIndicatorsForProject,
} from "@/lib/hooks/use-projects";
import {
  usePromoteDocumentDraftToEvidence,
  useRetrieveDocumentDraft,
  useUpdateDocumentDraft,
} from "@/lib/hooks/use-admin";
import { Dialog } from "@headlessui/react";
import { Check, Clipboard, Save } from "lucide-react";
import { DocumentTypeChoices, EvidenceTypeChoices } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { ProjectIndicatorSummary } from "@/types";


function PromoteToEvidenceModal({ draft, open, onClose }: { draft: any; open: boolean; onClose: () => void }) {
  const { pushToast } = useToast();
  const promoteDraft = usePromoteDocumentDraftToEvidence(draft.id);
  const projectsQuery = useAdminProjects();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      project_id: draft.project?.toString() || "",
      project_indicator_id: draft.project_indicator?.toString() || "",
      evidence_title: draft.title,
      evidence_type: draft.document_type,
      document_type: draft.document_type,
      final_filename: "",
      notes: "",
      confirm_promotion: false,
    },
  });

  const selectedProjectId = watch("project_id");
  const projectIndicatorsQuery = useProjectIndicatorsForProject(Number(selectedProjectId));
  const projectIndicators = projectIndicatorsQuery.data ?? [];


  async function onSubmit(data: any) {
    try {
      await promoteDraft.mutateAsync({
        project_id: Number(data.project_id),
        project_indicator_id: Number(data.project_indicator_id),
        evidence_title: data.evidence_title,
        evidence_type: data.evidence_type,
        document_type: data.document_type,
        final_filename: data.final_filename,
        notes: data.notes,
      });
      pushToast("Draft promoted to evidence successfully.", "success");
      router.push(`/projects/${data.project_id}/worklist?indicator_id=${data.project_indicator_id}`);
      onClose();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  if (projectsQuery.isLoading) return <LoadingSkeleton className="h-40 w-full" />;

  return (
    <Modal open={open} onClose={onClose} title="Promote Draft to Evidence" description="Create a new evidence record from this document draft.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Project</span>
          <Select {...register("project_id", { required: true })}>
            <option value="">Select a project</option>
            {projectsQuery.data?.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          {errors.project_id && <span className="text-rose-500 text-xs">Project is required</span>}
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Project Indicator</span>
          <Select {...register("project_indicator_id", { required: true })} disabled={!selectedProjectId}>
            <option value="">Select an indicator</option>
            {projectIndicators.map((pi: ProjectIndicatorSummary) => (
              <option key={pi.id} value={pi.id}>
                {pi.indicator_code} - {pi.indicator_text.substring(0, 50)}...
              </option>
            ))}
          </Select>
          {errors.project_indicator_id && <span className="text-rose-500 text-xs">Project Indicator is required</span>}
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Evidence Title</span>
          <Input {...register("evidence_title", { required: true })} />
          {errors.evidence_title && <span className="text-rose-500 text-xs">Evidence Title is required</span>}
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Evidence Type</span>
            <Select {...register("evidence_type", { required: true })}>
              <option value="">Select type</option>
              {Object.entries(EvidenceTypeChoices).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>
            {errors.evidence_type && <span className="text-rose-500 text-xs">Evidence Type is required</span>}
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Document Type</span>
            <Select {...register("document_type", { required: true })}>
              <option value="">Select type</option>
              {Object.entries(DocumentTypeChoices).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Select>
            {errors.document_type && <span className="text-rose-500 text-xs">Document Type is required</span>}
          </label>
        </div>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Final Filename (optional)</span>
          <Input {...register("final_filename")} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Notes (optional)</span>
          <Textarea {...register("notes")} rows={3} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("confirm_promotion", { required: true })} />
          <span className="font-medium text-slate-700">I have reviewed this AI-assisted draft and want to promote it as project evidence draft.</span>
          {errors.confirm_promotion && <span className="text-rose-500 text-xs">Confirmation is required</span>}
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={promoteDraft.isPending}>Promote to Evidence</Button>
        </div>
      </form>
    </Modal>
  );
}


export function DocumentDraftReviewScreen({ draftId }: { draftId: number }) {
  const { pushToast } = useToast();
  const draftQuery = useRetrieveDocumentDraft(draftId);
  const updateDraft = useUpdateDocumentDraft(draftId);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  const canEdit = true;
  const canPromote = true;

  useMemo(() => {
    if (draftQuery.data) {
      setEditedTitle(draftQuery.data.title as string);
      setEditedContent(draftQuery.data.draft_content as string);
    }
  }, [draftQuery.data]);

  if (draftQuery.isLoading) return <LoadingSkeleton className="h-40 w-full" />;
  if (draftQuery.error) return <ErrorPanel message={draftQuery.error.message} />;

  const draft = draftQuery.data as any;

  async function handleSave() {
    try {
      await updateDraft.mutateAsync({
        title: editedTitle,
        draft_content: editedContent,
        review_status: "HUMAN_REVIEWED",
      });
      pushToast("Draft saved and marked as reviewed.", "success");
      setIsEditing(false);
      draftQuery.refetch();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function handleMarkReviewed() {
    try {
      await updateDraft.mutateAsync({ review_status: "HUMAN_REVIEWED" });
      pushToast("Draft marked as human reviewed.", "success");
      draftQuery.refetch();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }
  
  function handleCopyToClipboard() {
    navigator.clipboard.writeText(editedContent);
    pushToast("Draft content copied to clipboard.", "success");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <SettingsPageHeader
        title={draft.title}
        description={`v${draft.version} | Status: ${draft.review_status} | Generated: ${String(draft.generated_at).slice(0, 10)} by ${draft.generated_by_username}`}
        actions={
          <div className="flex gap-2">
            {canEdit && (
              <Button onClick={() => setIsEditing(!isEditing)} variant="secondary">
                {isEditing ? "Cancel Edit" : "Edit Draft"}
              </Button>
            )}
            {canEdit && isEditing && (
              <Button onClick={handleSave} loading={updateDraft.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
            {canEdit && !isEditing && draft.review_status !== "HUMAN_REVIEWED" && (
                <Button onClick={handleMarkReviewed} loading={updateDraft.isPending} variant="secondary">
                    <Check className="h-4 w-4 mr-2" /> Mark Reviewed
                </Button>
            )}
            <Button onClick={handleCopyToClipboard} variant="ghost" size="sm">
                <Clipboard className="h-4 w-4 mr-2" /> Copy
            </Button>
            {canPromote && (
              <Button onClick={() => setShowPromoteModal(true)} disabled={draft.review_status === "PROMOTED_TO_EVIDENCE"}>
                Promote to Evidence
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 grid lg:grid-cols-2 gap-4 mt-4 overflow-hidden">
        <div className="overflow-y-auto pr-2 space-y-4">
          <Card className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 border-b pb-2">Indicator Requirement</h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Requirement</label>
                <p className="mt-1 text-slate-900 leading-relaxed">{draft.indicator_text}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Required Evidence</label>
                <p className="mt-1 text-slate-900">{draft.required_evidence_description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Document Type</label>
                  <p className="mt-1 text-slate-900">{draft.document_type}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">AI Support</label>
                  <p className="mt-1 text-indigo-700 font-semibold">{draft.ai_assistance_level}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 border-b pb-2">Contextual Guidance</h3>
            <div className="text-sm prose prose-slate prose-sm max-w-none">
                {draft.fulfillment_guidance || "No specific guidance provided for this indicator."}
            </div>
          </Card>
        </div>

        <Card className="flex flex-col overflow-hidden border-2 border-slate-200">
          <div className="p-3 bg-slate-50 border-b flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Document Draft Content</h3>
            <div className="text-[10px] font-mono text-slate-500">PROVIDER: {draft.provider} | MODEL: {draft.model}</div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {isEditing ? (
              <Textarea 
                value={editedContent} 
                onChange={(e) => setEditedContent(e.target.value)} 
                className="h-full font-mono text-xs leading-relaxed" 
                placeholder="Draft content..."
              />
            ) : (
              <div className="prose prose-slate max-w-none leading-relaxed whitespace-pre-wrap font-serif text-slate-800">
                {editedContent}
              </div>
            )}
          </div>
        </Card>
      </div>

      {draft && showPromoteModal && (
        <PromoteToEvidenceModal draft={draft} open={showPromoteModal} onClose={() => setShowPromoteModal(false)} />
      )}
    </div>
  );
}
