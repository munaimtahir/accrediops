"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useClientProfiles } from "@/lib/hooks/use-client-profiles";
import { useFrameworks } from "@/lib/hooks/use-frameworks";
import { useDeleteProject, useUpdateProject } from "@/lib/hooks/use-mutations";
import { Project, ProjectStatus } from "@/types";

const statusOptions: ProjectStatus[] = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"];

export function ProjectManagementForm({
  project,
  onSuccess,
  onDelete,
}: {
  project: Project;
  onSuccess?: () => void;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const frameworksQuery = useFrameworks();
  const profilesQuery = useClientProfiles();
  const updateProject = useUpdateProject(project.id);
  const deleteProject = useDeleteProject(project.id);

  const [name, setName] = useState(project.name);
  const [clientName, setClientName] = useState(project.client_name);
  const [accreditingBodyName, setAccreditingBodyName] = useState(project.accrediting_body_name);
  const [frameworkId, setFrameworkId] = useState(String(project.framework));
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [startDate, setStartDate] = useState(project.start_date);
  const [targetDate, setTargetDate] = useState(project.target_date);
  const [clientProfileId, setClientProfileId] = useState(
    project.client_profile ? String(project.client_profile) : "",
  );
  const [notes, setNotes] = useState(project.notes ?? "");

  const frameworks = useMemo(() => frameworksQuery.data ?? [], [frameworksQuery.data]);
  const profiles = useMemo(() => profilesQuery.data ?? [], [profilesQuery.data]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateProject.mutateAsync({
        name,
        client_name: clientName,
        accrediting_body_name: accreditingBodyName,
        framework: Number(frameworkId),
        status,
        start_date: startDate,
        target_date: targetDate,
        client_profile: clientProfileId ? Number(clientProfileId) : null,
        notes,
      });
      pushToast("Project details updated.", "success");
      onSuccess?.();
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete project "${project.name}"? This removes the project and its related work items.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteProject.mutateAsync();
      pushToast("Project deleted.", "success");
      onDelete?.();
      router.push("/projects");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  if (frameworksQuery.isLoading || profilesQuery.isLoading) {
    return <p className="text-sm text-slate-600">Loading management options...</p>;
  }

  if (frameworksQuery.error) {
    return <p className="text-sm text-rose-700">{frameworksQuery.error.message}</p>;
  }

  if (profilesQuery.error) {
    return <p className="text-sm text-rose-700">{profilesQuery.error.message}</p>;
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Project name</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Client name</span>
          <Input value={clientName} onChange={(event) => setClientName(event.target.value)} required />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Accrediting body name</span>
          <Input
            value={accreditingBodyName}
            onChange={(event) => setAccreditingBodyName(event.target.value)}
            required
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Status</span>
          <Select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Framework</span>
          <Select value={frameworkId} onChange={(event) => setFrameworkId(event.target.value)} required>
            {frameworks.map((framework) => (
              <option key={framework.id} value={framework.id}>
                {framework.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Client profile</span>
          <Select value={clientProfileId} onChange={(event) => setClientProfileId(event.target.value)}>
            <option value="">Unlinked</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.organization_name}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Start date</span>
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Target date</span>
          <Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} required />
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Notes</span>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="danger" onClick={handleDelete} loading={deleteProject.isPending}>
          Delete project
        </Button>
        <Button type="submit" loading={updateProject.isPending}>
          Save project
        </Button>
      </div>
    </form>
  );
}
