"use client";

import { FormEvent, useState } from "react";

import { PriorityBadge } from "@/components/badges/priority-badge";
import { RecurringBadge } from "@/components/badges/recurring-badge";
import { RiskBadge } from "@/components/badges/risk-badge";
import { StatusBadge } from "@/components/badges/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { MetricCard } from "@/components/common/metric-card";
import { Modal } from "@/components/common/modal";
import { PageHeader } from "@/components/common/page-header";
import { UserPill } from "@/components/common/user-pill";
import { useToast } from "@/components/common/toaster";
import { AssignmentForm } from "@/components/forms/assignment-form";
import { EvidenceForm } from "@/components/forms/evidence-form";
import { EvidenceReviewForm } from "@/components/forms/evidence-review-form";
import { IndicatorActionDialog } from "@/components/forms/indicator-action-dialog";
import { WorkingStateForm } from "@/components/forms/working-state-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useEvidence } from "@/lib/hooks/use-evidence";
import { useAIOutputs, useIndicator } from "@/lib/hooks/use-indicator";
import {
  useAcceptAI,
  useAddEvidence,
  useApproveRecurring,
  useAssignIndicator,
  useEditEvidence,
  useGenerateAI,
  useMarkMet,
  useReopen,
  useReviewEvidence,
  useSendForReview,
  useStartIndicator,
  useSubmitRecurring,
  useUpdateWorkingState,
} from "@/lib/hooks/use-mutations";
import { useProgress } from "@/lib/hooks/use-progress";
import { useAuthSession } from "@/lib/hooks/use-auth";
import {
  AIOutput,
  AIOutputType,
  EvidenceItem,
  RecurringInstance,
  StandardProgress,
} from "@/types";
import { formatDate, formatDateTime, formatEnumLabel } from "@/utils/format";

function formatActorId(value: number | null) {
  return value ? `User #${value}` : "Not set";
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      <div className="pt-4">{children}</div>
    </Card>
  );
}

