import { ProjectPendingActionsScreen } from "@/components/screens/project-pending-actions-screen";

export default async function ProjectPendingActionsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectPendingActionsScreen projectId={Number(projectId)} />;
}
