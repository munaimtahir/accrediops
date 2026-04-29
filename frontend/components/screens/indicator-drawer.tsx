"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PriorityBadge } from "@/components/badges/priority-badge";
import { RecurringBadge } from "@/components/badges/recurring-badge";
import { StatusBadge } from "@/components/badges/status-badge";
import { Drawer } from "@/components/common/drawer";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PermissionHint } from "@/components/common/permission-hint";
import { StatusSemanticBadge } from "@/components/common/status-semantic-badge";
import { useToast } from "@/components/common/toaster";
import { EvidenceForm } from "@/components/forms/evidence-form";
import { EvidenceReviewForm } from "@/components/forms/evidence-review-form";
import { IndicatorActionDialog } from "@/components/forms/indicator-action-dialog";
import { WorkingStateForm } from "@/components/forms/working-state-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useEvidence } from "@/lib/hooks/use-evidence";
import { useAIOutputs, useIndicator } from "@/lib/hooks/use-indicator";
import {
  useAddEvidence,
  useApproveRecurring,
  useMarkMet,
  useReopen,
  useReviewEvidence,
  useSendForReview,
  useStartIndicator,
  useSubmitRecurring,
  useUpdateWorkingState,
} from "@/lib/hooks/use-mutations";
import { EvidenceItem, RecurringInstance } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate, formatDateTime, formatEnumLabel } from "@/utils/format";
import { getEvidenceApprovalTone, getRecurringStatusTone } from "@/utils/status-semantics";

type DrawerSection = "summary" | "evidence" | "recurring" | "notes" | "review" | "actions";

function SectionButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button size="sm" variant={active ? "default" : "secondary"} onClick={onClick}>
      {label}
    </Button>
  );
}