export function IndicatorDetailScreen({ indicatorId }: { indicatorId: number }) {
  const { pushToast } = useToast();
  const authQuery = useAuthSession();
  const indicatorQuery = useIndicator(indicatorId);
  const evidenceQuery = useEvidence(indicatorId);
  const projectId = indicatorQuery.data?.project ?? NaN;
  const aiOutputsQuery = useAIOutputs(indicatorId);
  const standardsQuery = useProgress(projectId, "standards");
  const addEvidence = useAddEvidence(indicatorId, projectId);
  const editEvidence = useEditEvidence(indicatorId, 0, projectId);
  const reviewEvidence = useReviewEvidence(indicatorId, 0, projectId);
  const assignIndicator = useAssignIndicator(indicatorId, projectId);
  const updateWorkingState = useUpdateWorkingState(indicatorId, projectId);
  const startIndicator = useStartIndicator(indicatorId, projectId);
  const sendForReview = useSendForReview(indicatorId, projectId);
  const markMet = useMarkMet(indicatorId, projectId);
  const reopen = useReopen(indicatorId, projectId);
  const generateAI = useGenerateAI(indicatorId, projectId);

  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<EvidenceItem | null>(null);
  const [reviewingEvidence, setReviewingEvidence] = useState<EvidenceItem | null>(null);
  const [submittingRecurring, setSubmittingRecurring] = useState<RecurringInstance | null>(null);
  const [approvingRecurring, setApprovingRecurring] = useState<RecurringInstance | null>(null);
  const [aiOutputMode, setAiOutputMode] = useState<AIOutputType | null>(null);
  const [aiInstruction, setAiInstruction] = useState("");
  const [acceptingAI, setAcceptingAI] = useState<AIOutput | null>(null);
  const [activeAction, setActiveAction] = useState<"start" | "review" | "met" | "reopen" | null>(null);
  const [recurringEvidenceId, setRecurringEvidenceId] = useState("");
  const [recurringText, setRecurringText] = useState("");
  const [recurringNotes, setRecurringNotes] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  const submitRecurring = useSubmitRecurring(indicatorId, submittingRecurring?.id ?? 0, projectId);
  const approveRecurring = useApproveRecurring(indicatorId, approvingRecurring?.id ?? 0, projectId);
  const acceptAI = useAcceptAI(indicatorId, acceptingAI?.id ?? 0, projectId);

  if (indicatorQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Card className="h-28 animate-pulse bg-slate-100" />
        <Card className="h-64 animate-pulse bg-slate-100" />
        <Card className="h-64 animate-pulse bg-slate-100" />
      </div>
    );
  }

  if (indicatorQuery.error) {
    return <ErrorPanel message={indicatorQuery.error.message} />;
  }

  const indicator = indicatorQuery.data;

  if (!indicator) {
    return <ErrorPanel message="Indicator not found." />;
  }

  const evidenceItems = evidenceQuery.data ?? indicator.evidence_items;
  const aiOutputs = aiOutputsQuery.data ?? indicator.ai_outputs;
  const standards = Array.isArray(standardsQuery.data) ? (standardsQuery.data as StandardProgress[]) : [];
  const currentStandard = standards.find((item) => item.standard_id === indicator.indicator.standard);
  const areaName = currentStandard?.area_name ?? `Area #${indicator.indicator.area}`;
  const standardName = currentStandard?.standard_name ?? `Standard #${indicator.indicator.standard}`;
  const readiness = indicator.readiness_flags;
  const role = authQuery.data?.user?.role;
  const canAssign = role === "ADMIN" || role === "LEAD";
  const canOwnerActions = role === "ADMIN" || role === "LEAD" || role === "OWNER";
  const canReviewerActions = role === "ADMIN" || role === "LEAD" || role === "REVIEWER" || role === "APPROVER";
  const canApproverActions = role === "ADMIN" || role === "LEAD" || role === "APPROVER";
  const canReopen = role === "ADMIN";
  const canAIActions = canOwnerActions;

  async function handleRecurringSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await submitRecurring.mutateAsync({
        evidence_item_id: recurringEvidenceId ? Number(recurringEvidenceId) : null,
        text_content: recurringText,
        notes: recurringNotes,
      });
      pushToast("Recurring instance submitted.", "success");
      setSubmittingRecurring(null);
      setRecurringEvidenceId("");
      setRecurringText("");
      setRecurringNotes("");
      await indicatorQuery.refetch();
      await evidenceQuery.refetch();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function handleRecurringApprove(approval_status: "APPROVED" | "REJECTED") {
    try {
      await approveRecurring.mutateAsync({
        approval_status,
        notes: approveNotes,
      });
      pushToast(`Recurring instance ${approval_status.toLowerCase()}.`, "success");
      setApprovingRecurring(null);
      setApproveNotes("");
      await indicatorQuery.refetch();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function handleGenerateAI() {
    if (!aiOutputMode) {
      return;
    }

    try {
      await generateAI.mutateAsync({
        project_indicator_id: indicatorId,
        output_type: aiOutputMode,
        user_instruction: aiInstruction,
      });
      pushToast("AI output generated.", "success");
      setAiInstruction("");
      setAiOutputMode(null);
      await aiOutputsQuery.refetch();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function handleAcceptAI() {
    try {
      await acceptAI.mutateAsync();
      pushToast("AI output accepted.", "success");
      setAcceptingAI(null);
      await aiOutputsQuery.refetch();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Indicator"
        title={indicator.indicator.code}
        description="Governed indicator command surface. Evidence review is separate from workflow state, and AI output remains advisory until explicitly accepted."
        actions={
          <>
            <StatusBadge status={indicator.current_status} />
            <PriorityBadge priority={indicator.priority} />
            <RecurringBadge
              isRecurring={indicator.indicator.is_recurring}
              frequency={indicator.indicator.recurrence_frequency}
            />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Approved evidence" value={readiness.approved_evidence_count} />
        <MetricCard label="Current evidence" value={readiness.total_current_evidence_count} />
        <MetricCard label="Rejected evidence" value={readiness.rejected_current_evidence_count} />
        <MetricCard label="Minimum required" value={readiness.minimum_required_evidence_count} />
        <MetricCard label="Ready for met" value={readiness.ready_for_met ? "Yes" : "No"} />
      </div>

      <Section
        title="Section 0 — Readiness and Risk"
        description="Computed readiness and risk signals for safe review and inspection decisions."
      >
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge risk={readiness.risk.risk_level} />
          <span className="text-sm text-slate-700">
            Missing evidence: {readiness.missing_evidence_count} • Rejected: {readiness.rejected_evidence_count} •
            Overdue recurring: {readiness.overdue_recurring_count}
          </span>
        </div>
      </Section>

      <Section title="Section 1 — Summary" description="Indicator definition and guidance.">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-sm leading-7 text-slate-800">{indicator.indicator.text}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Area</p>
                <p className="mt-1 text-sm text-slate-800">{areaName}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Standard</p>
                <p className="mt-1 text-sm text-slate-800">{standardName}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Guidance</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {indicator.indicator.fulfillment_guidance || "No fulfillment guidance recorded."}
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Section 2 — Operational State"
        description="Assignments, working notes, review roles, and command-safe field updates."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-950">Current state</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Owner</p>
                <div className="mt-2">
                  <UserPill user={indicator.owner} />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Reviewer</p>
                <div className="mt-2">
                  <UserPill user={indicator.reviewer} />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Approver</p>
                <div className="mt-2">
                  <UserPill user={indicator.approver} />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Due date</p>
                <p className="mt-2 text-sm text-slate-800">{formatDate(indicator.due_date)}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Notes</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {indicator.notes || "No working notes recorded."}
              </p>
            </div>
          </Card>

          <Card className="border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-950">Assignment and working controls</h3>
            <div className="mt-4 grid gap-6">
              <AssignmentForm
                indicator={indicator}
                loading={assignIndicator.isPending || !canAssign}
                onSubmit={(payload) => {
                  if (!canAssign) {
                    pushToast("You are not allowed to update assignments.", "error");
                    return Promise.resolve();
                  }
                  return assignIndicator.mutateAsync(payload);
                }}
              />
              <div className="border-t border-slate-200 pt-6">
                <WorkingStateForm
                  indicator={indicator}
                  loading={updateWorkingState.isPending || !canOwnerActions}
                  onSubmit={(payload) => {
                    if (!canOwnerActions) {
                      pushToast("You are not allowed to update working state.", "error");
                      return Promise.resolve();
                    }
                    return updateWorkingState.mutateAsync(payload);
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section
        title="Section 3 — Evidence Panel"
        description="Current evidence versions, review state, and add/edit/review controls."
      >
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowAddEvidence(true)}>Add evidence</Button>
        </div>

        {evidenceItems.length ? (
          <div className="grid gap-4">
            {evidenceItems.map((item) => (
              <Card key={item.id} className="border-slate-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
                      <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                        {item.source_type}
                      </span>
                      {item.is_current ? (
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                          Current version
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-700">
                      Uploaded {formatDateTime(item.uploaded_at)} • {formatActorId(item.uploaded_by)}
                    </p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Validity
                        </p>
                        <p className="mt-1 text-sm text-slate-800">{formatEnumLabel(item.validity_status)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Completeness
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                          {formatEnumLabel(item.completeness_status)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Approval state
                        </p>
                        <p className="mt-1 text-sm text-slate-800">{formatEnumLabel(item.approval_status)}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Reviewer
                        </p>
                        <p className="mt-1 text-sm text-slate-800">{formatActorId(item.reviewed_by)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Notes
                        </p>
                        <p className="mt-1 text-sm text-slate-800">{item.notes || "No notes."}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Physical location
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                          {item.physical_location_type || "Not specified"}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {item.location_details || "No location details."}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          File label / physical copy
                        </p>
                        <p className="mt-1 text-sm text-slate-800">{item.file_label || "Not set"}</p>
                        <p className="mt-1 text-sm text-slate-700">
                          {item.is_physical_copy_available ? "Available" : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingEvidence(item)}
                      disabled={!canOwnerActions}
                    >
                      Edit evidence
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setReviewingEvidence(item)}
                      disabled={!canReviewerActions}
                    >
                      Review evidence
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No evidence recorded"
            description="Add evidence before sending the indicator into review."
          />
        )}
      </Section>

      {indicator.recurring_requirement ? (
        <Section
          title="Section 4 — Recurring Panel"
          description="Recurring obligation details, due instances, and instance-level submit/approve commands."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
            <Card className="border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-950">Recurring rule</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>Frequency: {formatEnumLabel(indicator.recurring_requirement.frequency)}</p>
                <p>Mode: {formatEnumLabel(indicator.recurring_requirement.mode)}</p>
                <p>Start date: {formatDate(indicator.recurring_requirement.start_date)}</p>
                <p>Instructions: {indicator.recurring_requirement.instructions || "No instructions recorded."}</p>
              </div>
            </Card>
            <div className="grid gap-3">
              {indicator.recurring_instances.map((instance) => (
                <Card key={instance.id} className="border-slate-200 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-950">{instance.period_label}</p>
                      <p className="text-sm text-slate-700">
                        Due {formatDate(instance.due_date)} • Status {formatEnumLabel(instance.status)}
                      </p>
                      <p className="text-sm text-slate-700">
                        Linked evidence: {instance.linked_evidence_title || "Not linked"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSubmittingRecurring(instance)}
                        disabled={!canOwnerActions}
                      >
                        Submit instance
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setApprovingRecurring(instance)}
                        disabled={!canReviewerActions}
                      >
                        Approve instance
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      <Section
        title="Section 5 — AI Panel"
        description="AI-generated guidance, drafts, and assessments. These are advisory only until manually accepted."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => setAiOutputMode("GUIDANCE")}
            disabled={!canAIActions}
          >
            Generate guidance
          </Button>
          <Button
            variant="secondary"
            onClick={() => setAiOutputMode("DRAFT")}
            disabled={!canAIActions}
          >
            Generate draft
          </Button>
          <Button
            variant="secondary"
            onClick={() => setAiOutputMode("ASSESSMENT")}
            disabled={!canAIActions}
          >
            Generate assessment
          </Button>
        </div>

        {aiOutputs.length ? (
          <div className="grid gap-4">
            {aiOutputs.map((output) => (
              <Card key={output.id} className="border-slate-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-sky-300 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-900">
                        AI-generated
                      </span>
                      <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                        {formatEnumLabel(output.output_type)}
                      </span>
                      {output.accepted ? (
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                          Accepted
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-600">
                      Model {output.model_name} • Created {formatDateTime(output.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{output.content}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setAcceptingAI(output)}
                      disabled={output.accepted || !canAIActions}
                    >
                      Accept output
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No AI outputs recorded"
            description="Generate advisory guidance, draft text, or an assessment when manual assistance is needed."
          />
        )}
      </Section>

      <Section
        title="Section 6 — Actions Toolbar"
        description="Workflow commands only. Indicator state does not change through direct field editing."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setActiveAction("start")}
            loading={startIndicator.isPending}
            disabled={!canOwnerActions}
          >
            Start
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveAction("review")}
            loading={sendForReview.isPending}
            disabled={!canOwnerActions}
          >
            Send for Review
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveAction("met")}
            loading={markMet.isPending}
            disabled={!canApproverActions || !readiness.ready_for_met}
          >
            Mark as Met
          </Button>
          <Button
            variant="danger"
            onClick={() => setActiveAction("reopen")}
            loading={reopen.isPending}
            disabled={!canReopen}
          >
            Reopen
          </Button>
        </div>
      </Section>

      <Section
        title="Section 7 — Governance trail"
        description="Status transition history and recent audited actions for override and decision traceability."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-950">Status transition history</h3>
            {indicator.status_history.length ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {indicator.status_history.map((entry) => (
                  <li key={entry.id} className="rounded border border-slate-200 bg-slate-50 p-2">
                    <p className="font-medium text-slate-900">
                      {formatEnumLabel(entry.from_status)} → {formatEnumLabel(entry.to_status)}
                    </p>
                    <p>
                      {formatDateTime(entry.timestamp)} • {entry.actor ? entry.actor.username : "System"}
                    </p>
                    <p>Reason: {entry.reason || "No reason recorded."}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No status transitions yet"
                description="Workflow transition events will appear once command actions are performed."
              />
            )}
          </Card>

          <Card className="border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-950">Recent audited actions</h3>
            {indicator.audit_summary.length ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {indicator.audit_summary.map((event) => (
                  <li key={event.id} className="rounded border border-slate-200 bg-slate-50 p-2">
                    <p className="font-medium text-slate-900">{event.event_type}</p>
                    <p>
                      {formatDateTime(event.timestamp)} • {event.actor ? event.actor.username : "System"}
                    </p>
                    <p>Reason: {event.reason || "No reason recorded."}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No audit events yet"
                description="Audit rows will appear when evidence, workflow, recurring, or AI actions are performed."
              />
            )}
          </Card>
        </div>
      </Section>

      <Modal
        open={showAddEvidence}
        title="Add evidence"
        description="Record a new evidence item for this indicator."
        onClose={() => setShowAddEvidence(false)}
      >
        <EvidenceForm
          indicatorId={indicatorId}
          submitLabel="Add evidence"
          loading={addEvidence.isPending || !canOwnerActions}
          onSubmit={(payload) => addEvidence.mutateAsync(payload as never)}
          onSuccess={() => setShowAddEvidence(false)}
        />
      </Modal>

      <Modal
        open={Boolean(editingEvidence)}
        title="Edit evidence"
        description="Update evidence metadata without changing indicator workflow state."
        onClose={() => setEditingEvidence(null)}
      >
        {editingEvidence ? (
          <EvidenceForm
            indicatorId={indicatorId}
            initialValue={editingEvidence}
            submitLabel="Save evidence"
            loading={editEvidence.isPending || !canOwnerActions}
            onSubmit={(payload) =>
              editEvidence.mutateAsync({
                evidenceId: editingEvidence.id,
                payload: payload as never,
              })
            }
            onSuccess={() => setEditingEvidence(null)}
          />
        ) : null}
      </Modal>

      <Modal
        open={Boolean(reviewingEvidence)}
        title="Review evidence"
        description="Validity, completeness, and approval are reviewed separately from indicator workflow state."
        onClose={() => setReviewingEvidence(null)}
      >
        {reviewingEvidence ? (
          <EvidenceReviewForm
            evidence={reviewingEvidence}
            loading={reviewEvidence.isPending || !canReviewerActions}
            onSubmit={(payload) =>
              reviewEvidence.mutateAsync({
                evidenceId: reviewingEvidence.id,
                payload,
              })
            }
            onSuccess={() => setReviewingEvidence(null)}
          />
        ) : null}
      </Modal>

      <Modal
        open={Boolean(submittingRecurring)}
        title="Submit recurring instance"
        description="Attach evidence or text for this recurring requirement instance."
        onClose={() => setSubmittingRecurring(null)}
      >
        <form className="space-y-4" onSubmit={handleRecurringSubmit}>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Evidence item ID</span>
            <Input
              value={recurringEvidenceId}
              onChange={(event) => setRecurringEvidenceId(event.target.value)}
              inputMode="numeric"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Submission text</span>
            <Textarea value={recurringText} onChange={(event) => setRecurringText(event.target.value)} />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Notes</span>
            <Textarea value={recurringNotes} onChange={(event) => setRecurringNotes(event.target.value)} />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setSubmittingRecurring(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitRecurring.isPending}>
              Submit instance
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(approvingRecurring)}
        title="Approve recurring instance"
        description="Approve or reject the recurring evidence submission."
        onClose={() => setApprovingRecurring(null)}
      >
        <div className="space-y-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Notes</span>
            <Textarea value={approveNotes} onChange={(event) => setApproveNotes(event.target.value)} />
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => handleRecurringApprove("APPROVED")}
              loading={approveRecurring.isPending}
              disabled={!canReviewerActions}
            >
              Approve instance
            </Button>
            <Button
              variant="danger"
              onClick={() => handleRecurringApprove("REJECTED")}
              loading={approveRecurring.isPending}
              disabled={!canReviewerActions}
            >
              Reject instance
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(aiOutputMode)}
        title={`Generate ${aiOutputMode ? formatEnumLabel(aiOutputMode) : "AI output"}`}
        description="AI remains advisory only. Review content before accepting it into the operator workflow."
        onClose={() => setAiOutputMode(null)}
      >
        <div className="space-y-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Operator instruction</span>
            <Textarea
              value={aiInstruction}
              onChange={(event) => setAiInstruction(event.target.value)}
              placeholder="Optional instruction to steer the AI output."
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAiOutputMode(null)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateAI} loading={generateAI.isPending} disabled={!canAIActions}>
              Generate
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(acceptingAI)}
        title="Accept AI output"
        description="This records manual acceptance of an AI-generated output. It does not change indicator workflow state."
        onClose={() => setAcceptingAI(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Accept the selected AI output for operator use?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAcceptingAI(null)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptAI} loading={acceptAI.isPending} disabled={!canAIActions}>
              Accept output
            </Button>
          </div>
        </div>
      </Modal>

      <IndicatorActionDialog
        open={activeAction === "start"}
        title="Start indicator"
        description="Move the indicator into active work."
        confirmLabel="Start"
        loading={startIndicator.isPending}
        onClose={() => setActiveAction(null)}
        onConfirm={(reason) => {
          if (!canOwnerActions) {
            return Promise.resolve();
          }
          return startIndicator.mutateAsync({ reason });
        }}
      />

      <IndicatorActionDialog
        open={activeAction === "review"}
        title="Send for review"
        description="Move the indicator into review once working notes or evidence are present."
        confirmLabel="Send for review"
        loading={sendForReview.isPending}
        onClose={() => setActiveAction(null)}
        onConfirm={(reason) => {
          if (!canOwnerActions) {
            return Promise.resolve();
          }
          return sendForReview.mutateAsync({ reason });
        }}
      />

      <IndicatorActionDialog
        open={activeAction === "met"}
        title="Mark as met"
        description="Mark the indicator as met when readiness conditions are satisfied."
        confirmLabel="Mark as met"
        loading={markMet.isPending}
        onClose={() => setActiveAction(null)}
        onConfirm={(reason) => {
          if (!canApproverActions || !readiness.ready_for_met) {
            return Promise.resolve();
          }
          return markMet.mutateAsync({ reason });
        }}
      />

      <IndicatorActionDialog
        open={activeAction === "reopen"}
        title="Reopen indicator"
        description="Reopening requires an explicit reason and returns the indicator to in-progress."
        confirmLabel="Reopen"
        reasonRequired
        loading={reopen.isPending}
        onClose={() => setActiveAction(null)}
        onConfirm={(reason) => {
          if (!canReopen) {
            return Promise.resolve();
          }
          return reopen.mutateAsync({ reason });
        }}
      />
    </div>
  );
}
