"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useClientProfiles } from "@/lib/hooks/use-client-profiles";
import { useFrameworks } from "@/lib/hooks/use-frameworks";
import { useCreateProject, useInitializeProjectFromFramework } from "@/lib/hooks/use-mutations";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function oneYearFromTodayIsoDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

export function CreateProjectForm({
  onSuccess,
}: {
  onSuccess?: (projectId: number) => void;
}) {
  const { pushToast } = useToast();
  const frameworksQuery = useFrameworks();
  const profilesQuery = useClientProfiles();
  const createProject = useCreateProject();
  const initializeProject = useInitializeProjectFromFramework();

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [accreditingBodyName, setAccreditingBodyName] = useState("");
  const [frameworkId, setFrameworkId] = useState("");
  const [clientProfileId, setClientProfileId] = useState("");
  const [startDate, setStartDate] = useState(todayIsoDate());
  const [targetDate, setTargetDate] = useState(oneYearFromTodayIsoDate());
  const [notes, setNotes] = useState("");
  const [initializeFromFramework, setInitializeFromFramework] = useState(true);

  const frameworks = useMemo(() => frameworksQuery.data ?? [], [frameworksQuery.data]);
  const profiles = useMemo(() => profilesQuery.data ?? [], [profilesQuery.data]);

  useEffect(() => {
    if (!frameworkId && frameworks.length) {
      setFrameworkId(String(frameworks[0].id));
    }
  }, [frameworkId, frameworks]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const project = await createProject.mutateAsync({
        name,
        client_name: clientName,
        accrediting_body_name: accreditingBodyName,
        framework: Number(frameworkId),
        client_profile: clientProfileId ? Number(clientProfileId) : null,
        start_date: startDate,
        target_date: targetDate,
        notes,
      });

      if (initializeFromFramework) {
        const initResult = await initializeProject.mutateAsync({
          projectId: project.id,
          payload: {
            create_initial_instances: true,
          },
        });
        pushToast(
          `Project created and initialized (${initResult.created_project_indicators} indicators).`,
          "success",
        );
      } else {
        pushToast("Project created as draft.", "success");
      }

      onSuccess?.(project.id);
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  if (frameworksQuery.isLoading || profilesQuery.isLoading) {
    return <p className="text-sm text-slate-600">Loading project options...</p>;
  }

  if (frameworksQuery.error) {
    return <p className="text-sm text-rose-700">{frameworksQuery.error.message}</p>;
  }

  if (profilesQuery.error) {
    return <p className="text-sm text-rose-700">{profilesQuery.error.message}</p>;
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Project name</span>
        <Input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Client name</span>
        <Input value={clientName} onChange={(event) => setClientName(event.target.value)} required />
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Accrediting body name</span>
        <Input
          value={accreditingBodyName}
          onChange={(event) => setAccreditingBodyName(event.target.value)}
          required
        />
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Framework</span>
        <Select value={frameworkId} onChange={(event) => setFrameworkId(event.target.value)} required>
          <option value="">Select framework</option>
          {frameworks.map((framework) => (
            <option key={framework.id} value={framework.id}>
              {framework.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Client profile (optional)</span>
        <Select value={clientProfileId} onChange={(event) => setClientProfileId(event.target.value)}>
          <option value="">Unlinked</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.organization_name}
            </option>
          ))}
        </Select>
      </label>
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
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={initializeFromFramework}
          onChange={(event) => setInitializeFromFramework(event.target.checked)}
        />
        Initialize project from selected framework immediately
      </label>
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={createProject.isPending || initializeProject.isPending}
          disabled={!frameworkId}
        >
          Create project
        </Button>
      </div>
    </form>
  );
}
