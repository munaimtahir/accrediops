"use client";

import { FormEvent, useState } from "react";

import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSafeErrorMessage } from "@/lib/api/client";
import { Priority, ProjectIndicator, WorkingStatePayload } from "@/types";

const priorityOptions: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function WorkingStateForm({
  indicator,
  loading,
  onSubmit,
}: {
  indicator: ProjectIndicator;
  loading?: boolean;
  onSubmit: (payload: WorkingStatePayload) => Promise<unknown> | void;
}) {
  const { pushToast } = useToast();
  const [notes, setNotes] = useState(indicator.notes ?? "");
  const [priority, setPriority] = useState<Priority>(indicator.priority);
  const [dueDate, setDueDate] = useState(indicator.due_date ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await Promise.resolve(onSubmit({
        notes,
        priority,
        due_date: dueDate || null,
      }));
      pushToast("Working state updated.", "success");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
        <span className="font-medium text-slate-700">Working notes</span>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save working state
        </Button>
      </div>
    </form>
  );
}
