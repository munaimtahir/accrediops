"use client";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorPanel } from "@/components/common/error-panel";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PageHeader } from "@/components/common/page-header";
import { ClientProfileForm } from "@/components/forms/client-profile-form";
import { ProjectManagementForm } from "@/components/forms/project-management-form";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { useProject } from "@/lib/hooks/use-projects";
import { useClientProfile } from "@/lib/hooks/use-client-profiles";
import { useState } from "react";

export function ProjectClientProfileScreen({ projectId }: { projectId: number }) {
  const [showLinkProfile, setShowLinkProfile] = useState(false);
  const projectQuery = useProject(projectId);
  const profileId = projectQuery.data?.client_profile ?? NaN;
  const profileQuery = useClientProfile(profileId);

  if (projectQuery.isLoading) {
    return <LoadingSkeleton className="h-48 w-full" />;
  }

  if (projectQuery.error) {
    return <ErrorPanel message={projectQuery.error.message} />;
  }

  if (!projectQuery.data?.client_profile) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow="Client profile"
          title="Client profile is not linked"
          description="Link a client profile to this project to enable variable replacement."
          actions={
            <Button onClick={() => setShowLinkProfile(true)} disabled={!projectQuery.data}>
              Link client profile
            </Button>
          }
        />
        <EmptyState
          title="No client profile assigned"
          description="Assign a client profile on project create/update to enable variable replacement."
        />
        <Modal
          open={showLinkProfile}
          title="Link client profile"
          description="Update project settings to link an existing client profile."
          onClose={() => setShowLinkProfile(false)}
        >
          {projectQuery.data ? (
            <ProjectManagementForm
              project={projectQuery.data}
              onSuccess={() => {
                setShowLinkProfile(false);
              }}
            />
          ) : null}
        </Modal>
      </div>
    );
  }

  if (profileQuery.isLoading) {
    return <LoadingSkeleton className="h-48 w-full" />;
  }

  if (profileQuery.error) {
    return <ErrorPanel message={profileQuery.error.message} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client profile"
        title="Client profile and variable preview"
        description="Manage client fields and preview template variable replacement."
      />
      {profileQuery.data ? <ClientProfileForm initialValue={profileQuery.data} /> : null}
    </div>
  );
}