export function IndicatorDrawer({
  indicatorId,
  open,
  onClose,
}: {
  indicatorId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { pushToast } = useToast();
  const [activeSection, setActiveSection] = useState<DrawerSection>("summary");
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [reviewingEvidence, setReviewingEvidence] = useState<EvidenceItem | null>(null);
  const [submittingRecurring, setSubmittingRecurring] = useState<RecurringInstance | null>(null);
  const [approvingRecurring, setApprovingRecurring] = useState<RecurringInstance | null>(null);
  const [activeAction, setActiveAction] = useState<"start" | "review" | "met" | "reopen" | null>(null);
  const [recurringText, setRecurringText] = useState("");
  const [recurringNotes, setRecurringNotes] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  const numericId = indicatorId ?? NaN;
  const indicatorQuery = useIndicator(numericId);
  const evidenceQuery = useEvidence(numericId);
  const aiOutputsQuery = useAIOutputs(numericId);
  const indicator = indicatorQuery.data;
  const projectId = indicator?.project ?? NaN;

  const addEvidence = useAddEvidence(numericId, projectId);
  const reviewEvidence = useReviewEvidence(numericId, 0, projectId);
  const updateWorkingState = useUpdateWorkingState(numericId, projectId);
  const startIndicator = useStartIndicator(numericId, projectId);
  const sendForReview = useSendForReview(numericId, projectId);
  const markMet = useMarkMet(numericId, projectId);
  const reopen = useReopen(numericId, projectId);
  const submitRecurring = useSubmitRecurring(numericId, submittingRecurring?.id ?? 0, projectId);
  const approveRecurring = useApproveRecurring(numericId, approvingRecurring?.id ?? 0, projectId);

  const evidenceItems = useMemo(() => evidenceQuery.data ?? indicator?.evidence_items ?? [], [evidenceQuery.data, indicator]);
  const recurringInstances = indicator?.recurring_instances ?? [];
  const readiness = indicator?.readiness_flags;
  const capabilities = indicator?.capabilities;
  const canAssign = Boolean(capabilities?.can_assign);
  const canUpdateWorkingState = Boolean(capabilities?.can_update_working_state);
  const canAddEvidence = Boolean(capabilities?.can_add_evidence);
  const canReviewEvidence = Boolean(capabilities?.can_review_evidence);
  const canSubmitRecurring = Boolean(capabilities?.can_submit_recurring);
  const canApproveRecurring = Boolean(capabilities?.can_approve_recurring);
  const canStart = Boolean(capabilities?.can_start);
  const canSendForReview = Boolean(capabilities?.can_send_for_review);
  const canMarkMet = Boolean(capabilities?.can_mark_met);
  const canReopen = Boolean(capabilities?.can_reopen);
  const detailHref = indicator ? `/project-indicators/${indicator.id}` : "#";
  const aiHref = indicator ? `/project-indicators/${indicator.id}?panel=ai` : "#";

  async function handleRecurringSubmit(instanceId: number) {
    if (!canSubmitRecurring) {
      pushToast("You are not allowed to submit recurring work for this indicator.", "error");
      return;
    }
    try {
      await submitRecurring.mutateAsync({
        text_content: recurringText,
        notes: recurringNotes,
      });
      pushToast("Recurring instance submitted.", "success");
      setSubmittingRecurring(null);
      setRecurringText("");
      setRecurringNotes("");
      await indicatorQuery.refetch();
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
      await approveRecurring.mutateAsync({ approval_status, notes: approveNotes });
      pushToast(`Recurring instance ${approval_status.toLowerCase()}.`, "success");
      setApprovingRecurring(null);
      setApproveNotes("");
      await indicatorQuery.refetch();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function handleActionConfirm(reason: string) {
    if (!activeAction) return;
    if (activeAction === "start") {
      if (!canStart) return;
      await startIndicator.mutateAsync({ reason });
    } else if (activeAction === "review") {
      if (!canSendForReview) return;
      await sendForReview.mutateAsync({ reason });
    } else if (activeAction === "met") {
      if (!canMarkMet || !readiness?.ready_for_met) return;
      await markMet.mutateAsync({ reason });
    } else if (activeAction === "reopen") {
      if (!canReopen) return;
      await reopen.mutateAsync({ reason: reason || "Reopened from indicator drawer." });
    }
    setActiveAction(null);
    await indicatorQuery.refetch();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={indicator ? `${indicator.indicator.code} · Indicator workbench` : "Indicator workbench"}
      description="Fast indicator update drawer. Use tabs to update evidence, recurring, review, and governed actions."
      widthClassName="max-w-5xl"
    >
      {!indicatorId ? (
        <EmptyState title="No indicator selected" description="Select an indicator card to open update drawer." />
      ) : indicatorQuery.isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-24 w-full" />
          <LoadingSkeleton className="h-72 w-full" />
        </div>
      ) : indicatorQuery.error ? (
        <ErrorPanel message={indicatorQuery.error.message} />
      ) : !indicator ? (
        <ErrorPanel message="Indicator not found." />
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={indicator.current_status} />
              <PriorityBadge priority={indicator.priority} />
              <RecurringBadge
                isRecurring={indicator.indicator.is_recurring}
                frequency={indicator.indicator.recurrence_frequency}
              />
              {readiness ? <StatusSemanticBadge tone={readiness.ready_for_met ? "green" : "yellow"} /> : null}
            </div>
            <p className="mt-2 text-sm text-slate-700">{indicator.indicator.text}</p>
          </div>

          <Card className="border-sky-200 bg-sky-50/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-700">Full workflow access</p>
            <h3 className="mt-1 text-base font-semibold text-slate-950">AI Action Center</h3>
            <p className="mt-2 text-sm text-slate-700">
              Open the full indicator detail page to generate guidance, draft evidence text, or assessment support. AI remains advisory-only and does not change workflow status.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={detailHref} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
                Open full detail
              </Link>
              <Link href={aiHref} className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
                Open AI Action Center
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              AI outputs recorded: {aiOutputsQuery.data?.length ?? indicator.ai_outputs.length}
            </p>
          </Card>

          <div className="flex flex-wrap gap-2">
            <SectionButton active={activeSection === "summary"} onClick={() => setActiveSection("summary")} label="Summary" />
            <SectionButton active={activeSection === "evidence"} onClick={() => setActiveSection("evidence")} label="Evidence" />
            <SectionButton active={activeSection === "recurring"} onClick={() => setActiveSection("recurring")} label="Recurring" />
            <SectionButton active={activeSection === "notes"} onClick={() => setActiveSection("notes")} label="Comments / Notes" />
            <SectionButton active={activeSection === "review"} onClick={() => setActiveSection("review")} label="Review / Governance" />
            <SectionButton active={activeSection === "actions"} onClick={() => setActiveSection("actions")} label="Actions" />
          </div>

          {activeSection === "summary" ? (
            <Card className="p-4">
              <h3 className="text-base font-semibold text-slate-950">Summary</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <p className="text-sm text-slate-700">Current status: {formatEnumLabel(indicator.current_status)}</p>
                <p className="text-sm text-slate-700">Due date: {formatDate(indicator.due_date)}</p>
                <p className="text-sm text-slate-700">Owner: {indicator.owner?.username ?? "Not assigned"}</p>
                <p className="text-sm text-slate-700">Reviewer: {indicator.reviewer?.username ?? "Not assigned"}</p>
                <p className="text-sm text-slate-700">Approver: {indicator.approver?.username ?? "Not assigned"}</p>
                <p className="text-sm text-slate-700">Assignment updates: {canAssign ? "Available" : "Lead/Admin only"}</p>
              </div>
            </Card>
          ) : null}

          {activeSection === "evidence" ? (
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-950">Evidence</h3>
                <Button size="sm" onClick={() => setShowAddEvidence(true)} disabled={!canAddEvidence}>
                  Add evidence
                </Button>
              </div>
              <PermissionHint allowed={canAddEvidence}>
                Evidence creation requires the assigned OWNER, or LEAD/ADMIN.
              </PermissionHint>
              {evidenceItems.length ? (
                <div className="mt-3 space-y-3">
                  {evidenceItems.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <StatusSemanticBadge tone={getEvidenceApprovalTone(item.approval_status)} />
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{item.description || "No description."}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Physical: {item.physical_location_type || "N/A"} {item.location_details ? `(${item.location_details})` : ""}
                      </p>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setReviewingEvidence(item)}
                          disabled={!canReviewEvidence}
                        >
                          Review evidence
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No evidence yet" description="Add evidence to continue governed indicator flow." />
              )}
            </Card>
          ) : null}

          {activeSection === "recurring" ? (
            <Card className="p-4">
              <h3 className="text-base font-semibold text-slate-950">Recurring</h3>
              {recurringInstances.length ? (
                <div className="mt-3 space-y-3">
                  {recurringInstances.map((instance) => (
                    <div key={instance.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-slate-900">{instance.period_label}</p>
                        <StatusSemanticBadge tone={getRecurringStatusTone(instance.status)} />
                      </div>
                      <p className="mt-1 text-sm text-slate-700">
                        Due {formatDate(instance.due_date)} • Status {formatEnumLabel(instance.status)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSubmittingRecurring(instance)}
                          disabled={!canSubmitRecurring}
                        >
                          Submit instance
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setApprovingRecurring(instance)}
                          disabled={!canApproveRecurring}
                        >
                          Approve instance
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No recurring instances" description="Recurring details appear when indicator has recurring requirements." />
              )}
            </Card>
          ) : null}

          {activeSection === "notes" ? (
            <Card className="p-4">
              <h3 className="text-base font-semibold text-slate-950">Comments / Notes</h3>
              <p className="mt-2 text-sm text-slate-700">Use working notes to capture operator context and pending tasks.</p>
              <PermissionHint allowed={canUpdateWorkingState} className="mt-3">
                Working state updates require the assigned OWNER, or LEAD/ADMIN.
              </PermissionHint>
              <div className="mt-4">
                <WorkingStateForm
                  indicator={indicator}
                  loading={updateWorkingState.isPending || !canUpdateWorkingState}
                  onSubmit={(payload) => {
                    if (!canUpdateWorkingState) {
                      pushToast("You are not allowed to update working state on this indicator.", "error");
                      return Promise.resolve();
                    }
                    return updateWorkingState.mutateAsync(payload);
                  }}
                />
              </div>
            </Card>
          ) : null}

          {activeSection === "review" ? (
            <Card className="p-4">
              <h3 className="text-base font-semibold text-slate-950">Review / Governance</h3>
              <p className="mt-2 text-sm text-slate-700">
                Evidence review is separate from indicator state transitions; governance trail is preserved in full detail route.
              </p>
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                Status history: {indicator.status_history.length} events • Audit events: {indicator.audit_summary.length} entries • AI outputs:{" "}
                {aiOutputsQuery.data?.length ?? indicator.ai_outputs.length}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={detailHref} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
                  Open full detail
                </Link>
                <Link href={aiHref} className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
                  Open AI Action Center
                </Link>
              </div>
            </Card>
          ) : null}

          {activeSection === "actions" ? (
            <Card className="p-4">
              <h3 className="text-base font-semibold text-slate-950">Actions</h3>
              <PermissionHint allowed={canStart || canSendForReview}>
                Start / Send for Review require the assigned OWNER, or LEAD/ADMIN.
              </PermissionHint>
              <PermissionHint allowed={canMarkMet}>
                Mark as Met requires the assigned APPROVER, or LEAD/ADMIN, with readiness complete.
              </PermissionHint>
              <PermissionHint allowed={canReopen}>
                Reopen is ADMIN-only governance override.
              </PermissionHint>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setActiveAction("start")} disabled={!canStart}>
                  Start
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setActiveAction("review")} disabled={!canSendForReview}>
                  Send for Review
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveAction("met")}
                  disabled={!canMarkMet || !readiness?.ready_for_met}
                >
                  Mark as Met
                </Button>
                <Button size="sm" variant="danger" onClick={() => setActiveAction("reopen")} disabled={!canReopen}>
                  Reopen
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      )}

      <Drawer
        open={showAddEvidence}
        onClose={() => setShowAddEvidence(false)}
        title="Add evidence"
        description="Add evidence without leaving current workspace context."
        widthClassName="max-w-2xl"
      >
        {indicatorId ? (
          <EvidenceForm
            indicatorId={indicatorId}
            submitLabel="Add evidence"
            loading={addEvidence.isPending || !canAddEvidence}
            onSubmit={(payload) => {
              if (!canAddEvidence) {
                pushToast("You are not allowed to add evidence on this indicator.", "error");
                return Promise.resolve();
              }
              return addEvidence.mutateAsync(payload as never);
            }}
            onSuccess={() => {
              setShowAddEvidence(false);
            }}
          />
        ) : null}
      </Drawer>

      <Drawer
        open={Boolean(reviewingEvidence)}
        onClose={() => setReviewingEvidence(null)}
        title="Review evidence"
        description="Review evidence validity/completeness/approval."
        widthClassName="max-w-2xl"
      >
        {reviewingEvidence ? (
          <EvidenceReviewForm
            evidence={reviewingEvidence}
            loading={reviewEvidence.isPending || !canReviewEvidence}
            onSubmit={(payload) => {
              if (!canReviewEvidence) {
                pushToast("You are not allowed to review evidence on this indicator.", "error");
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
      </Drawer>

      <Drawer
        open={Boolean(submittingRecurring)}
        onClose={() => setSubmittingRecurring(null)}
        title="Submit recurring instance"
        description="Submit recurring evidence note."
        widthClassName="max-w-2xl"
      >
        {submittingRecurring ? (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <label htmlFor="recurring-text" className="font-medium text-slate-700">Submission text</label>
              <textarea
                id="recurring-text"
                className="min-h-[120px] w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-slate-950"
                value={recurringText}
                onChange={(event) => setRecurringText(event.target.value)}
              />
            </div>
            <div className="space-y-2 text-sm">
              <label htmlFor="recurring-notes" className="font-medium text-slate-700">Notes</label>
              <textarea
                id="recurring-notes"
                className="min-h-[120px] w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-slate-950"
                value={recurringNotes}
                onChange={(event) => setRecurringNotes(event.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                loading={submitRecurring.isPending}
                onClick={() => handleRecurringSubmit(submittingRecurring.id)}
                disabled={!canSubmitRecurring}
              >
                Submit instance
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={Boolean(approvingRecurring)}
        onClose={() => setApprovingRecurring(null)}
        title="Approve recurring instance"
        description="Approve or reject recurring submission."
        widthClassName="max-w-2xl"
      >
        {approvingRecurring ? (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <label htmlFor="approve-notes" className="font-medium text-slate-700">Notes</label>
              <textarea
                id="approve-notes"
                className="min-h-[120px] w-full rounded-md border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-slate-950"
                value={approveNotes}
                onChange={(event) => setApproveNotes(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => handleRecurringApprove("REJECTED")}
                loading={approveRecurring.isPending}
                disabled={!canApproveRecurring}
              >
                Reject instance
              </Button>
              <Button
                onClick={() => handleRecurringApprove("APPROVED")}
                loading={approveRecurring.isPending}
                disabled={!canApproveRecurring}
              >
                Approve instance
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <IndicatorActionDialog
        open={Boolean(activeAction)}
        title={
          activeAction === "start"
            ? "Start indicator"
            : activeAction === "review"
              ? "Send for review"
              : activeAction === "met"
                ? "Mark indicator as met"
                : "Reopen indicator"
        }
        description="Command-based action with governance reason trail."
        reasonRequired={activeAction === "reopen"}
        confirmLabel={
          activeAction === "start"
            ? "Start"
            : activeAction === "review"
              ? "Send for Review"
              : activeAction === "met"
                ? "Mark as Met"
                : "Reopen"
        }
        loading={startIndicator.isPending || sendForReview.isPending || markMet.isPending || reopen.isPending}
        onClose={() => setActiveAction(null)}
        onConfirm={handleActionConfirm}
      />
    </Drawer>
  );
}
