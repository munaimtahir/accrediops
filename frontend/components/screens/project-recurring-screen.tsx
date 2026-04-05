"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { Modal } from "@/components/common/modal";
import { PageHeader } from "@/components/common/page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/common/toaster";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useSubmitRecurring } from "@/lib/hooks/use-mutations";
import { useRecurringQueue } from "@/lib/hooks/use-recurring-queue";
import { RecurringInstance } from "@/types";
import { formatDate, formatEnumLabel } from "@/utils/format";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/utils/cn";

export function ProjectRecurringScreen({ projectId }: { projectId: number }) {
  const { pushToast } = useToast();
  const dueTodayQuery = useRecurringQueue({ project_id: projectId, due_today: true });
  const overdueQuery = useRecurringQueue({ project_id: projectId, overdue: true });
  const [selectedInstance, setSelectedInstance] = useState<RecurringInstance | null>(null);
  const [linkedEvidenceId, setLinkedEvidenceId] = useState("");
  const [textContent, setTextContent] = useState("");
  const [notes, setNotes] = useState("");
  const submitRecurring = useSubmitRecurring(selectedInstance?.project_indicator_id, selectedInstance?.id ?? 0, projectId);

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
      pushToast("Recurring instance submitted.", "success");
      setSelectedInstance(null);
      setLinkedEvidenceId("");
      setTextContent("");
      setNotes("");
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recurring Queue"
        title="Recurring evidence queue"
        description="Recurring obligations due today and overdue, with direct instance submission controls."
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
                  <Button variant="secondary" size="sm" onClick={() => setSelectedInstance(row)}>
                    Submit
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
                  <Button variant="secondary" size="sm" onClick={() => setSelectedInstance(row)}>
                    Submit
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
            <Input
              value={linkedEvidenceId}
              onChange={(event) => setLinkedEvidenceId(event.target.value)}
              inputMode="numeric"
            />
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
    </div>
  );
}
