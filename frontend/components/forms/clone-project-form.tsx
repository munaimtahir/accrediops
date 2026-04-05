"use client";

import { FormEvent, useState } from "react";

import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useCloneProject } from "@/lib/hooks/use-mutations";

export function CloneProjectForm({
  projectId,
  onSuccess,
}: {
  projectId: number;
  onSuccess?: (newProjectId: number) => void;
}) {
  const { pushToast } = useToast();
  const cloneProject = useCloneProject(projectId);
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const project = await cloneProject.mutateAsync({ name, client_name: clientName });
      pushToast("Project cloned.", "success");
      onSuccess?.(project.id);
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">New project name</span>
        <Input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">New client name</span>
        <Input value={clientName} onChange={(event) => setClientName(event.target.value)} required />
      </label>
      <div className="flex justify-end">
        <Button type="submit" loading={cloneProject.isPending}>
          Clone project
        </Button>
      </div>
    </form>
  );
}
