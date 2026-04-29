"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, useMemo } from "react";

import { PriorityBadge } from "@/components/badges/priority-badge";
import { RecurringBadge } from "@/components/badges/recurring-badge";
import { RiskBadge } from "@/components/badges/risk-badge";
import { StatusBadge } from "@/components/badges/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { MetricCard } from "@/components/common/metric-card";
import { Modal } from "@/components/common/modal";
import { NextActionBanner } from "@/components/common/next-action-banner";
import { OnboardingCallout } from "@/components/common/onboarding-callout";
import { PermissionHint } from "@/components/common/permission-hint";
import { PageHeader } from "@/components/common/page-header";
import { StatusSemanticBadge } from "@/components/common/status-semantic-badge";
import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
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
import { getEvidenceApprovalTone, getRecurringStatusTone } from "@/utils/status-semantics";

type IndicatorPanel =
  | "readiness"
  | "summary"
  | "requiredEvidence"
  | "actions"
  | "evidence"
  | "recurring"
  | "ai"
  | "governance";

function formatActorId(value: number | null) {
  return value ? `User #${value}` : "Not set";
}

function parseIndicatorPanel(value: string | null): IndicatorPanel | null {
  if (
    value === "readiness" ||
    value === "summary" ||
    value === "requiredEvidence" ||
    value === "actions" ||
    value === "evidence" ||
    value === "recurring" ||
    value === "ai" ||
    value === "governance"
  ) {
    return value;
  }
  return null;
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
  const searchParams = useSearchParams();
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
  const [activePanel, setActivePanel] = useState<IndicatorPanel>("readiness");
  const [recurringEvidenceId, setRecurringEvidenceId] = useState("");
  const [recurringText, setRecurringText] = useState("");
  const [recurringNotes, setRecurringNotes] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  const submitRecurring = useSubmitRecurring(indicatorId, submittingRecurring?.id ?? 0, projectId);
  const approveRecurring = useApproveRecurring(indicatorId, approvingRecurring?.id ?? 0, projectId);
  const acceptAI = useAcceptAI(indicatorId, acceptingAI?.id ?? 0, projectId);

  useEffect(() => {
    const requestedPanel = parseIndicatorPanel(searchParams.get("panel"));
    if (requestedPanel) {
      setActivePanel(requestedPanel);
    }
  }, [searchParams]);

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

  const standardsMap = useMemo(() => {
    const map = new Map<number, StandardProgress>();
    for (const standard of standards) {
      map.set(standard.standard_id, standard);
    }
    return map;
  }, [standards]);

  const currentStandard = standardsMap.get(indicator.indicator.standard);
  const areaName = currentStandard?.area_name ?? `Area #${indicator.indicator.area}`;
  const standardName = currentStandard?.standard_name ?? `Standard #${indicator.indicator.standard}`;
  const readiness = indicator.readiness_flags;
  const role = authQuery.data?.user?.role;
  const capabilities = indicator.capabilities;
  const canAssign = capabilities.can_assign;
  const canUpdateWorkingState = capabilities.can_update_working_state;
  const canAddEvidence = capabilities.can_add_evidence;
  const canEditEvidence = capabilities.can_edit_evidence;
  const canReviewEvidence = capabilities.can_review_evidence;
  const canSubmitRecurring = capabilities.can_submit_recurring;
  const canApproveRecurring = capabilities.can_approve_recurring;
  const canStart = capabilities.can_start;
  const canSendForReview = capabilities.can_send_for_review;
  const canMarkMet = capabilities.can_mark_met;
  const canReopen = capabilities.can_reopen;
  const canAIActions = capabilities.can_generate_ai;
  const canAcceptAI = capabilities.can_accept_ai;
  const hasProjectContext = Number.isFinite(projectId);
  const nextStepMessage =
    indicator.current_status === "NOT_STARTED"
      ? "Start the indicator, then add evidence."
      : indicator.current_status === "IN_PROGRESS"
        ? readiness.ready_for_met
          ? "Indicator is ready for final approval and mark as met."
          : "Add/review evidence, then send for review."
        : indicator.current_status === "UNDER_REVIEW"
          ? readiness.ready_for_met
            ? "Approver can mark this indicator as met."
            : "Resolve readiness blockers before marking met."
          : indicator.current_status === "MET"
            ? "No action"
            : "Resolve blockers before continuing workflow.";
  const nextActionReason =
    indicator.current_status === "MET"
      ? "Indicator is already completed. Use Reopen only when a governance override is required."
      : undefined;
  const readinessStatusTone =
    readiness.ready_for_met
      ? "green"
      : indicator.current_status === "UNDER_REVIEW"
        ? "blue"
        : readiness.rejected_current_evidence_count > 0 || readiness.missing_evidence_count > 0
          ? "red"
          : "yellow";
  const panelLabels: Array<{ key: IndicatorPanel; label: string }> = [
    { key: "readiness", label: "Readiness status" },
    { key: "summary", label: "Summary" },
    { key: "requiredEvidence", label: "Required evidence" },
    { key: "actions", label: "Actions" },
    { key: "evidence", label: "Evidence" },
    { key: "recurring", label: "Recurring" },
    { key: "ai", label: "AI / Assist" },
    { key: "governance", label: "Governance / Override" },
  ];
  const activePanelLabel = panelLabels.find((item) => item.key === activePanel)?.label ?? "Readiness";
  const actionBlockers = [
    !canStart && !canSendForReview ? "Permission restriction: owner workflow actions require the assigned OWNER, or LEAD/ADMIN." : "",
    !canMarkMet ? "Permission restriction: approval requires the assigned APPROVER, or LEAD/ADMIN." : "",
    readiness.missing_evidence_count > 0 ? `Missing evidence: ${readiness.missing_evidence_count} required item(s) still missing.` : "",
    readiness.rejected_evidence_count > 0 ? `Not reviewed cleanly: ${readiness.rejected_evidence_count} evidence item(s) are rejected.` : "",
    readiness.overdue_recurring_count > 0 ? `Recurring compliance is incomplete: ${readiness.overdue_recurring_count} overdue recurring item(s) remain.` : "",
  ].filter(Boolean);
  const indicatorStatusSummary = `${formatEnumLabel(indicator.current_status)} • Approved evidence ${readiness.approved_evidence_count}/${readiness.minimum_required_evidence_count} • Risk ${readiness.risk.risk_level}`;
  const indicatorReason =
    nextActionReason ??
    (readiness.ready_for_met
      ? "All readiness conditions are satisfied for governed approval."
      : "The indicator still has unresolved workflow or evidence conditions.");

  async function handleRecurringSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitRecurring) {
      pushToast("You are not allowed to submit recurring work for this indicator.", "error");
      return;
    }

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
    if (!canApproveRecurring) {
      pushToast("You are not allowed to approve recurring work for this indicator.", "error");
      return;
    }
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
    if (!canAIActions) {
      pushToast("You are not allowed to generate AI output for this indicator.", "error");
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
    if (!canAcceptAI) {
      pushToast("You are not allowed to accept AI output for this indicator.", "error");
      return;
    }
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

      <NextActionBanner
        action={nextStepMessage}
        reason={indicatorReason}
        status={indicatorStatusSummary}
        blockers={actionBlockers}
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusSemanticBadge tone={readinessStatusTone} />
      </div>

      <OnboardingCallout
        storageKey={`indicator-detail-${indicatorId}-${role ?? "unknown"}`}
        title="Indicator flow map"
        description="Work left to right: verify readiness, update operations/evidence, run commands, then confirm the governance trail."
      />

      <div className="sticky top-3 z-10 rounded-xl border border-indigo-200 bg-indigo-50/95 p-4 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-indigo-700">Session orientation</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-indigo-900">
          <span className="font-semibold">Current section: {activePanelLabel}</span>
          <span>•</span>
          <span>Indicator: {indicator.indicator.code}</span>
          {hasProjectContext ? (
            <>
              <span>•</span>
              <Link
                className="underline underline-offset-2"
                href={`/projects/${projectId}/worklist`}
              >
                Back to project worklist
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <WorkflowContextStrip
        scope={`Project ${projectId} · Indicator ${indicator.indicator.code}`}
        current={`Working in ${activePanelLabel}.`}
        nextStep={nextStepMessage}
        noActionReason={nextActionReason}
        roleHint="Workflow state changes are command-driven. Evidence review and AI acceptance do not directly mutate indicator status."
        actions={
          hasProjectContext
            ? [
                { label: "Back to project", href: `/projects/${projectId}` },
                { label: "Back to worklist", href: `/projects/${projectId}/worklist` },
                { label: "Open recurring queue", href: `/projects/${projectId}/recurring` },
              ]
            : []
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Indicator sections</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {panelLabels.map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={activePanel === item.key ? "default" : "secondary"}
              onClick={() => setActivePanel(item.key as IndicatorPanel)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <PermissionHint allowed={canStart || canSendForReview || canAddEvidence || canAIActions}>
        You currently have limited action permissions on this indicator. Action controls are now aligned to assigned-owner, reviewer, approver, and admin governance rules.
      </PermissionHint>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Approved evidence" value={readiness.approved_evidence_count} />
        <MetricCard label="Current evidence" value={readiness.total_current_evidence_count} />
        <MetricCard label="Rejected evidence" value={readiness.rejected_current_evidence_count} />
        <MetricCard label="Minimum required" value={readiness.minimum_required_evidence_count} />
        <MetricCard label="Ready for met" value={readiness.ready_for_met ? "Yes" : "No"} />
      </div>

      {activePanel === "readiness" ? (
        <Section
          title="Section 1 — Readiness"
          description="Computed readiness and risk signals for safe review and inspection decisions."
        >
          <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Current status: <span className="font-semibold">{formatEnumLabel(indicator.current_status)}</span> •
            Allowed actions: Review readiness and risk before workflow commands.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge risk={readiness.risk.risk_level} />
            <span className="text-sm text-slate-700">
              Missing evidence: {readiness.missing_evidence_count} • Rejected: {readiness.rejected_evidence_count} •
              Overdue recurring: {readiness.overdue_recurring_count}
            </span>
          </div>
        </Section>
      ) : null}

      {activePanel === "summary" ? (
        <Section title="Section 2 — Summary" description="Indicator definition and guidance.">
          <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Current status: <span className="font-semibold">{formatEnumLabel(indicator.current_status)}</span> •
            Allowed actions: Review indicator definition and assignment context.
          </div>
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
      ) : null}

      {activePanel === "summary" ? (
        <Section
          title="Summary — Operational context"
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
              <PermissionHint allowed={canAssign} className="mt-3">
                Assignment updates require LEAD or ADMIN role.
              </PermissionHint>
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
                  <PermissionHint allowed={canUpdateWorkingState} className="mb-3">
                    Working state updates require the assigned OWNER, or LEAD/ADMIN.
                  </PermissionHint>
                  <WorkingStateForm
                    indicator={indicator}
                    loading={updateWorkingState.isPending || !canUpdateWorkingState}
                    onSubmit={(payload) => {
                      if (!canUpdateWorkingState) {
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
      ) : null}

      {activePanel === "requiredEvidence" ? (
        <Section
          title="Section 3 — Required evidence"
          description="Checklist of minimum evidence and approval conditions required for final completion."
        >
          <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Current status: <span className="font-semibold">{formatEnumLabel(indicator.current_status)}</span> •
            Allowed actions: Validate checklist completion, then move to primary actions.
          </div>
          <div className="grid gap-3">
            <Card className="border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Readiness checklist</p>
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>
                    Minimum approved evidence ({readiness.minimum_required_evidence_count}) available
                    <span className="ml-1 text-xs text-slate-500">
                      ({readiness.approved_evidence_count} approved / {readiness.total_current_evidence_count} current)
                    </span>
                  </span>
                  <StatusSemanticBadge tone={readiness.has_minimum_required_evidence ? "green" : "red"} />
                </li>
                <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>All current evidence approved</span>
                  <StatusSemanticBadge tone={readiness.all_current_evidence_approved ? "green" : "yellow"} />
                </li>
                <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>No rejected current evidence</span>
                  <StatusSemanticBadge tone={readiness.no_rejected_current_evidence ? "green" : "red"} />
                </li>
                <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Recurring obligations clear</span>
                  <StatusSemanticBadge
                    tone={indicator.recurring_requirement ? (readiness.recurring_requirements_clear ? "green" : "red") : "grey"}
                  />
                </li>
                <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="font-semibold">Ready for approval / mark met</span>
                  <StatusSemanticBadge tone={readiness.ready_for_met ? "green" : "yellow"} />
                </li>
              </ul>
            </Card>
            <Card className="border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Evidence requirement definition</p>
              <p className="mt-2 text-sm text-slate-700">
                {indicator.indicator.required_evidence_description || "No required evidence description configured."}
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Evidence type:</span> {indicator.indicator.evidence_type}
                </p>
                <p>
                  <span className="font-semibold">Document type:</span> {indicator.indicator.document_type}
                </p>
                <p>
                  <span className="font-semibold">Reuse policy:</span> {formatEnumLabel(indicator.indicator.evidence_reuse_policy)}
                </p>
              </div>
            </Card>
          </div>
        </Section>
      ) : null}

      {activePanel === "actions" ? (
        <Section
          title="Section 4 — Actions (Primary)"
          description="Workflow commands only. Indicator state does not change through direct field editing."
        >
          <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Current status: <span className="font-semibold">{formatEnumLabel(indicator.current_status)}</span> •
            Allowed actions: Start, Send for Review, Mark as Met, Reopen (role/readiness gated).
          </div>
          <PermissionHint allowed={canStart || canSendForReview} className="mb-4">
            Start and Send for Review require the assigned OWNER, or LEAD/ADMIN.
          </PermissionHint>
          <PermissionHint allowed={canMarkMet} className="mb-4">
            Mark as Met requires the assigned APPROVER, or LEAD/ADMIN, and readiness to be complete.
          </PermissionHint>
          <PermissionHint allowed={canReopen} className="mb-4">
            Reopen is an ADMIN-only governance override.
          </PermissionHint>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setActiveAction("start")}
              loading={startIndicator.isPending}
              disabled={!canStart}
              title={canStart ? "Move indicator into active work" : "Requires the assigned OWNER, or LEAD/ADMIN."}
            >
              Start
            </Button>
            <Button
              variant="secondary"
              onClick={() => setActiveAction("review")}
              loading={sendForReview.isPending}
              disabled={!canSendForReview}
              title={canSendForReview ? "Submit indicator for review" : "Requires the assigned OWNER, or LEAD/ADMIN."}
            >
              Send for Review
            </Button>
            <Button
              variant="secondary"
              onClick={() => setActiveAction("met")}
              loading={markMet.isPending}
              disabled={!canMarkMet || !readiness.ready_for_met}
              title={
                !canMarkMet
                  ? "Requires the assigned APPROVER, or LEAD/ADMIN."
                  : !readiness.ready_for_met
                    ? "Indicator is not ready to be marked MET yet."
                    : "Mark indicator as MET."
              }
            >
              Approve (Mark as Met)
            </Button>
            <Button
              variant="danger"
              onClick={() => setActiveAction("reopen")}
              loading={reopen.isPending}
              disabled={!canReopen}
              title={canReopen ? "Admin governance override to reopen indicator" : "Only ADMIN can reopen indicators."}
            >
              Reopen
            </Button>
          </div>
        </Section>
      ) : null}

      {activePanel === "evidence" ? (
        <Section
          title="Section 5 — Evidence"
          description="Current evidence versions, review state, and add/edit/review controls."
        >
          <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Current status: <span className="font-semibold">{formatEnumLabel(indicator.current_status)}</span> •
            Allowed actions: Add/Edit evidence and perform evidence review (role-gated).
          </div>
          <PermissionHint allowed={canAddEvidence || canEditEvidence} className="mb-4">
            Adding or editing evidence requires the assigned OWNER, or LEAD/ADMIN.
          </PermissionHint>
          <PermissionHint allowed={canReviewEvidence} className="mb-4">
            Evidence review (validity/completeness/approval) requires the assigned REVIEWER, or APPROVER/LEAD/ADMIN.
          </PermissionHint>
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => setShowAddEvidence(true)}
              disabled={!canAddEvidence}
              title={canAddEvidence ? "Add evidence" : "Requires the assigned OWNER, or LEAD/ADMIN."}
            >
              Add evidence
            </Button>
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
                          <div className="mt-2">
                            <StatusSemanticBadge tone={getEvidenceApprovalTone(item.approval_status)} />
                          </div>
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
                        disabled={!canEditEvidence}
                        title={canEditEvidence ? "Edit evidence details" : "Requires the assigned OWNER, or LEAD/ADMIN."}
                      >
                        Edit evidence
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setReviewingEvidence(item)}
                        disabled={!canReviewEvidence}
                        title={canReviewEvidence ? "Review evidence quality and approval" : "Requires the assigned REVIEWER, or APPROVER/LEAD/ADMIN."}
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
      ) : null}

      {activePanel === "recurring" && indicator.recurring_requirement ? (
        <Section
          title="Section 6 — Recurring"
          description="Recurring obligation details, due instances, and instance-level submit/approve commands."
        >
          <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Current status: <span className="font-semibold">{formatEnumLabel(indicator.current_status)}</span> •
            Allowed actions: Submit and approve recurring instances (role-gated).
          </div>
          <PermissionHint allowed={canSubmitRecurring} className="mb-4">
            Submitting recurring instances requires the assigned OWNER, or LEAD/ADMIN.
          </PermissionHint>
          <PermissionHint allowed={canApproveRecurring} className="mb-4">
            Approving recurring instances requires the assigned REVIEWER, or APPROVER/LEAD/ADMIN.
          </PermissionHint>
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
                      <StatusSemanticBadge tone={getRecurringStatusTone(instance.status)} />
                      <p className="text-sm text-slate-700">
                        Linked evidence: {instance.linked_evidence_title || "Not linked"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSubmittingRecurring(instance)}
                        disabled={!canSubmitRecurring}
                        title={canSubmitRecurring ? "Submit recurring instance" : "Requires the assigned OWNER, or LEAD/ADMIN."}
                      >
                        Submit instance
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setApprovingRecurring(instance)}
                        disabled={!canApproveRecurring}
                        title={canApproveRecurring ? "Approve or reject recurring instance" : "Requires the assigned REVIEWER, or APPROVER/LEAD/ADMIN."}
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

      {activePanel === "ai" ? (
        <Section
          title="Section 7 — AI / Assist"
          description="AI-generated guidance, drafts, and assessments to support your accreditation work. All AI outputs are advisory only."
        >
          <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p><span className="font-semibold">🤖 AI Provider:</span> Google Gemini (gemini-2.5-flash)</p>
            <p className="mt-1"><span className="font-semibold">Current Status:</span> {formatEnumLabel(indicator.current_status)}</p>
            <p className="mt-1"><span className="font-semibold">Advisory Only:</span> AI output does not automatically change indicator status or create evidence.</p>
          </div>
          <PermissionHint allowed={canAIActions} className="mb-4">
            AI generation and acceptance require the assigned OWNER, or LEAD/ADMIN role.
          </PermissionHint>
          <div className="mb-4 space-y-2 text-xs text-slate-600">
            <p><span className="font-semibold text-slate-900">Choose an output type:</span></p>
            <div className="ml-2 space-y-1">
              <p><span className="font-semibold text-slate-900">Guidance:</span> Practical action plan to move the indicator forward.</p>
              <p><span className="font-semibold text-slate-900">Draft:</span> Draft document or policy template matching the indicator requirement.</p>
              <p><span className="font-semibold text-slate-900">Assessment:</span> Gap analysis and readiness judgment with recommended actions.</p>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setAiOutputMode("GUIDANCE")}
              disabled={!canAIActions}
            >
              📋 Generate guidance
            </Button>
            <Button
              variant="secondary"
              onClick={() => setAiOutputMode("DRAFT")}
              disabled={!canAIActions}
            >
              📄 Generate draft
            </Button>
            <Button
              variant="secondary"
              onClick={() => setAiOutputMode("ASSESSMENT")}
              disabled={!canAIActions}
            >
              📊 Generate assessment
            </Button>
          </div>

          {aiOutputs.length ? (
            <div className="grid gap-4">
              {aiOutputs.map((output) => {
                const isError = output.content.startsWith("[ERROR]");
                const isDemo = output.content.startsWith("[DEMO MODE]");
                
                return (
                  <Card 
                    key={output.id} 
                    className={`border-slate-200 p-4 ${isError ? "border-red-300 bg-red-50" : isDemo ? "border-amber-300 bg-amber-50" : ""}`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isError ? (
                            <span className="rounded-full border border-red-300 bg-red-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-900">
                              ⚠️ Error
                            </span>
                          ) : isDemo ? (
                            <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                              📋 Demo Mode
                            </span>
                          ) : (
                            <span className="rounded-full border border-sky-300 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-900">
                              ✨ AI-generated
                            </span>
                          )}
                          <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                            {formatEnumLabel(output.output_type)}
                          </span>
                          {output.accepted ? (
                            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                              ✓ Accepted
                            </span>
                          ) : null}
                        </div>
                        <p className={`text-sm font-medium ${isError ? "text-red-700" : isDemo ? "text-amber-700" : "text-slate-600"}`}>
                          Provider: <span className="font-semibold">{output.model_name}</span> • Generated: {formatDateTime(output.created_at)}
                        </p>
                        <p className={`whitespace-pre-wrap text-sm leading-6 ${isError ? "text-red-900" : isDemo ? "text-amber-900" : "text-slate-800"}`}>
                          {output.content}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(output.content);
                            window.alert("Output copied to clipboard");
                          }}
                          disabled={isError}
                        >
                          📋 Copy
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setAcceptingAI(output)}
                          disabled={output.accepted || !canAcceptAI || isError}
                        >
                          {output.accepted ? "✓ Accepted" : "Accept advisory"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No AI outputs recorded"
              description="Generate advisory guidance, draft text, or an assessment when manual assistance is needed."
            />
          )}
        </Section>
      ) : null}

      {activePanel === "governance" ? (
        <Section
          title="Section 8 — Governance / Override"
          description="Status transition history and recent audited actions for override and decision traceability."
        >
          <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Current status: <span className="font-semibold">{formatEnumLabel(indicator.current_status)}</span> •
            Allowed actions: View status transitions and audit records. Override execution is in Actions.
          </div>
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
      ) : null}

      <Modal
        open={showAddEvidence}
        title="Add evidence"
        description="Record a new evidence item for this indicator."
        onClose={() => setShowAddEvidence(false)}
      >
        <EvidenceForm
          indicatorId={indicatorId}
          submitLabel="Add evidence"
          loading={addEvidence.isPending || !canAddEvidence}
          onSubmit={(payload) => {
            if (!canAddEvidence) {
              pushToast("You are not allowed to add evidence.", "error");
              return Promise.resolve();
            }
            return addEvidence.mutateAsync(payload as never);
          }}
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
            loading={editEvidence.isPending || !canEditEvidence}
            onSubmit={(payload) => {
              if (!canEditEvidence) {
                pushToast("You are not allowed to edit evidence.", "error");
                return Promise.resolve();
              }
              return editEvidence.mutateAsync({
                evidenceId: editingEvidence.id,
                payload: payload as never,
              });
            }}
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
            loading={reviewEvidence.isPending || !canReviewEvidence}
            onSubmit={(payload) => {
              if (!canReviewEvidence) {
                pushToast("You are not allowed to review evidence.", "error");
                return Promise.resolve();
              }
              return reviewEvidence.mutateAsync({
                evidenceId: reviewingEvidence.id,
                payload,
              });
            }}
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
            {evidenceItems.length ? (
              <select
                value={recurringEvidenceId}
                onChange={(event) => setRecurringEvidenceId(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                <option value="">No linked evidence</option>
                {evidenceItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} — {item.title}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={recurringEvidenceId}
                onChange={(event) => setRecurringEvidenceId(event.target.value)}
                inputMode="numeric"
                placeholder="Enter evidence item ID (optional)"
              />
            )}
            <p className="text-xs text-slate-500">
              {evidenceItems.length
                ? "Select an evidence item from this indicator."
                : "If no evidence is listed yet, submit text/notes first and link evidence later."}
            </p>
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
            <Button type="submit" loading={submitRecurring.isPending} disabled={!canSubmitRecurring}>
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
              disabled={!canApproveRecurring}
            >
              Approve instance
            </Button>
            <Button
              variant="danger"
              onClick={() => handleRecurringApprove("REJECTED")}
              loading={approveRecurring.isPending}
              disabled={!canApproveRecurring}
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
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p><span className="font-semibold">Model:</span> gemini-2.5-flash (Powered by Google Gemini)</p>
            <p className="mt-1"><span className="font-semibold">Status:</span> {generateAI.isPending ? "⏳ Generating..." : "Ready"}</p>
          </div>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Operator instruction (optional)</span>
            <Textarea
              value={aiInstruction}
              onChange={(event) => setAiInstruction(event.target.value)}
              placeholder="Optional instruction to steer the AI output. For example: 'Focus on compliance evidence requirements' or 'Generate a simple checklist'."
              disabled={generateAI.isPending}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAiOutputMode(null)} disabled={generateAI.isPending}>
              Cancel
            </Button>
            <Button onClick={handleGenerateAI} loading={generateAI.isPending} disabled={!canAIActions || generateAI.isPending}>
              {generateAI.isPending ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(acceptingAI)}
        title="Accept advisory AI output"
        description="This records your manual acceptance of an AI-generated output. Accepting does NOT change indicator workflow state."
        onClose={() => setAcceptingAI(null)}
      >
        <div className="space-y-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
            <p className="font-semibold">ℹ️ What acceptance means:</p>
            <ul className="mt-2 space-y-1 ml-4 list-disc text-xs">
              <li>Indicates you have reviewed the AI output</li>
              <li>Records who accepted and when</li>
              <li>Does NOT change indicator status or create evidence</li>
            </ul>
          </div>
          <p className="text-sm text-slate-700">
            Accept this AI output for operator reference?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAcceptingAI(null)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptAI} loading={acceptAI.isPending} disabled={!canAcceptAI}>
              Accept advisory
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
          if (!canStart) {
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
          if (!canSendForReview) {
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
          if (!canMarkMet || !readiness.ready_for_met) {
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
