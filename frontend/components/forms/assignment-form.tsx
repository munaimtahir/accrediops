"use client";

import { FormEvent, useMemo, useState } from "react";

import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useUsers } from "@/lib/hooks/use-users";
import { AssignIndicatorPayload, Priority, ProjectIndicator } from "@/types";
import { formatUserName } from "@/utils/format";

const priorityOptions: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  return Number(value);
}

export function AssignmentForm({
  indicator,
  loading,
  onSubmit,
}: {
  indicator: ProjectIndicator;
  loading?: boolean;
  onSubmit: (payload: AssignIndicatorPayload) => Promise<unknown> | void;
}) {
  const { pushToast } = useToast();
  const ownersQuery = useUsers({ role: "OWNER" });
  const reviewersQuery = useUsers({ role: "REVIEWER" });
  const approversQuery = useUsers({ role: "APPROVER" });
  const [ownerId, setOwnerId] = useState(indicator.owner?.id?.toString() ?? "");
  const [reviewerId, setReviewerId] = useState(indicator.reviewer?.id?.toString() ?? "");
  const [approverId, setApproverId] = useState(indicator.approver?.id?.toString() ?? "");
  const [priority, setPriority] = useState<Priority>(indicator.priority);
  const [dueDate, setDueDate] = useState(indicator.due_date ?? "");
  const [notes, setNotes] = useState(indicator.notes ?? "");
  const hasUserError = ownersQuery.error || reviewersQuery.error || approversQuery.error;
  const ownerOptions = useMemo(() => ownersQuery.data ?? [], [ownersQuery.data]);
  const reviewerOptions = useMemo(() => reviewersQuery.data ?? [], [reviewersQuery.data]);
  const approverOptions = useMemo(() => approversQuery.data ?? [], [approversQuery.data]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await Promise.resolve(onSubmit({
        owner_id: parseOptionalNumber(ownerId),
        reviewer_id: parseOptionalNumber(reviewerId),
        approver_id: parseOptionalNumber(approverId),
        priority,
        due_date: dueDate || null,
        notes,
      }));
      pushToast("Operational assignment updated.", "success");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {hasUserError ? (
        <p className="text-xs text-rose-700">User options could not be loaded. Retry after the user API is available.</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Owner</span>
          <Select value={ownerId} onChange={(event) => setOwnerId(event.target.value)} disabled={ownersQuery.isLoading}>
            <option value="">Unassigned</option>
            {ownerOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {formatUserName(user)}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Reviewer</span>
          <Select value={reviewerId} onChange={(event) => setReviewerId(event.target.value)} disabled={reviewersQuery.isLoading}>
            <option value="">Unassigned</option>
            {reviewerOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {formatUserName(user)}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Approver</span>
          <Select value={approverId} onChange={(event) => setApproverId(event.target.value)} disabled={approversQuery.isLoading}>
            <option value="">Unassigned</option>
            {approverOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {formatUserName(user)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Priority</span>
          <Select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Due date</span>
          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Operational notes</span>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save assignment
        </Button>
      </div>
    </form>
  );
}
