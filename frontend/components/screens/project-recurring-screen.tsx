"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { Modal } from "@/components/common/modal";
import { NextActionBanner } from "@/components/common/next-action-banner";
import { OnboardingCallout } from "@/components/common/onboarding-callout";
import { PageHeader } from "@/components/common/page-header";
import { StatusSemanticBadge } from "@/components/common/status-semantic-badge";
import { WorkflowContextStrip } from "@/components/common/workflow-context-strip";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/common/toaster";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useSubmitRecurring, useApproveRecurring } from "@/lib/hooks/use-mutations";
import { useRecurringQueue } from "@/lib/hooks/use-recurring-queue";
import { useEvidence } from "@/lib/hooks/use-evidence";
import { RecurringInstance } from "@/types";
import { formatDate, formatEnumLabel } from "@/utils/format";
import { getRecurringStatusTone } from "@/utils/status-semantics";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/utils/cn";

export function ProjectRecurringScreen({ projectId }: { projectId: number }) {
  const { pushToast } = useToast();
  const dueTodayQuery = useRecurringQueue({ project_id: projectId, due_today: true });
  const overdueQuery = useRecurringQueue({ project_id: projectId, overdue: true });
  const [selectedInstance, setSelectedInstance] = useState<RecurringInstance | null>(null);
  const [approvingInstance, setApprovingInstance] = useState<RecurringInstance | null>(null);
  const [linkedEvidenceId, setLinkedEvidenceId] = useState("");
  const [textContent, setTextContent] = useState("");
  const [notes, setNotes] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [approvalNotes, setApprovalNotes] = useState("");

  const submitRecurring = useSubmitRecurring(selectedInstance?.project_indicator_id, selectedInstance?.id ?? 0, projectId);
  const approveRecurring = useApproveRecurring(approvingInstance?.project_indicator_id, approvingInstance?.id ?? 0, projectId);
  const evidenceQuery = useEvidence(selectedInstance?.project_indicator_id ?? NaN);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInstance) {
      return;
    }

    try {
      await submitRecurring.mutateAsync({
        evidence_item_id: linkedEvidenceId ? Number(linkedEvidenceId) : null,
        text_content: textContent,
        notes,
      });
      pushToast("Recurring instance submitted. Next Action: reviewer/approver approval is now required.", "success");
      setSelectedInstance(null);
      setLinkedEvidenceId("");
      setTextContent("");
      setNotes("");
      await Promise.all([dueTodayQuery.refetch(), overdueQuery.refetch()]);
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function handleApprove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!approvingInstance) {
      return;
    }

    try {
      await approveRecurring.mutateAsync({
        approval_status: approvalStatus,
        notes: approvalNotes,
      });
      pushToast(`Recurring instance ${approvalStatus.toLowerCase()}.`, "success");
      setApprovingInstance(null);
      setApprovalNotes("");
      await Promise.all([dueTodayQuery.refetch(), overdueQuery.refetch()]);
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  if (dueTodayQuery.isLoading || overdueQuery.isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-80 w-full" />
        <LoadingSkeleton className="h-80 w-full" />
      </div>
    );
  }

  if (dueTodayQuery.error) {
    return <ErrorPanel message={dueTodayQuery.error.message} />;
  }

  if (overdueQuery.error) {
    return <ErrorPanel message={overdueQuery.error.message} />;
  }

  const dueTodayRows = dueTodayQuery.data ?? [];
  const overdueRows = overdueQuery.data ?? [];
  const recurringAction = overdueRows.length
    ? "Submit overdue recurring instances before starting new due work."
    : dueTodayRows.length
      ? "Submit today’s recurring instances with linked evidence or notes."
      : "Recurring queue is clear. Return to the worklist for the next governed action.";
  const recurringReason = overdueRows.length
    ? `${overdueRows.length} recurring instance(s) are overdue.`
    : dueTodayRows.length
      ? `${dueTodayRows.length} recurring instance(s) are due today.`
      : "There are no due or overdue recurring obligations right now.";
  const recurringStatus = `Due today: ${dueTodayRows.length} • Overdue: ${overdueRows.length}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recurring Queue"
        title="Recurring evidence queue"
        description="Recurring obligations due today and overdue, with direct instance submission controls."
      />

      <WorkflowContextStrip
        scope={`Project ${projectId} · Recurring queue`}
        current="Managing due and overdue recurring submissions."
        nextStep="Submit due instances here, then open each indicator for reviewer approval actions."
        actions={[
          { label: "Back to project", href: `/projects/${projectId}` },
          { label: "Open worklist", href: `/projects/${projectId}/worklist` },
        ]}
      />

      <NextActionBanner action={recurringAction} reason={recurringReason} status={recurringStatus} />

      <OnboardingCallout
        storageKey={`recurring-queue-${projectId}`}
        title="Recurring execution tip"
        description="Use Submit for due items here, then open the indicator to complete approve/reject review actions."
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Due today</h2>
        <WorkbenchTable<RecurringInstance>
          columns={[
            {
              key: "indicator",
              header: "Indicator",
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-950">{row.indicator_code}</p>
                  <p className="mt-1 text-sm text-slate-600">{row.indicator_text}</p>
                  <div className="mt-2">
                    <StatusSemanticBadge tone={getRecurringStatusTone(row.status)} />
                  </div>
                </div>
              ),
            },
            {
              key: "due",
              header: "Due date",
              render: (row) => formatDate(row.due_date),
            },
            {
              key: "frequency",
              header: "Frequency",
              render: (row) => row.period_label,
            },
            {
              key: "status",
              header: "Status",
              render: (row) => formatEnumLabel(row.status),
            },
            {
              key: "action",
              header: "Action",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/project-indicators/${row.project_indicator_id}`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                  >
                    Open indicator
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedInstance(row)}
                    disabled={!row.capabilities?.can_submit}
                    title={row.capabilities?.can_submit ? "Submit this instance" : "You do not have permission to submit"}
                    data-testid={`submit-btn-${row.id}`}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setApprovingInstance(row)}
                    disabled={!row.capabilities?.can_approve}
                    title={row.capabilities?.can_approve ? "Approve this instance" : "You do not have permission to approve"}
                    data-testid={`approve-btn-${row.id}`}
                  >
                    Approve
                  </Button>
                </div>
              ),
            },
          ]}
          rows={dueTodayQuery.data ?? []}
          rowKey={(row) => row.id}
          empty={
            <EmptyState
              title="No recurring items due today"
              description="The queue is clear for the current day."
            />
          }
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Overdue</h2>
        <WorkbenchTable<RecurringInstance>
          columns={[
            {
              key: "indicator",
              header: "Indicator",
              render: (row) => (
                <div>
                  <p className="font-semibold text-slate-950">{row.indicator_code}</p>
                  <p className="mt-1 text-sm text-slate-600">{row.indicator_text}</p>
                  <div className="mt-2">
                    <StatusSemanticBadge tone={getRecurringStatusTone(row.status)} />
                  </div>
                </div>
              ),
            },
            {
              key: "project",
              header: "Project",
              render: (row) => row.project_name,
            },
            {
              key: "due",
              header: "Due date",
              render: (row) => (
                <div className="space-y-1">
                  <p>{formatDate(row.due_date)}</p>
                  <p className="text-xs font-medium text-rose-700">Overdue</p>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => formatEnumLabel(row.status),
            },
            {
              key: "action",
              header: "Action",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/project-indicators/${row.project_indicator_id}`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                  >
                    Open indicator
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedInstance(row)}
                    disabled={!row.capabilities?.can_submit}
                    title={row.capabilities?.can_submit ? "Submit this instance" : "You do not have permission to submit"}
                    data-testid={`submit-btn-${row.id}`}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setApprovingInstance(row)}
                    disabled={!row.capabilities?.can_approve}
                    title={row.capabilities?.can_approve ? "Approve this instance" : "You do not have permission to approve"}
                    data-testid={`approve-btn-${row.id}`}
                  >
                    Approve
                  </Button>
                </div>
              ),
            },
          ]}
          rows={overdueQuery.data ?? []}
          rowKey={(row) => row.id}
          empty={
            <EmptyState
              title="No overdue recurring items"
              description="No overdue recurring obligations are currently outstanding."
            />
          }
        />
      </section>

      <Modal
        open={Boolean(selectedInstance)}
        title="Submit recurring instance"
        description="Attach supporting evidence or provide submission notes for this recurring instance."
        onClose={() => setSelectedInstance(null)}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Linked evidence item ID</span>
            {evidenceQuery.data && evidenceQuery.data.length ? (
              <select
                value={linkedEvidenceId}
                onChange={(event) => setLinkedEvidenceId(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                <option value="">No linked evidence</option>
                {evidenceQuery.data.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} — {item.title}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={linkedEvidenceId}
                onChange={(event) => setLinkedEvidenceId(event.target.value)}
                inputMode="numeric"
                placeholder="Enter evidence item ID (optional)"
              />
            )}
            <p className="text-xs text-slate-500">
              {evidenceQuery.data && evidenceQuery.data.length
                ? "Select an evidence item from this indicator."
                : "If no evidence items are listed yet, submit text/notes first and link evidence later."}
            </p>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Submission text</span>
            <Textarea value={textContent} onChange={(event) => setTextContent(event.target.value)} />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Notes</span>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setSelectedInstance(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitRecurring.isPending}>
              Submit instance
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(approvingInstance)}
        title="Approve recurring instance"
        description="Review and finalize this recurring evidence submission."
        onClose={() => setApprovingInstance(null)}
      >
        <form className="space-y-4" onSubmit={handleApprove}>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Decision</span>
            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value as "APPROVED" | "REJECTED")}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              <option value="APPROVED">Approve</option>
              <option value="REJECTED">Reject / Return</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Approval notes</span>
            <Textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Provide feedback or record decision context..."
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setApprovingInstance(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={approveRecurring.isPending}>
              Confirm decision
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
