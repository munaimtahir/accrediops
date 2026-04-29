"use client";

import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Modal } from "@/components/common/modal";
import { SettingsPageHeader } from "@/components/common/settings-page-header";
import { WorkbenchTable } from "@/components/common/workbench-table";
import { ClientProfileForm } from "@/components/forms/client-profile-form";
import { Button } from "@/components/ui/button";
import { useClientProfiles } from "@/lib/hooks/use-client-profiles";
import { ClientProfile } from "@/types";
import { formatDate } from "@/utils/format";

export function AdminClientProfilesScreen() {
  const profilesQuery = useClientProfiles();
  const [showCreate, setShowCreate] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ClientProfile | null>(null);

  if (profilesQuery.isLoading) {
    return <LoadingSkeleton className="h-48 w-full" />;
  }

  if (profilesQuery.error) {
    return <ErrorPanel message={profilesQuery.error.message} />;
  }

  const profiles = profilesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Client profiles"
        description="Create, edit, and audit reusable client profile data used across project document workflows."
        actions={<Button onClick={() => setShowCreate(true)}>Create profile</Button>}
      />

      {profiles.length ? (
        <WorkbenchTable<ClientProfile>
          columns={[
            { key: "organization", header: "Organization", render: (row) => row.organization_name },
            { key: "contact", header: "Contact", render: (row) => row.contact_person || "-" },
            { key: "license", header: "License", render: (row) => row.license_number || "-" },
            {
              key: "departments",
              header: "Departments",
              render: (row) => (row.department_names.length ? row.department_names.join(", ") : "-"),
            },
            {
              key: "linkedUsers",
              header: "Linked users",
              render: (row) =>
                row.linked_users.length
                  ? row.linked_users
                      .map((user) => [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username)
                      .join(", ")
                  : "-",
            },
            { key: "updated", header: "Updated", render: (row) => formatDate(row.updated_at) },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <Button size="sm" variant="secondary" onClick={() => setEditingProfile(row)}>
                  Edit
                </Button>
              ),
            },
          ]}
          rows={profiles}
          rowKey={(row) => row.id}
        />
      ) : (
        <EmptyState
          title="No client profiles yet"
          description="Create a client profile so projects can link organization details and run variable replacement."
          action={<Button onClick={() => setShowCreate(true)}>Create first profile</Button>}
        />
      )}

      <Modal
        open={showCreate}
        title="Create client profile"
        description="Create an organization profile for project linkage and variable replacement."
        onClose={() => setShowCreate(false)}
      >
        <ClientProfileForm
          onSaved={() => {
            setShowCreate(false);
          }}
        />
      </Modal>

      <Modal
        open={Boolean(editingProfile)}
        title="Edit client profile"
        description="Update organization details and validate variable replacement."
        onClose={() => setEditingProfile(null)}
      >
        {editingProfile ? (
          <ClientProfileForm
            initialValue={editingProfile}
            onSaved={() => {
              setEditingProfile(null);
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
