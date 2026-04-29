"use client";

import { FormEvent, useState } from "react";

import { useToast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSafeErrorMessage } from "@/lib/api/client";
import { useSaveClientProfile, useVariablesPreview } from "@/lib/hooks/use-client-profiles";
import { useUsers } from "@/lib/hooks/use-users";
import { ClientProfile } from "@/types";

export function ClientProfileForm({
  initialValue,
  onSaved,
}: {
  initialValue?: ClientProfile;
  onSaved?: (profile: ClientProfile) => void;
}) {
  const { pushToast } = useToast();
  const saveProfile = useSaveClientProfile(initialValue?.id);
  const previewVars = useVariablesPreview(initialValue?.id ?? 0);
  const usersQuery = useUsers({});
  const [organizationName, setOrganizationName] = useState(initialValue?.organization_name ?? "");
  const [address, setAddress] = useState(initialValue?.address ?? "");
  const [licenseNumber, setLicenseNumber] = useState(initialValue?.license_number ?? "");
  const [registrationNumber, setRegistrationNumber] = useState(initialValue?.registration_number ?? "");
  const [contactPerson, setContactPerson] = useState(initialValue?.contact_person ?? "");
  const [departmentNames, setDepartmentNames] = useState((initialValue?.department_names ?? []).join(", "));
  const [linkedUserIds, setLinkedUserIds] = useState<number[]>(initialValue?.linked_users.map((user) => user.id) ?? []);
  const [previewText, setPreviewText] = useState("{{organization_name}} - {{license_number}}");
  const [previewOutput, setPreviewOutput] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const savedProfile = await saveProfile.mutateAsync({
        organization_name: organizationName,
        address,
        license_number: licenseNumber,
        registration_number: registrationNumber,
        contact_person: contactPerson,
        department_names: departmentNames
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        linked_user_ids: linkedUserIds,
      });
      onSaved?.(savedProfile);
      pushToast("Client profile saved.", "success");
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  async function handlePreview() {
    if (!initialValue?.id) {
      pushToast("Save the profile before variable preview.", "error");
      return;
    }
    try {
      const result = await previewVars.mutateAsync({ text: previewText });
      setPreviewOutput(result.replaced_text);
    } catch (error) {
      pushToast(getSafeErrorMessage(error), "error");
    }
  }

  function toggleLinkedUser(userId: number) {
    setLinkedUserIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Organization name</span>
          <Input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} required />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Contact person</span>
          <Input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} />
        </label>
      </div>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Address</span>
        <Textarea value={address} onChange={(event) => setAddress(event.target.value)} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">License number</span>
          <Input value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Registration number</span>
          <Input value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} />
        </label>
      </div>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Department names (comma-separated)</span>
        <Input value={departmentNames} onChange={(event) => setDepartmentNames(event.target.value)} />
      </label>
      <div className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Linked users</span>
        {usersQuery.isLoading ? <p className="text-slate-600">Loading users...</p> : null}
        {usersQuery.error ? <p className="text-rose-700">{usersQuery.error.message}</p> : null}
        {usersQuery.data?.length ? (
          <div className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-2">
            {usersQuery.data.map((user) => {
              const label = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
              return (
                <label key={user.id} className="flex items-start gap-2 rounded-md border border-slate-200 p-2">
                  <input
                    type="checkbox"
                    checked={linkedUserIds.includes(user.id)}
                    onChange={() => toggleLinkedUser(user.id)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-slate-800">
                    {label}
                    <span className="block text-xs text-slate-500">
                      {user.username} • {user.role}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        ) : null}
        {!usersQuery.isLoading && !usersQuery.error && !usersQuery.data?.length ? (
          <p className="text-slate-600">No active users available to link.</p>
        ) : null}
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={saveProfile.isPending}>
          Save client profile
        </Button>
      </div>
      <div className="rounded-xl border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-slate-900">Variable preview</h4>
        <label className="mt-3 block space-y-2 text-sm">
          <span className="font-medium text-slate-700">Template text</span>
          <Textarea value={previewText} onChange={(event) => setPreviewText(event.target.value)} />
        </label>
        <div className="mt-3 flex justify-end">
          <Button type="button" variant="secondary" onClick={handlePreview} loading={previewVars.isPending}>
            Preview replacement
          </Button>
        </div>
        {previewOutput ? (
          <p className="mt-3 rounded bg-slate-100 p-3 text-sm text-slate-800">{previewOutput}</p>
        ) : null}
      </div>
    </form>
  );
}
