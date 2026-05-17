"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Priority, RecordGapPayload } from "@/types";

export function RecordGapForm({
  loading,
  onSubmit,
  onCancel,
}: {
  loading: boolean;
  onSubmit: (payload: RecordGapPayload) => Promise<unknown>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Priority>("MEDIUM");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      title,
      description,
      severity,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2 text-sm">
        <label htmlFor="gap-title" className="font-medium text-slate-700">
          Gap title
        </label>
        <Input
          id="gap-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2 text-sm">
        <label htmlFor="gap-severity" className="font-medium text-slate-700">
          Severity
        </label>
        <Select id="gap-severity" value={severity} onChange={(e) => setSeverity(e.target.value as Priority)}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </Select>
      </div>
      <div className="space-y-2 text-sm">
        <label htmlFor="gap-description" className="font-medium text-slate-700">
          Description (Optional)
        </label>
        <Textarea
          id="gap-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} data-testid="gap-cancel-btn">
          Cancel
        </Button>
        <Button type="submit" loading={loading} data-testid="gap-submit-btn">
          Record Gap
        </Button>
      </div>
    </form>
  );
}
