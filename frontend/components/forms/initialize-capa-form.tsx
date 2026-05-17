"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InitializeCapaPayload } from "@/types";

export function InitializeCapaForm({
  loading,
  onSubmit,
  onCancel,
}: {
  loading: boolean;
  onSubmit: (payload: InitializeCapaPayload) => Promise<unknown>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      title,
      root_cause: rootCause,
      corrective_action: correctiveAction,
      preventive_action: preventiveAction,
      due_date: dueDate || null,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2 text-sm">
        <label htmlFor="capa-title" className="font-medium text-slate-700">
          CAPA title
        </label>
        <Input
          id="capa-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2 text-sm">
        <label htmlFor="capa-root-cause" className="font-medium text-slate-700">
          Root cause
        </label>
        <Textarea
          id="capa-root-cause"
          value={rootCause}
          onChange={(e) => setRootCause(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2 text-sm">
        <label htmlFor="capa-corrective" className="font-medium text-slate-700">
          Corrective action
        </label>
        <Textarea
          id="capa-corrective"
          value={correctiveAction}
          onChange={(e) => setCorrectiveAction(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2 text-sm">
        <label htmlFor="capa-preventive" className="font-medium text-slate-700">
          Preventive action (Optional)
        </label>
        <Textarea
          id="capa-preventive"
          value={preventiveAction}
          onChange={(e) => setPreventiveAction(e.target.value)}
        />
      </div>
      <div className="space-y-2 text-sm">
        <label htmlFor="capa-due" className="font-medium text-slate-700">
          Target due date
        </label>
        <Input
          id="capa-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} data-testid="capa-cancel-btn">
          Cancel
        </Button>
        <Button type="submit" loading={loading} data-testid="capa-submit-btn">
          Initialize CAPA
        </Button>
      </div>
    </form>
  );
}
